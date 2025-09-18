// 🔧 CONFIGURAÇÕES DO DASHBOARD
// 
// INSTRUÇÕES PARA CONFIGURAR:
// 1. Vá no Firebase Console → Project Settings → General
// 2. Copie as configurações do seu projeto
// 3. Substitua os valores abaixo

const firebaseConfig = {
    // 🔥 COLE AQUI SUAS CONFIGURAÇÕES DO FIREBASE
    // Firebase Console → Project Settings → General → Your apps → Web apps
    apiKey: "SUA_API_KEY_AQUI",
    authDomain: "SEU_PROJETO.firebaseapp.com", 
    projectId: "SEU_PROJECT_ID",
    storageBucket: "SEU_PROJETO.appspot.com",
    messagingSenderId: "SEU_SENDER_ID",
    appId: "SUA_APP_ID"
};

// URL do seu backend Railway
const API_BASE_URL = 'https://checkout-backend-production-b9c7.up.railway.app';

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

