const roomsSeed = ["geral"];

const ADMIN_EMAIL = "arconesgp@hotmail.com";
const ADMIN_PASSWORD = "guima00ads";
const ADMIN_NAME = "Administrador";

const loginForm = document.getElementById("loginForm");
const roomForm = document.getElementById("roomForm");
const roomInput = document.getElementById("roomInput");
const roomsList = document.getElementById("roomsList");
const messages = document.getElementById("messages");
const messageForm = document.getElementById("messageForm");
const messageInput = document.getElementById("messageInput");
const roomTitle = document.getElementById("roomTitle");
const roomSubtitle = document.getElementById("roomSubtitle");
const userStatus = document.getElementById("userStatus");
const profileView = document.getElementById("profileView");
const profileName = document.getElementById("profileName");
const profileEmail = document.getElementById("profileEmail");
const logoutBtn = document.getElementById("logoutBtn");
const appRoot = document.getElementById("app");
const loginScreen = document.getElementById("loginScreen");
const emailInput = document.getElementById("emailInput");
const passwordInput = document.getElementById("passwordInput");
const adminPanel = document.getElementById("adminPanel");
const userForm = document.getElementById("userForm");
const userNameInput = document.getElementById("userNameInput");
const userEmailInput = document.getElementById("userEmailInput");
const userPasswordInput = document.getElementById("userPasswordInput");
const usersList = document.getElementById("usersList");

roomForm.hidden = true;
adminPanel.hidden = true;

let currentRoom = "";
let currentUser = null;
let isAdmin = false;
let rooms = [...roomsSeed];
let currentRoomUnsub = null;
let usersUnsub = null;

const firebaseReady = Boolean(window.firebaseConfig?.apiKey);
let roomsRef = null;
let usersRef = null;
let serverTimestamp = null;

if (!firebaseReady) {
  userStatus.textContent = "Configure o Firebase em firebase-config.js";
  disableChat();
  loginForm.querySelector("button").disabled = true;
  roomForm.querySelector("button").disabled = true;
}

if (firebaseReady) {
  const firebaseApp = firebase.initializeApp(window.firebaseConfig);
  const db = firebase.firestore(firebaseApp);
  roomsRef = db.collection("rooms");
  usersRef = db.collection("users");
  serverTimestamp = firebase.firestore.FieldValue.serverTimestamp;
}

function saveUser(user) {
  localStorage.setItem("chatUser", JSON.stringify({ email: user.email }));
}

function loadUser() {
  const raw = localStorage.getItem("chatUser");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function setLoggedIn(user) {
  currentUser = user;
  isAdmin = Boolean(user.isAdmin);
  loginScreen.hidden = true;
  appRoot.hidden = false;
  profileName.textContent = user.name;
  profileEmail.textContent = user.email || "";
  userStatus.textContent = `Conectado como ${user.name}`;
  adminPanel.hidden = !isAdmin;
  roomForm.hidden = !isAdmin;
  if (isAdmin) {
    startUsersListener();
  } else {
    stopUsersListener();
  }
}

function setLoggedOut() {
  currentUser = null;
  isAdmin = false;
  loginScreen.hidden = false;
  appRoot.hidden = true;
  userStatus.textContent = "";
  leaveCurrentRoom();
  disableChat();
  localStorage.removeItem("chatUser");
  adminPanel.hidden = true;
  roomForm.hidden = true;
  stopUsersListener();
}

function renderRooms() {
  roomsList.innerHTML = "";
  rooms.forEach((room) => {
    const wrapper = document.createElement("div");
    wrapper.className = "room-item";

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = room === currentRoom ? "room active" : "room";
    btn.textContent = room;
    btn.addEventListener("click", () => joinRoom(room));
    wrapper.appendChild(btn);

    if (isAdmin) {
      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.className = "room-delete";
      removeBtn.textContent = "Excluir";
      removeBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        deleteRoom(room);
      });
      wrapper.appendChild(removeBtn);
    }

    roomsList.appendChild(wrapper);
  });
}

