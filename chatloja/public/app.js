// Camera: foto ou vídeo
const cameraInput = document.getElementById('cameraInput');
if (cameraInput) {
  cameraInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result;
      await sendMessage(null, base64, file.type.startsWith('video/') ? 'video' : 'image');
      updateRoomActivity(file.type.startsWith('video/') ? 'enviou um vídeo' : 'enviou uma foto');
    };
    reader.readAsDataURL(file);
    cameraInput.value = '';
  });
}

// Clip: documentos, fotos, áudio, localização
const clipInput = document.getElementById('clipInput');
if (clipInput) {
  clipInput.addEventListener('change', async (e) => {
    const files = Array.from(e.target.files);
    for (const file of files) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result;
        let type = 'file';
        if (file.type.startsWith('image/')) type = 'image';
        else if (file.type.startsWith('audio/')) type = 'audio';
        else if (file.type.startsWith('video/')) type = 'video';
        await sendMessage(null, base64, type, file.name);
        updateRoomActivity('enviou um arquivo');
      };
      reader.readAsDataURL(file);
    }
    clipInput.value = '';
  });
}

// Localização (clip): envia localização atual
if (clipInput) {
  clipInput.addEventListener('click', (e) => {
    if (e.target && e.target.getAttribute('data-location') === 'true') {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (pos) => {
          const coords = pos.coords;
          const locMsg = `Localização: https://maps.google.com/?q=${coords.latitude},${coords.longitude}`;
          await sendMessage(locMsg);
          updateRoomActivity('enviou localização');
        });
      } else {
        alert('Navegador não suporta geolocalização.');
      }

    }
  });


// Emoji picker
const emojiBtn = document.querySelector('.chat-emoji-btn');
const emojiPicker = document.getElementById('emojiPicker');
if (emojiBtn && emojiPicker) {
  emojiBtn.addEventListener('click', () => {
    emojiPicker.style.display = emojiPicker.style.display === 'block' ? 'none' : 'block';
  });
  emojiPicker.addEventListener('click', (e) => {
    if (e.target && e.target.textContent.trim()) {
      messageInput.value += e.target.textContent.trim();
      emojiPicker.style.display = 'none';
      messageInput.focus();
    }
  });
  document.addEventListener('click', (e) => {
    if (!emojiPicker.contains(e.target) && e.target !== emojiBtn) {
      emojiPicker.style.display = 'none';
    }
  });
}

// Envio ao clicar no ícone de envio: não precisa de event.preventDefault, apenas submit normal do form
// O submit do formulário já trata tanto Enter quanto clique no botão
// Áudio: gravação e envio
let mediaRecorder = null;
let audioChunks = [];
const micBtn = document.querySelector('.chat-mic-btn');

if (micBtn) {
  micBtn.addEventListener('click', async () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      micBtn.classList.remove('recording');
      micBtn.title = 'Clique para gravar áudio';
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      alert('Seu navegador não suporta gravação de áudio.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new window.MediaRecorder(stream);
      audioChunks = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.push(e.data);
      };
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        // Envio do áudio como mensagem
        if (audioBlob.size > 0 && currentRoom && currentUser) {
          const reader = new FileReader();
          reader.onloadend = async () => {
            const base64Audio = reader.result;
            await sendMessage(null, base64Audio); // null para texto, base64 para áudio
            updateRoomActivity('enviou um áudio');
          };
          reader.readAsDataURL(audioBlob);
        }
      };
      mediaRecorder.start();
      micBtn.classList.add('recording');
      micBtn.title = 'Gravando... clique para parar';
    } catch (err) {
      alert('Não foi possível acessar o microfone.');
    }
  });
}

