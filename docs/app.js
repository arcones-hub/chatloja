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
const profileStatusBadge = document.getElementById("profileStatusBadge");
const avatarInput = document.getElementById("avatarInput");
const profileAvatar = document.getElementById("profileAvatar");
const profileAvatarFallback = document.getElementById("profileAvatarFallback");
const statusSelect = document.getElementById("statusSelect");
const themeButtons = document.querySelectorAll(".theme-btn");
const adminPanel = document.getElementById("adminPanel");
const userForm = document.getElementById("userForm");
const newUserName = document.getElementById("newUserName");
const newUserEmail = document.getElementById("newUserEmail");
const newUserUsername = document.getElementById("newUserUsername");
const newUserPassword = document.getElementById("newUserPassword");
const newUserRole = document.getElementById("newUserRole");
const usersList = document.getElementById("usersList");
const logoutButtons = document.querySelectorAll(".logout-btn");
const appRoot = document.getElementById("app");
const messageTools = document.getElementById("messageTools");
const emojiButtons = document.querySelectorAll(".emoji-btn");
const gifInput = document.getElementById("gifInput");
const gifClearBtn = document.getElementById("gifClearBtn");

const authGate = document.getElementById("authGate");
const authForm = document.getElementById("authForm");
const authUserInput = document.getElementById("authUser");
const authPassInput = document.getElementById("authPass");
const authError = document.getElementById("authError");

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
  if (loginForm) loginForm.querySelector("button").disabled = true;
  if (roomForm) roomForm.querySelector("button").disabled = true;
}

if (firebaseReady) {
  const firebaseApp = firebase.initializeApp(window.firebaseConfig);
  const db = firebase.firestore(firebaseApp);
  roomsRef = db.collection("rooms");
  serverTimestamp = firebase.firestore.FieldValue.serverTimestamp;
}

const defaultUsers = [
  {
    username: "admin",
    password: "guima00ads",
    name: "Administrador",
    email: "arconesgp@hotmail.com",
    role: "admin"
  }
];

function saveUsers(users) {
  localStorage.setItem("chatUsers", JSON.stringify(users));
}

function loadUsers() {
  const raw = localStorage.getItem("chatUsers");
  if (!raw) {
    saveUsers(defaultUsers);
    return [...defaultUsers];
  }
  try {
    const data = JSON.parse(raw);
    if (!Array.isArray(data) || data.length === 0) {
      saveUsers(defaultUsers);
      return [...defaultUsers];
    }
    const hasAdmin = data.some((user) => user.role === "admin");
    if (!hasAdmin) {
      data.push(defaultUsers[0]);
      saveUsers(data);
    }
    return data;
  } catch {
    saveUsers(defaultUsers);
    return [...defaultUsers];
  }
}

const defaultProfile = {
  status: "online",
  theme: "blue",
  avatar: ""
};

function saveUser(user) {
  localStorage.setItem("chatUser", JSON.stringify(user));
}

function saveAuth(user) {
  localStorage.setItem("chatAuth", JSON.stringify({ username: user.username }));
}

function loadAuth() {
  const raw = localStorage.getItem("chatAuth");
  if (!raw) return null;
  try {
    const data = JSON.parse(raw);
    if (!data?.username) return null;
    return loadUsers().find((user) => user.username === data.username) || null;
  } catch {
    return null;
  }
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

function saveProfile(settings) {
  localStorage.setItem("chatProfile", JSON.stringify(settings));
}

function loadProfile() {
  const raw = localStorage.getItem("chatProfile");
  if (!raw) return { ...defaultProfile };
  try {
    return { ...defaultProfile, ...JSON.parse(raw) };
  } catch {
    return { ...defaultProfile };
  }
}

function applyTheme(theme) {
  document.body.classList.toggle("theme-light", theme === "light");
  themeButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.theme === theme);
  });
}

