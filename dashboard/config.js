// 🔧 CONFIGURAÇÕES DO DASHBOARD
// 
// INSTRUÇÕES PARA CONFIGURAR:
// 1. Vá no Firebase Console → Project Settings → General
// 2. Copie as configurações do seu projeto
// 3. Substitua os valores abaixo

const firebaseConfig = {
    // ⚠️ SUBSTITUA PELOS SEUS DADOS DO FIREBASE
    apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    authDomain: "seu-projeto.firebaseapp.com", 
    projectId: "seu-projeto-id",
    storageBucket: "seu-projeto.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef123456789"
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