const loginForm = document.getElementById("loginForm");
const roomForm = document.getElementById("roomForm");
const roomInput = document.getElementById("roomInput");
const roomsList = document.getElementById("roomsList");
const messages = document.getElementById("messages");
const messageForm = document.getElementById("messageForm");
const messageInput = document.getElementById("messageInput");
const roomTitle = document.getElementById("roomTitle");
const roomSubtitle = document.getElementById("roomSubtitle");
const roomActivity = document.getElementById("roomActivity");
const userStatus = document.getElementById("userStatus");
const profileView = document.getElementById("profileView");
const profileName = document.getElementById("profileName");
const profileEmail = document.getElementById("profileEmail");
const profileStatusBadge = document.getElementById("profileStatusBadge");
const profileAvatarWrap = document.getElementById("profileAvatarWrap");
const avatarInput = document.getElementById("avatarInput");
const profileAvatar = document.getElementById("profileAvatar");
const profileAvatarFallback = document.getElementById("profileAvatarFallback");
const avatarModal = document.getElementById("avatarModal");
const avatarCanvas = document.getElementById("avatarCanvas");
const avatarZoom = document.getElementById("avatarZoom");
const avatarSave = document.getElementById("avatarSave");
const avatarCancel = document.getElementById("avatarCancel");
const statusSelect = document.getElementById("statusSelect");
const themeButtons = document.querySelectorAll(".theme-btn");
const adminPanel = document.getElementById("adminPanel");
const openUserModal = document.getElementById("openUserModal");
const userModal = document.getElementById("userModal");
const userModalCancel = document.getElementById("userModalCancel");
const userForm = document.getElementById("userForm");
const profileSettingsToggle = document.getElementById("profileSettingsToggle");
const profileSettings = document.getElementById("profileSettings");
const adminActions = document.getElementById("adminActions");
const openAdminModal = document.getElementById("openAdminModal");
const adminModal = document.getElementById("adminModal");
const adminClose = document.getElementById("adminClose");
const openUsersModal = document.getElementById("openUsersModal");
const usersModal = document.getElementById("usersModal");
const usersClose = document.getElementById("usersClose");
const newUserName = document.getElementById("newUserName");
const newUserEmail = document.getElementById("newUserEmail");
const newUserUsername = document.getElementById("newUserUsername");
const newUserPassword = document.getElementById("newUserPassword");
const newUserRole = document.getElementById("newUserRole");
const usersList = document.getElementById("usersList");
const usersStatusList = document.getElementById("usersStatusList");
const logoutButtons = document.querySelectorAll(".logout-btn");
const appRoot = document.getElementById("app");
const privateModal = document.getElementById("privateModal");
const privateTitle = document.getElementById("privateTitle");
const privateMessages = document.getElementById("privateMessages");

const privateForm = document.getElementById("privateForm");
const privateInput = document.getElementById("privateInput");
const privateClose = document.getElementById("privateClose");

if (privateForm && privateInput) {
  privateForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const text = privateInput.value.trim();
    if (!text) return;
    await sendPrivateMessage(text);
    privateInput.value = "";
  });
}

const authGate = document.getElementById("authGate");
const authForm = document.getElementById("authForm");
const authUserInput = document.getElementById("authUser");
const authPassInput = document.getElementById("authPass");
const authError = document.getElementById("authError");
let currentRoom = "";
let currentUser = null;
let rooms = [];
let currentRoomUnsub = null;
let activityUnsub = null;
let privateUnsub = null;
let currentPrivateRoom = "";
let currentPrivateName = "";

const firebaseReady = Boolean(window.firebaseConfig?.apiKey);
let roomsRef = null;
let usersRef = null;
let serverTimestamp = null;
let authReady = Promise.resolve();
let privateRoomsRef = null;

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
  privateRoomsRef = db.collection("privateRooms");
  serverTimestamp = firebase.firestore.FieldValue.serverTimestamp;
  // Removido auth anônimo: login será apenas por usuário/senha local
  authReady = Promise.resolve();
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

let avatarImage = null;
let avatarScale = 1;

function saveUser(user) {
  localStorage.setItem("chatUser", JSON.stringify(user));
}


