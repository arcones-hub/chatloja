# Chat Interno

Chat interno simples para comunicação com funcionários usando Firebase (Firestore).

## Configurar Firebase (grátis)

1) Crie um projeto no Firebase.
2) Ative o Firestore (modo de produção ou teste).
3) Crie um app Web no Firebase e copie as credenciais.
4) Edite o arquivo de configuração: [public/firebase-config.js](public/firebase-config.js)

### Regras mínimas (teste)

Para desenvolvimento rápido, use regras abertas temporariamente:

```
rules_version = '2';
service cloud.firestore {
	match /databases/{database}/documents {
		match /{document=**} {
			allow read, write: if true;
		}
	}
}
```

Depois, restrinja as regras antes de usar em produção.

## Rodar localmente

1) Instale as dependências:

- `npm install`

2) Inicie o servidor estático:

- `npm start`

3) Acesse no navegador:

- `http://localhost:3000`

## Colocar online (Firebase Hosting)

Você pode hospedar gratuitamente no Firebase Hosting.

Passos básicos:

1) Instale a CLI do Firebase.
2) Rode `firebase login`.
3) Rode `firebase init hosting` (pasta public).
4) Rode `firebase deploy`.

## Recursos

- Login simples por nome e e-mail
- Salas padrão e criação de novas salas
- Histórico das últimas mensagens por sala
- Interface moderna e responsiva
