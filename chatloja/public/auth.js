// auth.js - Responsável por autenticação Firebase e manipulação de usuário

// Inicialização do Firebase Auth
let firebaseAuth = null;
if (window.firebaseConfig && firebase) {
  firebaseAuth = firebase.auth();
}

// Função para login
async function loginWithEmail(email, password) {
  if (!firebaseAuth) throw new Error('Firebase Auth não inicializado');
  return firebaseAuth.signInWithEmailAndPassword(email, password);
}

// Função para registro
async function registerWithEmail(email, password, name, usersRef, serverTimestamp) {
  if (!firebaseAuth) throw new Error('Firebase Auth não inicializado');
  const userCredential = await firebaseAuth.createUserWithEmailAndPassword(email, password);
  const user = userCredential.user;
  await user.updateProfile({ displayName: name });
  await usersRef.doc(user.uid).set({
    name,
    email,
    role: 'user',
    username: email,
    usernameLower: email.toLowerCase(),
    createdAt: serverTimestamp(),
    status: 'offline',
    avatar: ''
  });
  return user;
}

// Função para logout
async function logout() {
  if (firebaseAuth) await firebaseAuth.signOut();
}

// Exporta funções para uso em app.js
window.authModule = {
  loginWithEmail,
  registerWithEmail,
  logout
};