function saveAuth(user) {
  localStorage.setItem(
    "chatAuth",
    JSON.stringify({
      username: user.username,
      usernameLower: user.usernameLower || user.username?.toLowerCase() || ""
    })
  );
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
  const normalized = status || "online";
  const label =
    normalized === "ocupado"
      ? "Ocupado"
      : normalized === "ausente"
      ? "Ausente"
      : normalized === "offline"
      ? "Offline"
      : "Online";
  if (profileStatusBadge) {
    profileStatusBadge.textContent = label;
    profileStatusBadge.classList.toggle("ausente", normalized === "ausente");
    profileStatusBadge.classList.toggle("ocupado", normalized === "ocupado");
    profileStatusBadge.classList.toggle("offline", normalized === "offline");
  }
  userStatus.textContent = `Conectado como ${currentUser?.name || ""} • ${label}`;
  updateProfilePresenceRing(normalized);
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
  const statusValue = settings.status || "online";
  if (statusSelect) statusSelect.value = statusValue;
  applyTheme(settings.theme);
  applyStatus(statusValue);
  applyAvatar(settings.avatar, currentUser?.name);
}

function applyAvatarFromDataUrl(dataUrl) {
  const settings = loadProfile();
  settings.avatar = dataUrl;
  saveProfile(settings);
  applyAvatar(settings.avatar, currentUser?.name);
  updateCurrentUserPresence({ avatar: settings.avatar || "" });
}

function drawAvatarCanvas() {
  if (!avatarCanvas || !avatarImage) return;
  const ctx = avatarCanvas.getContext("2d");
  if (!ctx) return;
  const size = avatarCanvas.width;
  ctx.clearRect(0, 0, size, size);
  const baseScale = Math.max(size / avatarImage.width, size / avatarImage.height);
  const finalScale = baseScale * avatarScale;
  const drawWidth = avatarImage.width * finalScale;
  const drawHeight = avatarImage.height * finalScale;
  const dx = (size - drawWidth) / 2;
  const dy = (size - drawHeight) / 2;
  ctx.drawImage(avatarImage, dx, dy, drawWidth, drawHeight);
}

function openAvatarEditor(file) {
  if (!avatarModal || !avatarCanvas || !avatarZoom) return;
  const reader = new FileReader();
  reader.onload = () => {
    avatarImage = new Image();
    avatarImage.onload = () => {
      avatarScale = 1;
      avatarZoom.value = "1";
      drawAvatarCanvas();
      avatarModal.hidden = false;
    };
    avatarImage.src = String(reader.result || "");
  };
  reader.readAsDataURL(file);
}

function closeAvatarEditor() {
  if (!avatarModal) return;
  avatarModal.hidden = true;
  avatarImage = null;
}

function updateProfilePresenceRing(status) {
  if (!profileAvatarWrap) return;
  const ringClass =
    status === "online"
      ? "ring-online"
      : status === "ocupado"
      ? "ring-busy"
      : status === "ausente"
      ? "ring-away"
      : "ring-offline";
  profileAvatarWrap.classList.remove("ring-online", "ring-busy", "ring-away", "ring-offline");
  profileAvatarWrap.classList.add(ringClass);
}

function normalizePresenceStatus(status) {
  const value = (status || "").toLowerCase();
  if (value === "online") {
    return { key: "online", label: "Online" };
  }
  if (value === "ocupado") {
    return { key: "busy", label: "Ocupado" };
  }
  if (value === "ausente") {
    return { key: "away", label: "Ausente" };
  }
  return { key: "offline", label: "Offline" };
}

function getInitials(name) {
  return name
    ? name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";
}

function renderUserPresenceList(snapshot) {
  if (!usersStatusList) return;
  usersStatusList.innerHTML = "";
  snapshot.forEach((doc) => {
    const user = doc.data();
    if (!user?.name) return;
    if (doc.id === currentUser?.usernameLower) return;
    const status = normalizePresenceStatus(user.status);
    const item = document.createElement("div");
    item.className = `presence-item presence-${status.key}`;

    const avatar = document.createElement("div");
    avatar.className = "presence-avatar";
    if (user.avatar) {
      const img = document.createElement("img");
      img.src = user.avatar;
      img.alt = `Foto de ${user.name}`;
      avatar.appendChild(img);
    } else {
      avatar.textContent = getInitials(user.name);
    }

    const info = document.createElement("div");
    info.className = "presence-info";
    const name = document.createElement("div");
    name.className = "presence-name";
    name.textContent = user.name;
    const state = document.createElement("div");
    state.className = "presence-status";
    state.textContent = status.label;

    info.appendChild(name);
    info.appendChild(state);
    item.appendChild(avatar);
    item.appendChild(info);
    item.addEventListener("click", () => {
      openPrivateChat(doc.id, user.name);
    });
    usersStatusList.appendChild(item);
  });
}

