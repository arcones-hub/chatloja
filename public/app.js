const roomsSeed = ["geral", "atendimento", "suporte", "financeiro"];

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

let currentRoom = "";
let currentUser = null;
let rooms = [...roomsSeed];
let currentRoomUnsub = null;

const firebaseReady = Boolean(window.firebaseConfig?.apiKey);
let roomsRef = null;
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
  serverTimestamp = firebase.firestore.FieldValue.serverTimestamp;
}

function saveUser(user) {
  localStorage.setItem("chatUser", JSON.stringify(user));
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
  loginForm.hidden = true;
  profileView.hidden = false;
  profileName.textContent = user.name;
  profileEmail.textContent = user.email || "";
  userStatus.textContent = `Conectado como ${user.name}`;
}

function setLoggedOut() {
  currentUser = null;
  loginForm.hidden = false;
  profileView.hidden = true;
  userStatus.textContent = "";
  leaveCurrentRoom();
  disableChat();
  localStorage.removeItem("chatUser");
}

function renderRooms() {
  roomsList.innerHTML = "";
  rooms.forEach((room) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = room === currentRoom ? "room active" : "room";
    btn.textContent = room;
    btn.addEventListener("click", () => joinRoom(room));
    roomsList.appendChild(btn);
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

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = document.getElementById("nameInput").value.trim();
  const email = document.getElementById("emailInput").value.trim();
  if (!name) return;
  const user = { name, email };
  saveUser(user);
  setLoggedIn(user);
});

logoutBtn.addEventListener("click", () => setLoggedOut());

roomForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!firebaseReady) return;
  const value = roomInput.value.trim().toLowerCase();
  if (!value) return;
  if (!rooms.includes(value)) {
    ensureRoom(value);
  }
  roomInput.value = "";
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
if (savedUser?.name) {
  setLoggedIn(savedUser);
}

async function bootstrapRooms() {
  if (!firebaseReady) return;
  for (const room of roomsSeed) {
    await ensureRoom(room);
  }
  listenRooms();
}

bootstrapRooms();
