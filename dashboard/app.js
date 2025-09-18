// Configuração Firebase
const firebaseConfig = {
    // 🔥 SUBSTITUA PELAS SUAS CONFIGURAÇÕES DO FIREBASE
    apiKey: "AIzaSyDJ7lrPXNJdOD_IG0G3JOc_Z8iWehOy48A",
    authDomain: "meu-sistema-cbae7.firebaseapp.com", 
    projectId: "meu-sistema-cbae7",
    storageBucket: "meu-sistema-cbae7.firebasestorage.app",
    messagingSenderId: "471761058858",
    appId: "1:471761058858:web:d37ed5a580614a59c9d753"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// URL do seu backend
const API_BASE_URL = 'https://checkout-backenv2-production.up.railway.app';

// Estado da aplicação
let currentUser = null;
let products = [];

// Elementos DOM
const loginScreen = document.getElementById('login-screen');
const dashboard = document.getElementById('dashboard');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');
const userInfo = document.getElementById('user-info');

// Modal elements
const productModal = document.getElementById('product-modal');
const productForm = document.getElementById('product-form');
const newProductBtn = document.getElementById('new-product-btn');
const closeModal = document.getElementById('close-modal');
const cancelBtn = document.getElementById('cancel-btn');

// Loading e Success
const loadingOverlay = document.getElementById('loading-overlay');
const successModal = document.getElementById('success-modal');

// Stats elements
const totalProducts = document.getElementById('total-products');
const totalSales = document.getElementById('total-sales');
const totalRevenue = document.getElementById('total-revenue');
const conversionRate = document.getElementById('conversion-rate');
const productsList = document.getElementById('products-list');

// Timer config
const timerEnabled = document.getElementById('timer-enabled');
const timerConfig = document.getElementById('timer-config');

// Image preview
const productImage = document.getElementById('product-image');
const imagePreview = document.getElementById('image-preview');

// Auto-generate checkout URL from product name
const productName = document.getElementById('product-name');
const checkoutUrl = document.getElementById('checkout-url');

// ===== EVENT LISTENERS =====

// Auth state observer
auth.onAuthStateChanged((user) => {
    if (user) {
        currentUser = user;
        showDashboard();
        loadDashboardData();
    } else {
        currentUser = null;
        showLogin();
    }
});

// Login form
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        await auth.signInWithEmailAndPassword(email, password);
        loginError.classList.add('hidden');
    } catch (error) {
        loginError.textContent = 'Email ou senha incorretos';
        loginError.classList.remove('hidden');
    }
});

// Logout
logoutBtn.addEventListener('click', () => {
    auth.signOut();
});

// Modal controls
newProductBtn.addEventListener('click', () => {
    productModal.classList.remove('hidden');
    productModal.classList.add('flex');
});

closeModal.addEventListener('click', closeProductModal);
cancelBtn.addEventListener('click', closeProductModal);

// Timer toggle
timerEnabled.addEventListener('change', (e) => {
    if (e.target.checked) {
        timerConfig.classList.remove('hidden');
    } else {
        timerConfig.classList.add('hidden');
    }
});

// Auto-generate checkout URL
productName.addEventListener('input', (e) => {
    const name = e.target.value.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .replace(/^-+|-+$/g, '');
    checkoutUrl.value = name;
});

// Image preview
productImage.addEventListener('input', (e) => {
    const url = e.target.value;
    const preview = imagePreview.querySelector('img');
    
    if (url && isValidUrl(url)) {
        preview.src = url;
        imagePreview.classList.remove('hidden');
    } else {
        imagePreview.classList.add('hidden');
    }
});

// Product form submit
productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    await createProduct();
});

// Success modal controls
document.getElementById('close-success-modal').addEventListener('click', () => {
    successModal.classList.add('hidden');
    successModal.classList.remove('flex');
    closeProductModal();
    loadDashboardData(); // Refresh data
});

document.getElementById('copy-url-btn').addEventListener('click', () => {
    const url = document.getElementById('checkout-url-display').textContent;
    navigator.clipboard.writeText(url);
    
    // Visual feedback
    const btn = document.getElementById('copy-url-btn');
    const originalText = btn.textContent;
    btn.textContent = '✅ Copiado!';
    setTimeout(() => {
        btn.textContent = originalText;
    }, 2000);
});

document.getElementById('open-checkout-btn').addEventListener('click', () => {
    const url = document.getElementById('checkout-url-display').textContent;
    window.open(url, '_blank');
});

// ===== FUNCTIONS =====

function showLogin() {
    loginScreen.classList.remove('hidden');
    dashboard.classList.add('hidden');
}

function showDashboard() {
    loginScreen.classList.add('hidden');
    dashboard.classList.remove('hidden');
    userInfo.textContent = currentUser.email;
}

function closeProductModal() {
    productModal.classList.add('hidden');
    productModal.classList.remove('flex');
    productForm.reset();
    imagePreview.classList.add('hidden');
    timerConfig.classList.add('hidden');
    timerEnabled.checked = false;
}

function showLoading() {
    loadingOverlay.classList.remove('hidden');
    loadingOverlay.classList.add('flex');
}

function hideLoading() {
    loadingOverlay.classList.add('hidden');
    loadingOverlay.classList.remove('flex');
}

function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

async function loadDashboardData() {
    try {
        // Load products
        const productsSnapshot = await db.collection('products').orderBy('createdAt', 'desc').get();
        products = [];
        productsSnapshot.forEach(doc => {
            products.push({ id: doc.id, ...doc.data() });
        });
        
        // Update stats
        updateStats();
        renderProducts();
        
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
    }
}