function buildPrivateRoomId(a, b) {
  return [a, b].sort().join("__");
}

function appendPrivateMessage({ senderName, text, createdAt }) {
  if (!privateMessages) return;
  const item = document.createElement("div");
  item.className = "message";

  const header = document.createElement("div");
  header.className = "message-header";

  const name = document.createElement("span");
  name.className = "message-name";
  name.textContent = senderName;

  const time = document.createElement("span");
  time.className = "message-time";
  const timestamp = createdAt?.toMillis ? createdAt.toMillis() : createdAt;
  time.textContent = new Date(timestamp || Date.now()).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit"
  });

  const body = document.createElement("div");
  body.className = "message-body";
  body.textContent = text || "";

  header.appendChild(name);
  header.appendChild(time);
  item.appendChild(header);
  item.appendChild(body);
  privateMessages.appendChild(item);
  privateMessages.scrollTop = privateMessages.scrollHeight;
}

function openPrivateChat(targetId, targetName) {
  if (!privateRoomsRef || !currentUser?.usernameLower) return;
  if (targetId === currentUser.usernameLower) return;
  currentPrivateRoom = buildPrivateRoomId(currentUser.usernameLower, targetId);
  currentPrivateName = targetName;
  if (privateTitle) privateTitle.textContent = `Conversa com ${targetName}`;
  if (privateMessages) privateMessages.innerHTML = "";
  if (privateModal) privateModal.hidden = false;
  subscribePrivateRoom(currentPrivateRoom);
}

function closePrivateChat() {
  if (privateModal) privateModal.hidden = true;
  if (privateUnsub) {
    privateUnsub();
    privateUnsub = null;
  }
  currentPrivateRoom = "";
  currentPrivateName = "";
  if (privateMessages) privateMessages.innerHTML = "";
}

function subscribePrivateRoom(roomId) {
  if (!privateRoomsRef) return;
  if (privateUnsub) privateUnsub();
  privateUnsub = privateRoomsRef
    .doc(roomId)
    .collection("messages")
    .orderBy("createdAt")
    .limitToLast(50)
    .onSnapshot((snapshot) => {
      if (!privateMessages) return;
      privateMessages.innerHTML = "";
      snapshot.forEach((doc) => {
        const data = doc.data();
        appendPrivateMessage({
          senderName: data.senderName,
          text: data.text,
          createdAt: data.createdAt
        });
      });
    });
}

async function sendPrivateMessage(text) {
  if (!privateRoomsRef || !currentPrivateRoom || !currentUser) return;
  if (!text) return;
  await authReady;
  await privateRoomsRef
    .doc(currentPrivateRoom)
    .collection("messages")
    .add({
      senderName: currentUser.name,
      senderEmail: currentUser.email || "",
      text,
      createdAt: serverTimestamp()
    });
}

