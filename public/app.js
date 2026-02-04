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
const togglePickerBtn = document.getElementById("togglePickerBtn");
const pickerSearch = document.getElementById("pickerSearch");
const pickerTabs = document.querySelectorAll(".picker-tab");
const pickerGrid = document.getElementById("pickerGrid");
const gifUrlRow = document.getElementById("gifUrlRow");
const gifInput = document.getElementById("gifInput");
const gifSendBtn = document.getElementById("gifSendBtn");
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
let usersRef = null;
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
  usersRef = db.collection("users");
  serverTimestamp = firebase.firestore.FieldValue.serverTimestamp;
}


const defaultAdmin = {
  username: "admin",
  password: "guima00ads",
  name: "Administrador",
  email: "arconesgp@hotmail.com",
  role: "admin",
  usernameLower: "admin",
  emailLower: "arconesgp@hotmail.com"
};

const defaultProfile = {
  status: "online",
  theme: "blue",
  avatar: ""
};

const emojiList = [
  "😀", "😁", "😂", "🤣", "😃", "😄", "😅", "😆", "😉", "😊", "😍", "😘",
  "😎", "🤩", "😭", "😡", "👍", "👎", "🙏", "👏", "🔥", "🎉", "❤️", "💡",
  "💯", "✨", "😴", "😮", "😱", "🤔", "🙌", "🥳", "🤝", "✅", "❌", "⚡"
];

const stickerList = ["😺", "🐶", "🦊", "🐼", "🐸", "🦄", "🐵", "🐧", "🐯", "🐰", "🐻", "🐨"];

const gifList = [
  { url: "https://media.giphy.com/media/5GoVLqeAOo6PK/giphy.gif", tag: "aplausos" },
  { url: "https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif", tag: "ok" },
  { url: "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif", tag: "feliz" },
  { url: "https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif", tag: "surpreso" },
  { url: "https://media.giphy.com/media/111ebonMs90YLu/giphy.gif", tag: "dança" },
  { url: "https://media.giphy.com/media/5VKbvrjxpVJCM/giphy.gif", tag: "risada" },
  { url: "https://media.giphy.com/media/xT9IgG50Fb7Mi0prBC/giphy.gif", tag: "obrigado" },
  { url: "https://media.giphy.com/media/26tOZ42Mg6pbTUPHW/giphy.gif", tag: "cafe" },
  { url: "https://media.giphy.com/media/3o7aD2saalBwwftBIY/giphy.gif", tag: "wow" },
  { url: "https://media.giphy.com/media/l0HlBO7eyXzSZkJri/giphy.gif", tag: "trabalho" },
  { url: "https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif", tag: "joinha" },
  { url: "https://media.giphy.com/media/13HgwGsXF0aiGY/giphy.gif", tag: "tchau" }
];

let activePickerTab = "emoji";
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
    return data;
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

async function ensureAdminUser() {
  if (!firebaseReady || !usersRef) return;
  const docRef = usersRef.doc(defaultAdmin.username);
  const snapshot = await docRef.get();
  if (!snapshot.exists) {
    await docRef.set({
      ...defaultAdmin,
      createdAt: serverTimestamp()
    });
  } else {
    const data = snapshot.data();
    const updates = {};
    if (!data.usernameLower) updates.usernameLower = data.username?.toLowerCase() || "admin";
    if (!data.emailLower) updates.emailLower = data.email?.toLowerCase() || defaultAdmin.email;
    if (Object.keys(updates).length > 0) {
      await docRef.update(updates);
    }
  }
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

function appendMessage({ senderName, text, createdAt, system, gifUrl, sticker }) {
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
  if (text) {
    body.textContent = text;
  }

  if (sticker) {
    const stickerEl = document.createElement("span");
    stickerEl.className = "message-sticker";
    stickerEl.textContent = sticker;
    body.appendChild(stickerEl);
  }

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
  if (togglePickerBtn) togglePickerBtn.disabled = false;
  if (pickerSearch) pickerSearch.disabled = false;
  if (gifInput) gifInput.disabled = false;
  if (gifSendBtn) gifSendBtn.disabled = false;
  if (gifClearBtn) gifClearBtn.disabled = false;
}

function disableChat() {
  roomTitle.textContent = "Selecione uma sala";
  roomSubtitle.textContent = "";
  messageInput.disabled = true;
  messageForm.querySelector("button").disabled = true;
  if (togglePickerBtn) togglePickerBtn.disabled = true;
  if (pickerSearch) pickerSearch.disabled = true;
  if (gifInput) gifInput.disabled = true;
  if (gifSendBtn) gifSendBtn.disabled = true;
  if (gifClearBtn) gifClearBtn.disabled = true;
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
          gifUrl: data.gifUrl,
          sticker: data.sticker
        });
      });
    });
}

