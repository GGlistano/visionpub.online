// 🔧 CONFIGURAÇÕES DO DASHBOARD
// 
// INSTRUÇÕES PARA CONFIGURAR:
// 1. Vá no Firebase Console → Project Settings → General
// 2. Copie as configurações do seu projeto
// 3. Substitua os valores abaixo

const firebaseConfig = {
    // 🔥 COLE AQUI SUAS CONFIGURAÇÕES DO FIREBASE
    // Firebase Console → Project Settings → General → Your apps → Web apps
     apiKey: "AIzaSyDJ7lrPXNJdOD_IG0G3JOc_Z8iWehOy48A",
    authDomain: "meu-sistema-cbae7.firebaseapp.com", 
    projectId: "meu-sistema-cbae7",
    storageBucket: "meu-sistema-cbae7.firebasestorage.app",
    messagingSenderId: "471761058858",
    appId: "1:471761058858:web:d37ed5a580614a59c9d753"
};

// URL do seu backend Railway
const API_BASE_URL = 'https://checkout-backenv2-production.up.railway.app';

// Configurações do sistema
const SYSTEM_CONFIG = {
    // Moedas suportadas
    currencies: ['MZN', 'USD'],
    
    // Contas Utmify disponíveis
    utmifyAccounts: {
        'conta1': 'Conta 1 - Padrão',
        'conta2': 'Conta 2 - Secundária'
    },
    
    // Configurações de timer
    timerDefaults: {
        minutes: 10,
        text: '⚠ Esta oferta expira em'
    },
    
    // Validações
    validation: {
        maxImageSize: 5 * 1024 * 1024, // 5MB
        allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
        maxProductNameLength: 100,
        maxDescriptionLength: 500
    }
};

// Export para uso no app.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { firebaseConfig, API_BASE_URL, SYSTEM_CONFIG };
}