async function updateCurrentUserPresence(updates) {
  if (!firebaseReady || !usersRef) return;
  if (!currentUser?.usernameLower) return;
  try {
    await authReady;
    await usersRef.doc(currentUser.usernameLower).set(
      {
        ...updates,
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );
  } catch (error) {
    console.error(error);
  }
}

function markCurrentUserOnline() {
  const settings = loadProfile();
  settings.status = "online";
  saveProfile(settings);
  if (statusSelect) statusSelect.value = "online";
  applyStatus("online");
  updateCurrentUserPresence({
    status: "online",
    avatar: settings.avatar || ""
  });
}

function markCurrentUserOffline() {
  updateCurrentUserPresence({ status: "offline" });
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
  markCurrentUserOffline();
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
      status: "offline",
      avatar: "",
      createdAt: serverTimestamp()
    });
  } else {
    const data = snapshot.data();
    const updates = {};
    if (!data.usernameLower) updates.usernameLower = data.username?.toLowerCase() || "admin";
    if (!data.emailLower) updates.emailLower = data.email?.toLowerCase() || defaultAdmin.email;
    if (!data.status) updates.status = "offline";
    if (data.avatar === undefined) updates.avatar = "";
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
  if (text) {
    body.textContent = text;
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

function clearRoomActivity() {
  if (roomActivity) {
    roomActivity.innerHTML = "";
  }
}

function enableChat(room) {
  roomTitle.textContent = `Sala: ${room}`;
  roomSubtitle.textContent = "Histórico das últimas mensagens";
  messageInput.disabled = false;
  const sendBtn = messageForm.querySelector('button[type="submit"]');
  if (sendBtn) sendBtn.disabled = false;
}

function disableChat() {
  roomTitle.textContent = "Selecione uma sala";
  roomSubtitle.textContent = "";
  messageInput.disabled = true;
  const sendBtn = messageForm.querySelector('button[type="submit"]');
  if (sendBtn) sendBtn.disabled = true;
}

function joinRoom(room) {
  if (!firebaseReady) return;
  if (!currentUser) return;
  if (currentRoom === room) return;
  leaveCurrentRoom();
  currentRoom = room;
  clearMessages();
  clearRoomActivity();
  renderRooms();
  enableChat(room);
  subscribeToRoom(room);
  subscribeToRoomActivity(room);
  updateRoomActivity("entrou na sala");
}

function leaveCurrentRoom() {
  if (!firebaseReady) return;
  if (!currentRoom || !currentUser) return;
  updateRoomActivity("saiu da sala");
  if (currentRoomUnsub) {
    currentRoomUnsub();
    currentRoomUnsub = null;
  }
  if (activityUnsub) {
    activityUnsub();
    activityUnsub = null;
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
        if (data.system) return;
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
  if (!text && arguments.length < 2) return;
  try {
    await authReady;
    const data = {
      senderName: currentUser.name,
      senderEmail: currentUser.email || "",
      system: false,
      createdAt: serverTimestamp()
    };
    // argumentos: text, base64, type, filename
    if (arguments.length > 1 && arguments[1]) {
      const type = arguments[2] || 'file';
      if (type === 'audio') {
        data.type = 'audio';
        data.audio = arguments[1];
      } else if (type === 'image') {
        data.type = 'image';
        data.image = arguments[1];
      } else if (type === 'video') {
        data.type = 'video';
        data.video = arguments[1];
      } else if (type === 'file') {
        data.type = 'file';
        data.file = arguments[1];
        if (arguments[3]) data.filename = arguments[3];
      }
    } else {
      data.type = 'text';
      data.text = text;
    }
    await roomsRef
      .doc(currentRoom)
      .collection("messages")
      .add(data);
  } catch (error) {
    alert("Falha ao enviar mensagem. Verifique permissões do Firestore.");
    console.error(error);
  }
}

async function updateRoomActivity(action) {
  if (!firebaseReady || !currentRoom || !currentUser) return;
  const usernameKey = currentUser.usernameLower || currentUser.username?.toLowerCase() || "";
  if (!usernameKey) return;
  await authReady;
  const profile = loadProfile();
  await roomsRef
    .doc(currentRoom)
    .collection("activity")
    .doc(usernameKey)
    .set(
      {
        name: currentUser.name,
        status: profile.status || "online",
        avatar: profile.avatar || "",
        action,
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );
}

function renderRoomActivity(snapshot) {
  if (!roomActivity) return;
  roomActivity.innerHTML = "";
  snapshot.forEach((doc) => {
    const data = doc.data();
    if (!data?.name) return;
    const status = normalizePresenceStatus(data.status || "offline");
    const item = document.createElement("div");
    item.className = `room-activity-avatar ${status.key}`;
    if (data.avatar) {
      const img = document.createElement("img");
      img.src = data.avatar;
      img.alt = `Foto de ${data.name}`;
      item.appendChild(img);
    } else {
      item.textContent = getInitials(data.name);
    }
    roomActivity.appendChild(item);
  });
}

function subscribeToRoomActivity(room) {
  if (!firebaseReady) return;
  if (activityUnsub) {
    activityUnsub();
  }
  activityUnsub = roomsRef
    .doc(room)
    .collection("activity")
    .orderBy("updatedAt", "desc")
    .limit(10)
    .onSnapshot((snapshot) => {
      renderRoomActivity(snapshot);
    });
}

async function ensureRoom(name) {
  if (!firebaseReady) return;
  await authReady;
  await roomsRef.doc(name).set(
    {
      name,
      createdAt: serverTimestamp()
    },
    { merge: true }
  );
}

async function listenRooms() {
  if (!firebaseReady) return;
  await authReady;
  roomsRef.orderBy("name").onSnapshot((snapshot) => {
    rooms = snapshot.docs.map((doc) => doc.id);
    renderRooms();
    if (!currentRoom && rooms.length > 0) {
      joinRoom(rooms[0]);
    }
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
  const normalizedUser = {
    name: user.name,
    email: user.email,
    role: user.role,
    rooms: user.rooms || [],
    username: user.username || user.usernameLower || "",
    usernameLower: user.usernameLower || user.username?.toLowerCase() || ""
  };
  saveAuth(normalizedUser);
  saveUser(normalizedUser);
  setLoggedIn(normalizedUser);
  markCurrentUserOnline();
  listenRooms();
}

async function attemptAutoLogin() {
  const saved = loadAuth();
  if (!saved?.usernameLower || !firebaseReady || !usersRef) {
    showAuthGate();
    return;
  }
  try {
    await authReady;
    const snapshot = await usersRef.doc(saved.usernameLower).get();
    if (!snapshot.exists) {
      showAuthGate();
      return;
    }
    const found = snapshot.data();
    handleAuthSuccess(found);
  } catch (error) {
    console.error(error);
    showAuthGate();
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
  if (roomForm) roomForm.hidden = !admin;
  if (adminActions) adminActions.hidden = !admin;
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
  try {
    await authReady;
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
      status: "offline",
      avatar: "",
      usernameLower,
      emailLower,
      createdAt: serverTimestamp()
    });
    alert("Usuário criado com sucesso.");
    return true;
  } catch (error) {
    alert("Falha ao criar usuário. Verifique as permissões do Firestore.");
    console.error(error);
    return false;
  }
}

async function removeUser(username) {
  if (!firebaseReady || !usersRef) return;
  if (username === "admin") return;
  await authReady;
  await usersRef.doc(username).delete();
}

async function showUserPassword(username) {
  if (!firebaseReady || !usersRef) return;
  await authReady;
  const snapshot = await usersRef.doc(username).get();
  if (!snapshot.exists) return;
  const target = snapshot.data();
  alert(`Senha de ${target.username}: ${target.password}`);
}

async function updateUserPassword(username) {
  if (!firebaseReady || !usersRef) return;
  await authReady;
  const snapshot = await usersRef.doc(username).get();
  if (!snapshot.exists) return;
  const target = snapshot.data();
  const nextPassword = prompt(`Nova senha para ${target.username}:`, "");
  if (!nextPassword) return;
  await usersRef.doc(username).update({ password: nextPassword });
}

async function deleteRoom(room) {
  if (!isAdmin()) return;
  if (!confirm(`Excluir a sala "${room}"?`)) return;
  if (!firebaseReady) return;
  await authReady;

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
  authForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = authUserInput.value.trim();
    const password = authPassInput.value;
    if (!firebaseAuth) return showAuthError("Firebase Auth não inicializado.");
    try {
      const userCredential = await firebaseAuth.signInWithEmailAndPassword(email, password);
      const user = userCredential.user;
      // Busca dados extras do usuário no Firestore
      const userDoc = await usersRef.doc(user.uid).get();
      let userData = {
        name: user.displayName || "",
        email: user.email,
        role: "user",
        username: user.email,
        usernameLower: user.email.toLowerCase()
      };
      if (userDoc.exists) {
        userData = { ...userData, ...userDoc.data() };
      }
      handleAuthSuccess(userData);
      authUserInput.value = "";
      authPassInput.value = "";
    } catch (error) {
      showAuthError("Usuário ou senha inválidos.");
      console.error(error);
    }
  });
}

// Logout usando Firebase Auth
logoutButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    if (firebaseAuth) await firebaseAuth.signOut();
    setLoggedOut();
  });
});

