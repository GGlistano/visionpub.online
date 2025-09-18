// 🎛️ DASHBOARD - GERADOR DE CHECKOUTS - VERSÃO 2.0
console.log('🚀 Carregando Dashboard v2.0...');
console.log('📅 Timestamp:', new Date().toISOString());

// Verificar se config foi carregado
if (typeof firebaseConfig === 'undefined') {
    console.error('❌ Config não carregado! Verifique config.js');
    alert('❌ Erro: Configurações não carregadas!');
}

// Inicializar Firebase
firebase.initializeApp(Config);
const db = firebase.firestore();
const auth = firebase.auth();

console.log('🔥 Firebase inicializado');
console.log('🌐 Backend URL:', API_BASE_URL);

// Estado da aplicação
let products = [];
let currentStep = 1;
let editingProductId = null;

const dashboard = document.getElementById('dashboard');

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

// Image elements
const productImage = document.getElementById('product-image');
const imagePreview = document.getElementById('image-preview');
const previewImg = document.getElementById('preview-img');
const uploadBtn = document.getElementById('upload-btn');
const imageUpload = document.getElementById('image-upload');
const uploadProgress = document.getElementById('upload-progress');

// Wizard elements
const step1 = document.getElementById('step-1');
const step2 = document.getElementById('step-2');
const step3 = document.getElementById('step-3');
const nextBtn = document.getElementById('next-btn');
const prevBtn = document.getElementById('prev-btn');
const saveBtn = document.getElementById('save-btn');
const modalTitle = document.getElementById('modal-title');

// Step circles and progress
const step1Circle = document.getElementById('step-1-circle');
const step2Circle = document.getElementById('step-2-circle');
const step3Circle = document.getElementById('step-3-circle');
const progress12 = document.getElementById('progress-1-2');
const progress23 = document.getElementById('progress-2-3');

// Auto-generate fields
const productName = document.getElementById('product-name');
const checkoutUrl = document.getElementById('checkout-url');

// Summary elements
const summaryName = document.getElementById('summary-name');
const summaryPrice = document.getElementById('summary-price');
const summaryPrefix = document.getElementById('summary-prefix');
const summaryUrl = document.getElementById('summary-url');
const summaryTimer = document.getElementById('summary-timer');

console.log('📋 Elementos DOM carregados');

// ===== EVENT LISTENERS =====

// Carregar dados automaticamente
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎛️ Dashboard v2.0 carregado!');
    loadDashboardData();
});

// Modal controls
newProductBtn.addEventListener('click', () => {
    console.log('➕ Abrindo modal para novo produto');
    editingProductId = null;
    modalTitle.textContent = '➕ Criar Novo Produto';
    resetWizard();
    productModal.classList.remove('hidden');
    productModal.classList.add('flex');
});

closeModal.addEventListener('click', closeProductModal);
cancelBtn.addEventListener('click', closeProductModal);

// Timer toggle
timerEnabled.addEventListener('change', (e) => {
    console.log('⏰ Timer toggled:', e.target.checked);
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
    console.log('🔗 URL gerada:', name);
});

// Image preview
productImage.addEventListener('input', (e) => {
    const url = e.target.value.trim();
    console.log('🖼️ URL da imagem inserida:', url);
    if (url && isValidUrl(url)) {
        showImagePreview(url);
    } else {
        hideImagePreview();
    }
});

// Upload de imagem
uploadBtn.addEventListener('click', () => {
    console.log('📁 Abrindo seletor de arquivo');
    imageUpload.click();
});

imageUpload.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    console.log('📤 Arquivo selecionado:', file.name, file.size, 'bytes');
    
    // Validações
    if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione apenas imagens');
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
        alert('Imagem muito grande! Máximo 5MB');
        return;
    }
    
    // Mostrar progresso
    uploadProgress.classList.remove('hidden');
    uploadBtn.disabled = true;
    uploadBtn.textContent = 'Enviando...';
    
    try {
        const formData = new FormData();
        formData.append('image', file);
        
        console.log('📤 Enviando para:', `${API_BASE_URL}/api/upload-image`);
        
        const response = await fetch(`${API_BASE_URL}/api/upload-image`, {
            method: 'POST',
            body: formData
        });
        
        console.log('📥 Status da resposta:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Erro HTTP:', response.status, errorText);
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('📥 Resultado:', result);
        
        if (result.status === 'ok') {
            // Atualizar campo URL e preview
            productImage.value = result.imageUrl;
            showImagePreview(result.imageUrl);
            alert('✅ Imagem enviada com sucesso!');
        } else {
            throw new Error(result.message || 'Erro no upload');
        }
        
    } catch (error) {
        console.error('❌ Erro no upload:', error);
        alert('❌ Erro ao enviar imagem: ' + error.message);
    } finally {
        uploadProgress.classList.add('hidden');
        uploadBtn.disabled = false;
        uploadBtn.textContent = '📁 Escolher Arquivo';
        imageUpload.value = '';
    }
});

