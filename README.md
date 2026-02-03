# Chat Interno

Chat interno simples para comunicação com funcionários usando Firebase (Firestore).

## Configurar Firebase (grátis)

1) Crie um projeto no Firebase.
2) Ative o Firestore (modo de produção ou teste).
3) Crie um app Web no Firebase e copie as credenciais.
4) Edite o arquivo de configuração: [public/firebase-config.js](public/firebase-config.js)
	- Para GitHub Pages, edite também: [docs/firebase-config.js](docs/firebase-config.js)

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

## Colocar online (GitHub Pages)

1) No GitHub, vá em Settings → Pages.
2) Em "Build and deployment", selecione:
	- Source: "Deploy from a branch"
	- Branch: main
	- Folder: /docs
3) Salve. Em alguns minutos, o link do site aparecerá nessa mesma tela.

## Link do sistema (GitHub Pages)

Depois de ativar o Pages, o endereço ficará assim:

```
https://<seu-usuario>.github.io/<nome-do-repositorio>/
```

Substitua os valores e use este link para acessar o sistema pelo GitHub.

Observação:
- A versão para Pages está em [docs/](docs/).
- Para atualizar o site, faça commit e push das alterações em docs/.

## Recursos

- Login simples por nome e e-mail
- Salas padrão e criação de novas salas
- Histórico das últimas mensagens por sala
- Interface moderna e responsiva