// Registro de novo usuário
if (typeof registerForm !== 'undefined' && registerForm) {
  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = registerEmailInput.value.trim();
    const password = registerPassInput.value;
    const name = registerNameInput.value.trim();
    if (!firebaseAuth) return showAuthError("Firebase Auth não inicializado.");
    try {
      const userCredential = await firebaseAuth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;
      await user.updateProfile({ displayName: name });
      // Salva dados extras no Firestore
      await usersRef.doc(user.uid).set({
        name,
        email,
        role: "user",
        username: email,
        usernameLower: email.toLowerCase(),
        createdAt: serverTimestamp(),
        status: "offline",
        avatar: ""
      });
      showAuthError("Usuário registrado! Faça login.");
      registerEmailInput.value = "";
      registerPassInput.value = "";
      registerNameInput.value = "";
    } catch (error) {
      showAuthError("Erro ao registrar usuário: " + error.message);
      console.error(error);
    }
  });

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
        if (userModal) userModal.hidden = true;
      }
    })();
  });
}

if (openUserModal && userModal) {
  openUserModal.addEventListener("click", () => {
    userModal.hidden = false;
  });
}

if (userModalCancel && userModal) {
  userModalCancel.addEventListener("click", () => {
    userModal.hidden = true;
  });
}

if (profileSettingsToggle && profileSettings) {
  profileSettingsToggle.addEventListener("click", () => {
    profileSettings.hidden = !profileSettings.hidden;
  });
}