// Wizard navigation
nextBtn.addEventListener('click', () => {
    console.log('➡️ Próxima etapa solicitada');
    if (validateCurrentStep()) {
        goToNextStep();
    }
});

prevBtn.addEventListener('click', () => {
    console.log('⬅️ Etapa anterior solicitada');
    goToPreviousStep();
});

// Product form submit
productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('💾 Salvando produto...');
    if (editingProductId) {
        await updateProduct();
    } else {
        await createProduct();
    }
});

// Success modal controls
document.getElementById('close-success-modal').addEventListener('click', () => {
    successModal.classList.add('hidden');
    successModal.classList.remove('flex');
    closeProductModal();
    loadDashboardData();
});

document.getElementById('copy-url-btn').addEventListener('click', () => {
    const url = document.getElementById('checkout-url-display').textContent;
    navigator.clipboard.writeText(url);
    
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

console.log('🎯 Event listeners configurados');

// ===== WIZARD FUNCTIONS =====

function resetWizard() {
    console.log('🔄 Resetando wizard');
    currentStep = 1;
    updateWizardUI();
    productForm.reset();
    hideImagePreview();
    timerConfig.classList.add('hidden');
    timerEnabled.checked = false;
}

function updateWizardUI() {
    console.log('🎨 Atualizando UI do wizard - Etapa:', currentStep);
    
    // Hide all steps
    step1.classList.remove('active');
    step2.classList.remove('active');
    step3.classList.remove('active');
    
    // Show current step
    document.getElementById(`step-${currentStep}`).classList.add('active');
    
    // Update circles and progress
    updateProgressBar();
    
    // Update buttons
    prevBtn.classList.toggle('hidden', currentStep === 1);
    nextBtn.classList.toggle('hidden', currentStep === 3);
    saveBtn.classList.toggle('hidden', currentStep !== 3);
    
    // Update summary if on step 3
    if (currentStep === 3) {
        updateSummary();
    }
}

function updateProgressBar() {
    console.log('📊 Atualizando barra de progresso');
    
    // Reset all circles
    [step1Circle, step2Circle, step3Circle].forEach(circle => {
        circle.classList.remove('bg-blue-600', 'text-white');
        circle.classList.add('bg-gray-200', 'text-gray-600');
    });
    
    // Reset progress bars
    progress12.classList.remove('bg-blue-600');
    progress23.classList.remove('bg-blue-600');
    progress12.classList.add('bg-gray-200');
    progress23.classList.add('bg-gray-200');
    
    // Update current and completed steps
    for (let i = 1; i <= currentStep; i++) {
        const circle = document.getElementById(`step-${i}-circle`);
        circle.classList.remove('bg-gray-200', 'text-gray-600');
        circle.classList.add('bg-blue-600', 'text-white');
    }
    
    // Update progress bars
    if (currentStep >= 2) {
        progress12.classList.remove('bg-gray-200');
        progress12.classList.add('bg-blue-600');
    }
    if (currentStep >= 3) {
        progress23.classList.remove('bg-gray-200');
        progress23.classList.add('bg-blue-600');
    }
}

function validateCurrentStep() {
    console.log('✅ Validando etapa:', currentStep);
    
    if (currentStep === 1) {
        const name = document.getElementById('product-name').value.trim();
        const price = document.getElementById('product-price').value.trim();
        
        if (!name) {
            alert('Por favor, preencha o nome do produto');
            return false;
        }
        if (!price || isNaN(price) || parseInt(price) <= 0) {
            alert('Por favor, preencha um preço válido');
            return false;
        }
        console.log('✅ Etapa 1 válida');
        return true;
    }
    
    if (currentStep === 2) {
        const orderPrefix = document.getElementById('order-prefix').value.trim();
        const checkoutUrlValue = document.getElementById('checkout-url').value.trim();
        
        if (!orderPrefix) {
            alert('Por favor, preencha o prefixo do OrderID');
            return false;
        }
        if (!checkoutUrlValue) {
            alert('Por favor, preencha a URL do checkout');
            return false;
        }
        console.log('✅ Etapa 2 válida');
        return true;
    }
    
    return true;
}

function goToNextStep() {
    if (currentStep < 3) {
        currentStep++;
        console.log('➡️ Avançando para etapa:', currentStep);
        updateWizardUI();
    }
}

function goToPreviousStep() {
    if (currentStep > 1) {
        currentStep--;
        console.log('⬅️ Voltando para etapa:', currentStep);
        updateWizardUI();
    }
}

function updateSummary() {
    console.log('📋 Atualizando resumo');
    summaryName.textContent = document.getElementById('product-name').value || '-';
    summaryPrice.textContent = document.getElementById('product-price').value ? 
        `${document.getElementById('product-price').value} MZN` : '-';
    summaryPrefix.textContent = document.getElementById('order-prefix').value || '-';
    summaryUrl.textContent = document.getElementById('checkout-url').value ? 
        `visionpub.online/checkout/${document.getElementById('checkout-url').value}` : '-';
    
    const timerText = timerEnabled.checked ? 
        `${document.getElementById('timer-minutes').value || 10} minutos` : 'Desativado';
    summaryTimer.textContent = timerText;
}

// ===== UTILITY FUNCTIONS =====

function closeProductModal() {
    console.log('❌ Fechando modal');
    productModal.classList.add('hidden');
    productModal.classList.remove('flex');
    resetWizard();
    editingProductId = null;
}

function showLoading() {
    console.log('⏳ Mostrando loading');
    loadingOverlay.classList.remove('hidden');
    loadingOverlay.classList.add('flex');
}

function hideLoading() {
    console.log('✅ Escondendo loading');
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

function showImagePreview(url) {
    console.log('🖼️ Mostrando preview da imagem:', url);
    previewImg.src = url;
    previewImg.onload = () => {
        imagePreview.classList.remove('hidden');
        console.log('✅ Preview carregado');
    };
    previewImg.onerror = () => {
        hideImagePreview();
        console.log('❌ Erro ao carregar preview');
    };
}

function hideImagePreview() {
    console.log('❌ Escondendo preview');
    imagePreview.classList.add('hidden');
}

// ===== DATA FUNCTIONS =====

async function loadDashboardData() {
    console.log('📊 Carregando dados do dashboard');
    try {
        const productsSnapshot = await db.collection('products').orderBy('createdAt', 'desc').get();
        products = [];
        productsSnapshot.forEach(doc => {
            products.push({ id: doc.id, ...doc.data() });
        });
        
        console.log('📦 Produtos carregados:', products.length);
        updateStats();
        renderProducts();
        
    } catch (error) {
        console.error('❌ Erro ao carregar dados:', error);
    }
}

async function updateStats() {
    console.log('📈 Atualizando estatísticas');
    try {
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
        
        totalProducts.textContent = products.length;
        totalSales.textContent = monthSales;
        totalRevenue.textContent = `${monthRevenue.toLocaleString()} MZN`;
        
        const conversionRateValue = products.length > 0 ? 
            ((monthSales / (products.length * 100)) * 100).toFixed(1) : 0;
        conversionRate.textContent = `${conversionRateValue}%`;
        
        console.log('📊 Stats:', { products: products.length, sales: monthSales, revenue: monthRevenue });
        
    } catch (error) {
        console.error('❌ Erro ao calcular estatísticas:', error);
    }
}

function renderProducts() {
    console.log('🎨 Renderizando produtos');
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
                        ✏️
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

// ===== PRODUCT FUNCTIONS =====

async function createProduct() {
    console.log('💾 Criando produto...');
    const formData = {
        name: document.getElementById('product-name').value.trim(),
        price: parseInt(document.getElementById('product-price').value),
        description: document.getElementById('product-description').value.trim(),
        image: document.getElementById('product-image').value.trim(),
        orderPrefix: document.getElementById('order-prefix').value.trim(),
        checkoutUrl: document.getElementById('checkout-url').value.trim(),
        utmifyAccount: document.getElementById('utmify-account').value,
        redirectUrl: document.getElementById('redirect-url').value.trim(),
        reference: document.getElementById('product-name').value.toLowerCase().replace(/\s+/g, '-'),
        timer: {
            enabled: timerEnabled.checked,
            minutes: parseInt(document.getElementById('timer-minutes').value) || 10,
            text: document.getElementById('timer-text').value.trim()
        },
        currency: 'MZN',
        active: true
    };
    
    console.log('📋 Dados do produto:', formData);
    
    if (!formData.name || !formData.price || !formData.orderPrefix || !formData.checkoutUrl) {
        alert('Por favor, preencha todos os campos obrigatórios');
        return;
    }
    
    showLoading();
    
    try {
        console.log('📤 Enviando para:', `${API_BASE_URL}/api/create-product`);
        
        const response = await fetch(`${API_BASE_URL}/api/create-product`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        console.log('📥 Status:', response.status);
        
        const result = await response.json();
        console.log('📥 Resultado:', result);
        
        if (result.status === 'ok') {
            hideLoading();
            
            const checkoutUrl = `https://visionpub.online/checkout/${formData.checkoutUrl}/`;
            document.getElementById('checkout-url-display').textContent = checkoutUrl;
            successModal.classList.remove('hidden');
            successModal.classList.add('flex');
            
            console.log('✅ Produto criado com sucesso!');
            
        } else {
            throw new Error(result.message || 'Erro ao criar produto');
        }
        
    } catch (error) {
        hideLoading();
        console.error('❌ Erro ao criar produto:', error);
        alert('❌ Erro ao criar produto: ' + error.message);
    }
}

async function editProduct(productId) {
    console.log('✏️ Editando produto:', productId);
    try {
        const product = products.find(p => p.id === productId);
        if (!product) return;
        
        editingProductId = productId;
        modalTitle.textContent = '✏️ Editar Produto';
        
        // Preencher formulário
        document.getElementById('product-name').value = product.name || '';
        document.getElementById('product-price').value = product.price || '';
        document.getElementById('product-description').value = product.description || '';
        document.getElementById('product-image').value = product.image || '';
        document.getElementById('order-prefix').value = product.orderPrefix || '';
        document.getElementById('checkout-url').value = product.checkoutUrl || '';
        document.getElementById('utmify-account').value = product.utmifyAccount || 'conta1';
        document.getElementById('redirect-url').value = product.redirectUrl || '';
        
        // Timer
        if (product.timer && product.timer.enabled) {
            timerEnabled.checked = true;
            timerConfig.classList.remove('hidden');
            document.getElementById('timer-minutes').value = product.timer.minutes || 10;
            document.getElementById('timer-text').value = product.timer.text || '⚠ Esta oferta expira em';
        }
        
        // Preview da imagem
        if (product.image) {
            showImagePreview(product.image);
        }
        
        resetWizard();
        productModal.classList.remove('hidden');
        productModal.classList.add('flex');
        
        console.log('✅ Produto carregado para edição');
        
    } catch (error) {
        console.error('❌ Erro ao carregar produto para edição:', error);
        alert('❌ Erro ao carregar produto');
    }
}

async function updateProduct() {
    console.log('🔄 Atualizando produto:', editingProductId);
    const formData = {
        name: document.getElementById('product-name').value.trim(),
        price: parseInt(document.getElementById('product-price').value),
        description: document.getElementById('product-description').value.trim(),
        image: document.getElementById('product-image').value.trim(),
        orderPrefix: document.getElementById('order-prefix').value.trim(),
        checkoutUrl: document.getElementById('checkout-url').value.trim(),
        utmifyAccount: document.getElementById('utmify-account').value,
        redirectUrl: document.getElementById('redirect-url').value.trim(),
        reference: document.getElementById('product-name').value.toLowerCase().replace(/\s+/g, '-'),
        timer: {
            enabled: timerEnabled.checked,
            minutes: parseInt(document.getElementById('timer-minutes').value) || 10,
            text: document.getElementById('timer-text').value.trim()
        },
        updatedAt: new Date()
    };
    
    showLoading();
    
    try {
        await db.collection('products').doc(editingProductId).update(formData);
        
        hideLoading();
        alert('✅ Produto atualizado com sucesso!');
        closeProductModal();
        loadDashboardData();
        
        console.log('✅ Produto atualizado');
        
    } catch (error) {
        hideLoading();
        console.error('❌ Erro ao atualizar produto:', error);
        alert('❌ Erro ao atualizar produto: ' + error.message);
    }
}

async function deleteProduct(productId) {
    console.log('🗑️ Solicitação para excluir produto:', productId);
    if (confirm('❌ Tem certeza que deseja excluir este produto?')) {
        try {
            await db.collection('products').doc(productId).delete();
            alert('✅ Produto excluído com sucesso!');
            loadDashboardData();
            console.log('✅ Produto excluído');
        } catch (error) {
            console.error('❌ Erro ao excluir produto:', error);
            alert('❌ Erro ao excluir produto');
        }
    }
}

function viewAnalytics(productId) {
    console.log('📊 Analytics solicitado para:', productId);
    alert('📊 Analytics em desenvolvimento');
}

// Forçar limpeza do cache
console.log('🔄 Limpando cache...');
if ('caches' in window) {
    caches.keys().then(names => {
        names.forEach(name => {
            caches.delete(name);
        });
    });
}

console.log('🎉 Dashboard v2.0 totalmente carregado!');