function appendMessage({ senderName, text, createdAt, system }) {
  const item = document.createElement("div");
  item.className = system ? "message system" : "message";

  const header = document.createElement("div");
  header.className = "message-header";

  const name = document.createElement("span");
  name.className = "message-name";
  name.textContent = system ? "Sistema" : senderName;

  const time = document.createElement("span");
  time.className = "message-time";
  const timestamp = createdAt?.toMillis ? createdAt.toMillis() : createdAt;
  time.textContent = new Date(timestamp || Date.now()).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit"
  });

  const body = document.createElement("div");
  body.className = "message-body";
  body.textContent = text;

  header.appendChild(name);
  header.appendChild(time);
  item.appendChild(header);
  item.appendChild(body);
  messages.appendChild(item);
  messages.scrollTop = messages.scrollHeight;
}

function clearMessages() {
  messages.innerHTML = "";
}

function enableChat(room) {
  roomTitle.textContent = `Sala: ${room}`;
  roomSubtitle.textContent = "Histórico das últimas mensagens";
  messageInput.disabled = false;
  messageForm.querySelector("button").disabled = false;
}

function disableChat() {
  roomTitle.textContent = "Selecione uma sala";
  roomSubtitle.textContent = "";
  messageInput.disabled = true;
  messageForm.querySelector("button").disabled = true;
}

function joinRoom(room) {
  if (!firebaseReady) return;
  if (!currentUser) return;
  if (currentRoom === room) return;
  leaveCurrentRoom();
  currentRoom = room;
  clearMessages();
  renderRooms();
  enableChat(room);
  subscribeToRoom(room);
  sendSystemMessage(`${currentUser.name} entrou na sala.`);
}

async function deleteRoom(room) {
  if (!firebaseReady || !isAdmin) return;
  if (!confirm(`Excluir a sala "${room}"?`)) return;
  if (currentRoom === room) {
    leaveCurrentRoom();
    disableChat();
  }
  const roomDoc = roomsRef.doc(room);
  const messagesSnap = await roomDoc.collection("messages").get();
  const batch = roomsRef.firestore.batch();
  messagesSnap.forEach((doc) => batch.delete(doc.ref));
  batch.delete(roomDoc);
  await batch.commit();
}

function leaveCurrentRoom() {
  if (!firebaseReady) return;
  if (!currentRoom || !currentUser) return;
  sendSystemMessage(`${currentUser.name} saiu da sala.`);
  if (currentRoomUnsub) {
    currentRoomUnsub();
    currentRoomUnsub = null;
  }
  currentRoom = "";
  renderRooms();
}

function subscribeToRoom(room) {
  if (!firebaseReady) return;
  if (currentRoomUnsub) {
    currentRoomUnsub();
  }

  currentRoomUnsub = roomsRef
    .doc(room)
    .collection("messages")
    .orderBy("createdAt")
    .limitToLast(50)
    .onSnapshot((snapshot) => {
      clearMessages();
      snapshot.forEach((doc) => {
        const data = doc.data();
        appendMessage({
          senderName: data.senderName,
          text: data.text,
          createdAt: data.createdAt,
          system: data.system
        });
      });
    });
}

async function sendMessage(text) {
  if (!firebaseReady) return;
  if (!currentRoom || !currentUser) return;
  await roomsRef
    .doc(currentRoom)
    .collection("messages")
    .add({
      senderName: currentUser.name,
      senderEmail: currentUser.email || "",
      text,
      system: false,
      createdAt: serverTimestamp()
    });
}

async function sendSystemMessage(text) {
  if (!firebaseReady) return;
  if (!currentRoom) return;
  await roomsRef
    .doc(currentRoom)
    .collection("messages")
    .add({
      senderName: "Sistema",
      senderEmail: "",
      text,
      system: true,
      createdAt: serverTimestamp()
    });
}

async function ensureRoom(name) {
  if (!firebaseReady) return;
  await roomsRef.doc(name).set(
    {
      name,
      createdAt: serverTimestamp()
    },
    { merge: true }
  );
}