function applyStatus(status) {
  if (!profileStatusBadge) return;
  profileStatusBadge.textContent =
    status === "ausente" ? "Ausente" : status === "offline" ? "Offline" : "Online";
  profileStatusBadge.classList.toggle("ausente", status === "ausente");
  profileStatusBadge.classList.toggle("offline", status === "offline");
  userStatus.textContent = `Conectado como ${currentUser?.name || ""} • ${profileStatusBadge.textContent}`;
}

function applyAvatar(avatar, name) {
  const initials = name
    ? name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";
  if (profileAvatarFallback) {
    profileAvatarFallback.textContent = initials;
  }
  if (profileAvatar) {
    if (avatar) {
      profileAvatar.src = avatar;
      profileAvatar.hidden = false;
      profileAvatarFallback.hidden = true;
    } else {
      profileAvatar.hidden = true;
      profileAvatarFallback.hidden = false;
    }
  }
}

function applyProfileSettings(settings) {
  if (statusSelect) statusSelect.value = settings.status;
  applyTheme(settings.theme);
  applyStatus(settings.status);
  applyAvatar(settings.avatar, currentUser?.name);
}

function setLoggedIn(user) {
  currentUser = user;
  if (loginForm) loginForm.hidden = true;
  profileView.hidden = false;
  profileName.textContent = user.name;
  profileEmail.textContent = user.email || "";
  userStatus.textContent = `Conectado como ${user.name}`;
  const settings = loadProfile();
  applyProfileSettings(settings);
  updateAdminUi();
  setLogoutButtonsVisible(true);
}

function setLoggedOut() {
  currentUser = null;
  if (loginForm) loginForm.hidden = true;
  profileView.hidden = true;
  userStatus.textContent = "";
  leaveCurrentRoom();
  disableChat();
  localStorage.removeItem("chatUser");
  localStorage.removeItem("chatAuth");
  setLogoutButtonsVisible(false);
  updateAdminUi();
  showAuthGate();
}

function renderRooms() {
  roomsList.innerHTML = "";
  rooms.forEach((room) => {
    const row = document.createElement("div");
    row.className = "room-row";

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = room === currentRoom ? "room active" : "room";
    btn.textContent = room;
    btn.addEventListener("click", () => joinRoom(room));
    row.appendChild(btn);

    if (isAdmin()) {
      const del = document.createElement("button");
      del.type = "button";
      del.className = "room-delete";
      del.textContent = "Excluir";
      del.addEventListener("click", () => deleteRoom(room));
      row.appendChild(del);
    }

    roomsList.appendChild(row);
  });
}

function appendMessage({ senderName, text, createdAt, system, gifUrl }) {
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

  if (gifUrl) {
    const gif = document.createElement("img");
    gif.src = gifUrl;
    gif.alt = "GIF";
    gif.className = "message-gif";
    gif.loading = "lazy";
    body.appendChild(document.createElement("br"));
    body.appendChild(gif);
  }

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
  if (gifInput) gifInput.disabled = false;
  if (gifClearBtn) gifClearBtn.disabled = false;
  emojiButtons.forEach((button) => (button.disabled = false));
}

function disableChat() {
  roomTitle.textContent = "Selecione uma sala";
  roomSubtitle.textContent = "";
  messageInput.disabled = true;
  messageForm.querySelector("button").disabled = true;
  if (gifInput) gifInput.disabled = true;
  if (gifClearBtn) gifClearBtn.disabled = true;
  emojiButtons.forEach((button) => (button.disabled = true));
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
          system: data.system,
          gifUrl: data.gifUrl
        });
      });
    });
}

