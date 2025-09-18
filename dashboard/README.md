# 🎛️ Dashboard - Gerador de Checkouts

Sistema administrativo para criar e gerenciar checkouts automaticamente.

## 🚀 Como Configurar

### 1. Configurar Firebase
1. Abra o arquivo `config.js`
2. Vá no Firebase Console → Project Settings → General
3. Copie suas configurações e substitua no arquivo

### 2. Criar Usuário Admin
```javascript
// No console do Firebase Authentication, criar usuário:
// Email: admin@seudominio.com
// Senha: sua-senha-segura
```

### 3. Configurar Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Produtos - só usuários autenticados
    match /products/{productId} {
      allow read, write: if request.auth != null;
    }
    
    // Compras - leitura para analytics
    match /compras/{compraId} {
      allow read: if request.auth != null;
      allow write: if true; // Mantém suas regras atuais
    }
  }
}
```

## 📱 Como Usar

### Criar Produto
1. Faça login no dashboard
2. Clique em "Novo Produto"
3. Preencha os dados:
   - Nome e preço
   - URL da imagem (500x500px recomendado)
   - Prefixo do OrderID (ex: VP-, UP1-)
   - URL do checkout (ex: lifeboost)
   - Configurações do timer
4. Clique em "Salvar e Gerar Checkout"

### Resultado
- Produto salvo no Firebase
- Checkout gerado automaticamente
- URL disponível: `visionpub.online/checkout/nome-produto`

## 🔧 Estrutura de Arquivos

```
dashboard/
├── index.html      # Interface principal
├── app.js          # Lógica da aplicação  
├── config.js       # Configurações Firebase
└── README.md       # Este arquivo
```

## 🎯 Funcionalidades

- ✅ Login administrativo
- ✅ Criar produtos
- ✅ Gerar checkouts automaticamente
- ✅ Dashboard com estatísticas
- ✅ Preview de imagens
- ✅ Timer configurável
- ✅ Múltiplas contas Utmify
- 🔄 Analytics (em desenvolvimento)
- 🔄 Edição de produtos (em desenvolvimento)

## 🚨 Importante

- Configure o Firebase antes de usar
- Crie um usuário admin no Authentication
- Mantenha suas credenciais seguras
- Teste em ambiente de desenvolvimento primeiro