async function updateStats() {
    try {
        // Get current month sales
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        const salesSnapshot = await db.collection('compras')
            .where('created_at', '>=', startOfMonth)
            .get();
        
        let monthSales = 0;
        let monthRevenue = 0;
        
        salesSnapshot.forEach(doc => {
            const sale = doc.data();
            monthSales++;
            monthRevenue += parseInt(sale.amount || 0);
        });
        
        // Update UI
        totalProducts.textContent = products.length;
        totalSales.textContent = monthSales;
        totalRevenue.textContent = `${monthRevenue.toLocaleString()} MZN`;
        
        // Calculate conversion rate (simplified)
        const conversionRateValue = products.length > 0 ? ((monthSales / (products.length * 100)) * 100).toFixed(1) : 0;
        conversionRate.textContent = `${conversionRateValue}%`;
        
    } catch (error) {
        console.error('Erro ao calcular estatísticas:', error);
    }
}

function renderProducts() {
    if (products.length === 0) {
        productsList.innerHTML = `
            <div class="p-6 text-center text-gray-500">
                <span class="text-4xl mb-4 block">📦</span>
                <p>Nenhum produto criado ainda</p>
                <p class="text-sm">Clique em "Novo Produto" para começar</p>
            </div>
        `;
        return;
    }
    
    productsList.innerHTML = products.map(product => `
        <div class="p-6 hover:bg-gray-50 transition-colors">
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                    <div class="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                        ${product.image ? 
                            `<img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover">` :
                            `<div class="w-full h-full flex items-center justify-center text-gray-400">📷</div>`
                        }
                    </div>
                    <div>
                        <h3 class="font-semibold text-gray-900">${product.name}</h3>
                        <p class="text-sm text-gray-600">${product.price} ${product.currency || 'MZN'}</p>
                        <p class="text-xs text-gray-500">OrderID: ${product.orderPrefix}xxx</p>
                        ${product.checkoutUrl ? 
                            `<p class="text-xs text-blue-600">visionpub.online/checkout/${product.checkoutUrl}</p>` :
                            `<p class="text-xs text-orange-600">Checkout não gerado</p>`
                        }
                    </div>
                </div>
                <div class="flex items-center space-x-2">
                    <span class="px-2 py-1 text-xs rounded-full ${product.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                        ${product.active ? '✅ Ativo' : '❌ Inativo'}
                    </span>
                    <button onclick="viewAnalytics('${product.id}')" 
                            class="p-2 text-gray-400 hover:text-blue-600" title="Analytics">
                        📊
                    </button>
                    <button onclick="editProduct('${product.id}')" 
                            class="p-2 text-gray-400 hover:text-yellow-600" title="Editar">
                        📝
                    </button>
                    <button onclick="deleteProduct('${product.id}')" 
                            class="p-2 text-gray-400 hover:text-red-600" title="Excluir">
                        🗑️
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

async function createProduct() {
    const formData = {
        name: document.getElementById('product-name').value,
        price: parseInt(document.getElementById('product-price').value),
        description: document.getElementById('product-description').value,
        image: document.getElementById('product-image').value,
        orderPrefix: document.getElementById('order-prefix').value,
        checkoutUrl: document.getElementById('checkout-url').value,
        utmifyAccount: document.getElementById('utmify-account').value,
        redirectUrl: document.getElementById('redirect-url').value,
        timer: {
            enabled: document.getElementById('timer-enabled').checked,
            minutes: parseInt(document.getElementById('timer-minutes').value) || 10,
            text: document.getElementById('timer-text').value
        },
        currency: 'MZN',
        active: true,
        createdAt: new Date()
    };
    
    // Validation
    if (!formData.name || !formData.price || !formData.orderPrefix || !formData.checkoutUrl) {
        alert('Por favor, preencha todos os campos obrigatórios');
        return;
    }
    
    showLoading();
    
    try {
        // 1. Save product to Firebase
        const docRef = await db.collection('products').add(formData);
        console.log('Produto salvo no Firebase:', docRef.id);
        
        // 2. Generate checkout via API
        const response = await fetch(`${API_BASE_URL}/api/generate-checkout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                productId: docRef.id
            })
        });
        
        const result = await response.json();
        
        if (result.status === 'ok') {
            // Update product with checkout URL
            await docRef.update({
                generatedCheckoutUrl: result.checkoutUrl,
                generatedAt: new Date()
            });
            
            hideLoading();
            
            // Show success modal
            document.getElementById('checkout-url-display').textContent = result.checkoutUrl;
            successModal.classList.remove('hidden');
            successModal.classList.add('flex');
            
        } else {
            throw new Error(result.message || 'Erro ao gerar checkout');
        }
        
    } catch (error) {
        hideLoading();
        console.error('Erro ao criar produto:', error);
        alert('Erro ao criar produto: ' + error.message);
    }
}

// Placeholder functions for future implementation
function viewAnalytics(productId) {
    alert('Analytics em desenvolvimento');
}

function editProduct(productId) {
    alert('Edição em desenvolvimento');
}

async function deleteProduct(productId) {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
        try {
            await db.collection('products').doc(productId).delete();
            loadDashboardData();
        } catch (error) {
            console.error('Erro ao excluir produto:', error);
            alert('Erro ao excluir produto');
        }
    }
}

// Initialize app
console.log('🎛️ Dashboard carregado!');
console.log('🔥 Firebase inicializado');
console.log('🚀 Conectando com:', API_BASE_URL);