async function sendMessage(text) {
  if (!firebaseReady) return;
  if (!currentRoom || !currentUser) return;
  const gifUrl = gifInput?.value.trim();
  await roomsRef
    .doc(currentRoom)
    .collection("messages")
    .add({
      senderName: currentUser.name,
      senderEmail: currentUser.email || "",
      text,
      gifUrl: gifUrl || "",
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

function showAuthGate() {
  if (!authGate) return;
  authGate.hidden = false;
  authGate.style.display = "flex";
  appRoot.classList.add("app-locked");
  appRoot.hidden = true;
  appRoot.style.display = "none";
}

function hideAuthGate() {
  if (!authGate) return;
  authGate.hidden = true;
  authGate.style.display = "none";
  appRoot.classList.remove("app-locked");
  appRoot.hidden = false;
  appRoot.style.display = "";
}

function showAuthError(message) {
  if (!authError) return;
  authError.textContent = message;
  authError.hidden = false;
}

function handleAuthSuccess(user) {
  hideAuthGate();
  if (authError) authError.hidden = true;
  saveAuth(user);
  saveUser({ name: user.name, email: user.email, role: user.role });
  setLoggedIn({ name: user.name, email: user.email, role: user.role });
}

function isAdmin() {
  return currentUser?.role === "admin";
}

function updateAdminUi() {
  const admin = isAdmin();
  if (adminPanel) adminPanel.hidden = !admin;
  if (roomInput) roomInput.disabled = !admin;
  if (roomForm) roomForm.querySelector("button").disabled = !admin;
  if (admin) {
    renderUsers();
  } else if (usersList) {
    usersList.innerHTML = "";
  }
  renderRooms();
}

function renderUsers() {
  if (!usersList) return;
  const users = loadUsers();
  usersList.innerHTML = "";
  users.forEach((user) => {
    const row = document.createElement("div");
    row.className = "user-row";

    const info = document.createElement("span");
    info.textContent = `${user.name} • ${user.email} (${user.role})`;
    row.appendChild(info);

    const actions = document.createElement("div");
    actions.className = "user-actions";

    const view = document.createElement("button");
    view.type = "button";
    view.className = "user-view";
    view.textContent = "Ver senha";
    view.addEventListener("click", () => showUserPassword(user.username));
    actions.appendChild(view);

    const edit = document.createElement("button");
    edit.type = "button";
    edit.className = "user-edit";
    edit.textContent = "Alterar senha";
    edit.addEventListener("click", () => updateUserPassword(user.username));
    actions.appendChild(edit);

    const del = document.createElement("button");
    del.type = "button";
    del.className = "user-delete";
    del.textContent = "Excluir";
    del.disabled = user.username === "admin";
    del.addEventListener("click", () => removeUser(user.username));
    actions.appendChild(del);

    row.appendChild(actions);
    usersList.appendChild(row);
  });
}

function addUser(user) {
  const users = loadUsers();
  const exists = users.some(
    (item) => item.username === user.username || item.email === user.email
  );
  if (exists) {
    alert("Usuário ou e-mail já existe.");
    return false;
  }
  users.push(user);
  saveUsers(users);
  return true;
}

function showUserPassword(username) {
  const users = loadUsers();
  const target = users.find((user) => user.username === username);
  if (!target) return;
  alert(`Senha de ${target.username}: ${target.password}`);
}

function updateUserPassword(username) {
  const users = loadUsers();
  const target = users.find((user) => user.username === username);
  if (!target) return;
  const nextPassword = prompt(`Nova senha para ${target.username}:`, "");
  if (!nextPassword) return;
  target.password = nextPassword;
  saveUsers(users);
  renderUsers();
}

function removeUser(username) {
  if (username === "admin") return;
  const users = loadUsers().filter((user) => user.username !== username);
  saveUsers(users);
  renderUsers();
}

async function deleteRoom(room) {
  if (!isAdmin()) return;
  if (!confirm(`Excluir a sala "${room}"?`)) return;
  if (!firebaseReady) return;

  if (currentRoom === room) {
    leaveCurrentRoom();
  }

  const messagesRef = roomsRef.doc(room).collection("messages");
  const batchSize = 50;
  let snapshot = await messagesRef.limit(batchSize).get();
  while (!snapshot.empty) {
    const batch = roomsRef.firestore.batch();
    snapshot.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
    snapshot = await messagesRef.limit(batchSize).get();
  }
  await roomsRef.doc(room).delete();
}

function setLogoutButtonsVisible(isVisible) {
  logoutButtons.forEach((button) => {
    button.hidden = !isVisible;
  });
}

if (loginForm) {
  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (authGate && !authGate.hidden) return;
    const name = document.getElementById("nameInput").value.trim();
    const email = document.getElementById("emailInput").value.trim();
    if (!name) return;
    const user = { name, email };
    saveUser(user);
    setLoggedIn(user);
  });
}

if (authForm) {
  authForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const username = authUserInput.value.trim();
    const password = authPassInput.value;
    const found = loadUsers().find((user) => {
      const loginId = username.toLowerCase();
      return (
        (user.username.toLowerCase() === loginId || user.email.toLowerCase() === loginId) &&
        user.password === password
      );
    });
    if (!found) {
      showAuthError("Usuário ou senha inválidos.");
      return;
    }
    handleAuthSuccess(found);
    authUserInput.value = "";
    authPassInput.value = "";
  });
}

emojiButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (messageInput.disabled) return;
    const emoji = button.dataset.emoji || "";
    messageInput.value += emoji;
    messageInput.focus();
  });
});

if (gifClearBtn) {
  gifClearBtn.addEventListener("click", () => {
    if (gifInput) gifInput.value = "";
  });
}

if (userForm) {
  userForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!isAdmin()) return;
    const user = {
      name: newUserName.value.trim(),
      email: newUserEmail.value.trim(),
      username: newUserUsername.value.trim(),
      password: newUserPassword.value,
      role: newUserRole.value
    };
    if (!user.name || !user.email || !user.username || !user.password) return;
    const created = addUser(user);
    if (created) {
      newUserName.value = "";
      newUserEmail.value = "";
      newUserUsername.value = "";
      newUserPassword.value = "";
      newUserRole.value = "user";
      renderUsers();
    }
  });
}

if (statusSelect) {
  statusSelect.addEventListener("change", () => {
    const settings = loadProfile();
    settings.status = statusSelect.value;
    saveProfile(settings);
    applyStatus(settings.status);
  });
}

themeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const theme = button.dataset.theme || "blue";
    const settings = loadProfile();
    settings.theme = theme;
    saveProfile(settings);
    applyTheme(theme);
  });
});

if (avatarInput) {
  avatarInput.addEventListener("change", () => {
    const file = avatarInput.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const settings = loadProfile();
      settings.avatar = String(reader.result || "");
      saveProfile(settings);
      applyAvatar(settings.avatar, currentUser?.name);
    };
    reader.readAsDataURL(file);
  });
}

logoutButtons.forEach((button) => {
  button.addEventListener("click", () => setLoggedOut());
});

roomForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!firebaseReady || !isAdmin()) return;
  const value = roomInput.value.trim().toLowerCase();
  if (!value) return;
  if (!rooms.includes(value)) {
    await ensureRoom(value);
  }
  roomInput.value = "";
  joinRoom(value);
});

messageForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!firebaseReady) return;
  const text = messageInput.value.trim();
  const gifUrl = gifInput?.value.trim();
  if ((!text && !gifUrl) || !currentRoom || !currentUser) return;
  sendMessage(text);
  messageInput.value = "";
  if (gifInput) gifInput.value = "";
});

async function bootstrapRooms() {
  if (!firebaseReady) return;
  for (const room of roomsSeed) {
    await ensureRoom(room);
  }
  listenRooms();
}

bootstrapRooms();

if (loginForm) loginForm.hidden = true;
setLogoutButtonsVisible(false);
updateAdminUi();
const savedAuth = loadAuth();
if (savedAuth) {
  handleAuthSuccess(savedAuth);
} else {
  showAuthGate();
}