if (openAdminModal && adminModal) {
  openAdminModal.addEventListener("click", () => {
    adminModal.hidden = false;
  });
}

if (adminClose && adminModal) {
  adminClose.addEventListener("click", () => {
    adminModal.hidden = true;
  });
}

if (openUsersModal && usersModal) {
  openUsersModal.addEventListener("click", () => {
    usersModal.hidden = false;
  });
}

if (usersClose && usersModal) {
  usersClose.addEventListener("click", () => {
    usersModal.hidden = true;
  });
}

if (privateClose) {
  privateClose.addEventListener("click", () => closePrivateChat());
}

if (privateForm) {
  privateForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const text = privateInput?.value.trim();
    if (!text) return;
    await sendPrivateMessage(text);
    if (privateInput) privateInput.value = "";
  });
}

if (statusSelect) {
  statusSelect.addEventListener("change", () => {
    const settings = loadProfile();
    settings.status = statusSelect.value;
    saveProfile(settings);
    applyStatus(settings.status);
    updateCurrentUserPresence({ status: settings.status });
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
    openAvatarEditor(file);
  });
}

if (avatarZoom) {
  avatarZoom.addEventListener("input", () => {
    avatarScale = Number(avatarZoom.value);
    drawAvatarCanvas();
  });
}

if (avatarSave) {
  avatarSave.addEventListener("click", () => {
    if (!avatarCanvas) return;
    const dataUrl = avatarCanvas.toDataURL("image/png");
    applyAvatarFromDataUrl(dataUrl);
    closeAvatarEditor();
    if (avatarInput) avatarInput.value = "";
  });
}

if (avatarCancel) {
  avatarCancel.addEventListener("click", () => {
    closeAvatarEditor();
    if (avatarInput) avatarInput.value = "";
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

messageForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!firebaseReady) return;
  const text = messageInput.value.trim();
  if (!text || !currentRoom || !currentUser) return;
  await sendMessage(text);
  updateRoomActivity("enviou mensagem");
  messageInput.value = "";
});

async function bootstrapRooms() {
  if (!firebaseReady) return;
  await authReady;
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
      renderUserPresenceList(snapshot);
      if (isAdmin()) {
        renderUsersFromSnapshot(snapshot);
      }
    });
  }
}
window.addEventListener("beforeunload", () => {
  markCurrentUserOffline();
});
const savedAuth = loadAuth();
attemptAutoLogin();

setInterval(() => {
  if (!currentUser) return;
  const settings = loadProfile();
  updateCurrentUserPresence({
    status: settings.status || "online",
    avatar: settings.avatar || ""
  });
}, 60000);
}