async function sendMessage(text, options = {}) {
  if (!firebaseReady) return;
  if (!currentRoom || !currentUser) return;
  const gifUrl = options.gifUrl ?? gifInput?.value.trim();
  const sticker = options.sticker || "";
  if (!text && !gifUrl && !sticker) return;
  await roomsRef
    .doc(currentRoom)
    .collection("messages")
    .add({
      senderName: currentUser.name,
      senderEmail: currentUser.email || "",
      text,
      gifUrl: gifUrl || "",
      sticker,
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

function setActivePickerTab(tab) {
  activePickerTab = tab;
  pickerTabs.forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === tab);
  });
  if (gifUrlRow) gifUrlRow.hidden = tab !== "gif";
  renderPicker();
}

function renderPicker() {
  if (!pickerGrid) return;
  const search = pickerSearch?.value.trim().toLowerCase() || "";
  pickerGrid.innerHTML = "";

  if (activePickerTab === "emoji") {
    emojiList
      .filter((emoji) => (search ? emoji.includes(search) : true))
      .forEach((emoji) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "picker-item";
        btn.textContent = emoji;
        btn.addEventListener("click", () => {
          if (messageInput.disabled) return;
          messageInput.value += emoji;
          messageInput.focus();
        });
        pickerGrid.appendChild(btn);
      });
  }

  if (activePickerTab === "sticker") {
    stickerList
      .filter((sticker) => (search ? sticker.includes(search) : true))
      .forEach((sticker) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "picker-item";
        btn.textContent = sticker;
        btn.addEventListener("click", () => {
          sendMessage("", { sticker });
        });
        pickerGrid.appendChild(btn);
      });
  }

  if (activePickerTab === "gif") {
    gifList
      .filter((gif) => (search ? gif.tag.includes(search) : true))
      .forEach((gif) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "picker-item";
        const img = document.createElement("img");
        img.src = gif.url;
        img.alt = gif.tag;
        btn.appendChild(img);
        btn.addEventListener("click", () => {
          sendMessage("", { gifUrl: gif.url });
        });
        pickerGrid.appendChild(btn);
      });
  }
}

function isAdmin() {
  return currentUser?.role === "admin";
}

function updateAdminUi() {
  const admin = isAdmin();
  if (adminPanel) adminPanel.hidden = !admin;
  if (roomInput) roomInput.disabled = !admin;
  if (roomForm) roomForm.querySelector("button").disabled = !admin;
  if (!admin && usersList) {
    usersList.innerHTML = "";
  }
  renderRooms();
}

function renderUsersFromSnapshot(snapshot) {
  if (!usersList) return;
  usersList.innerHTML = "";
  snapshot.forEach((doc) => {
    const user = doc.data();
    const userDocId = user.usernameLower || user.username || doc.id;
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
    view.addEventListener("click", () => showUserPassword(userDocId));
    actions.appendChild(view);

    const edit = document.createElement("button");
    edit.type = "button";
    edit.className = "user-edit";
    edit.textContent = "Alterar senha";
    edit.addEventListener("click", () => updateUserPassword(userDocId));
    actions.appendChild(edit);

    const del = document.createElement("button");
    del.type = "button";
    del.className = "user-delete";
    del.textContent = "Excluir";
    del.disabled = user.username === "admin";
    del.addEventListener("click", () => removeUser(userDocId));
    actions.appendChild(del);

    usersList.appendChild(row);
  });
}
async function addUser(user) {
  if (!firebaseReady || !usersRef) return false;
  const usernameLower = user.username.toLowerCase();
  const emailLower = user.email.toLowerCase();
  const existingUsername = await usersRef.doc(usernameLower).get();
  if (existingUsername.exists) {
    alert("Usuário já existe.");
    return false;
  }
  const existingEmail = await usersRef.where("emailLower", "==", emailLower).limit(1).get();
  if (!existingEmail.empty) {
    alert("E-mail já existe.");
    return false;
  }
  await usersRef.doc(usernameLower).set({
    ...user,
    usernameLower,
    emailLower,
    createdAt: serverTimestamp()
  });
  return true;
}