function listenRooms() {
  if (!firebaseReady) return;
  roomsRef.orderBy("name").onSnapshot((snapshot) => {
    rooms = snapshot.docs.map((doc) => doc.id);
    renderRooms();
  });
}

function startUsersListener() {
  if (!firebaseReady || !usersRef) return;
  if (usersUnsub) usersUnsub();
  usersUnsub = usersRef.orderBy("name").onSnapshot((snapshot) => {
    const list = snapshot.docs.map((doc) => doc.data());
    renderUsers(list);
  });
}

function stopUsersListener() {
  if (usersUnsub) {
    usersUnsub();
    usersUnsub = null;
  }
  if (usersList) usersList.innerHTML = "";
}

function renderUsers(list) {
  usersList.innerHTML = "";
  if (!list.length) {
    usersList.innerHTML = '<p class="muted">Nenhum usuário cadastrado.</p>';
    return;
  }
  list.forEach((user) => {
    const item = document.createElement("div");
    item.className = "user-row";

    const info = document.createElement("div");
    info.className = "user-info";
    info.textContent = `${user.name} (${user.email})`;

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "user-delete";
    removeBtn.textContent = "Excluir";
    removeBtn.disabled = user.email === ADMIN_EMAIL;
    removeBtn.addEventListener("click", () => deleteUser(user.email));

    item.appendChild(info);
    item.appendChild(removeBtn);
    usersList.appendChild(item);
  });
}

async function deleteUser(email) {
  if (!firebaseReady || !isAdmin) return;
  if (email === ADMIN_EMAIL) return;
  if (!confirm(`Excluir o usuário ${email}?`)) return;
  await usersRef.doc(email).delete();
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!firebaseReady) return;
  const email = emailInput.value.trim().toLowerCase();
  const password = passwordInput.value.trim();
  if (!email || !password) return;

  if (email === ADMIN_EMAIL) {
    if (password !== ADMIN_PASSWORD) {
      userStatus.textContent = "Senha inválida.";
      return;
    }
    const adminUser = { name: ADMIN_NAME, email, isAdmin: true };
    saveUser(adminUser);
    setLoggedIn(adminUser);
    return;
  }

  const userDoc = await usersRef.doc(email).get();
  if (!userDoc.exists) {
    userStatus.textContent = "Usuário não encontrado.";
    return;
  }
  const data = userDoc.data();
  if (data.password !== password) {
    userStatus.textContent = "Senha inválida.";
    return;
  }

  const user = { name: data.name || email, email, isAdmin: false };
  saveUser(user);
  setLoggedIn(user);
});

logoutBtn.addEventListener("click", () => setLoggedOut());

roomForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!firebaseReady || !isAdmin) return;
  const value = roomInput.value.trim().toLowerCase();
  if (!value) return;
  if (!rooms.includes(value)) {
    ensureRoom(value);
  }
  roomInput.value = "";
});

userForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!firebaseReady || !isAdmin) return;
  const name = userNameInput.value.trim();
  const email = userEmailInput.value.trim().toLowerCase();
  const password = userPasswordInput.value.trim();
  if (!name || !email || !password) return;
  if (email === ADMIN_EMAIL) {
    userStatus.textContent = "Este e-mail é reservado.";
    return;
  }
  await usersRef.doc(email).set(
    {
      name,
      email,
      password,
      createdAt: serverTimestamp()
    },
    { merge: true }
  );
  userNameInput.value = "";
  userEmailInput.value = "";
  userPasswordInput.value = "";
});

messageForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!firebaseReady) return;
  const text = messageInput.value.trim();
  if (!text || !currentRoom || !currentUser) return;
  sendMessage(text);
  messageInput.value = "";
});

const savedUser = loadUser();
if (savedUser?.email) {
  emailInput.value = savedUser.email;
}

setLoggedOut();

async function bootstrapRooms() {
  if (!firebaseReady) return;
  for (const room of roomsSeed) {
    await ensureRoom(room);
  }
  listenRooms();
}

bootstrapRooms();