async function removeUser(username) {
  if (!firebaseReady || !usersRef) return;
  if (username === "admin") return;
  await usersRef.doc(username).delete();
}

async function showUserPassword(username) {
  if (!firebaseReady || !usersRef) return;
  const snapshot = await usersRef.doc(username).get();
  if (!snapshot.exists) return;
  const target = snapshot.data();
  alert(`Senha de ${target.username}: ${target.password}`);
}

async function updateUserPassword(username) {
  if (!firebaseReady || !usersRef) return;
  const snapshot = await usersRef.doc(username).get();
  if (!snapshot.exists) return;
  const target = snapshot.data();
  const nextPassword = prompt(`Nova senha para ${target.username}:`, "");
  if (!nextPassword) return;
  await usersRef.doc(username).update({ password: nextPassword });
}
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
    loginForm.hidden = true;
    setLoggedIn(user);
  });
}

if (authForm) {
  authForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const username = authUserInput.value.trim();
    const password = authPassInput.value;
    (async () => {
      if (!firebaseReady || !usersRef) return;
      const loginId = username.toLowerCase();
      let foundSnapshot = await usersRef
        .where("usernameLower", "==", loginId)
        .limit(1)
        .get();
      if (foundSnapshot.empty) {
        foundSnapshot = await usersRef
          .where("emailLower", "==", loginId)
          .limit(1)
          .get();
      }
      if (foundSnapshot.empty) {
        foundSnapshot = await usersRef.where("username", "==", username).limit(1).get();
      }
      if (foundSnapshot.empty) {
        foundSnapshot = await usersRef.where("email", "==", username).limit(1).get();
      }
      if (foundSnapshot.empty) {
        showAuthError("Usuário ou senha inválidos.");
        return;
      }
      const foundDoc = foundSnapshot.docs[0];
      const found = foundDoc.data();
      if (found.password !== password) {
        showAuthError("Usuário ou senha inválidos.");
        return;
      }
      if (!found.usernameLower || !found.emailLower) {
        await foundDoc.ref.update({
          usernameLower: found.username?.toLowerCase() || foundDoc.id,
          emailLower: found.email?.toLowerCase() || ""
        });
      }
      handleAuthSuccess(found);
      authUserInput.value = "";
      authPassInput.value = "";
    })();
  });
}

if (togglePickerBtn) {
  togglePickerBtn.addEventListener("click", () => {
    if (!messageTools) return;
    messageTools.hidden = !messageTools.hidden;
    renderPicker();
  });
}

if (pickerSearch) {
  pickerSearch.addEventListener("input", () => renderPicker());
}

pickerTabs.forEach((button) => {
  button.addEventListener("click", () => setActivePickerTab(button.dataset.tab));
});

if (gifSendBtn) {
  gifSendBtn.addEventListener("click", () => {
    const url = gifInput?.value.trim();
    if (!url) return;
    sendMessage("", { gifUrl: url });
    gifInput.value = "";
  });
}

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
    (async () => {
      const created = await addUser(user);
      if (created) {
        newUserName.value = "";
        newUserEmail.value = "";
        newUserUsername.value = "";
        newUserPassword.value = "";
        newUserRole.value = "user";
      }
    })();
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
  sendMessage(text, { gifUrl });
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
if (firebaseReady) {
  ensureAdminUser();
  if (usersRef) {
    usersRef.orderBy("name").onSnapshot((snapshot) => {
      if (isAdmin()) {
        renderUsersFromSnapshot(snapshot);
      }
    });
  }
}
if (messageTools) {
  setActivePickerTab("emoji");
}
const savedAuth = loadAuth();
showAuthGate();
