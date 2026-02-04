
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

const authGate = document.getElementById("authGate");
const authForm = document.getElementById("authForm");
const authUserInput = document.getElementById("authUser");
const authPassInput = document.getElementById("authPass");
const authError = document.getElementById("authError");
let currentRoom = "";
let currentUser = null;
let rooms = [];
let currentRoomUnsub = null;

const firebaseReady = Boolean(window.firebaseConfig?.apiKey);
let roomsRef = null;
let usersRef = null;
let serverTimestamp = null;
let authReady = Promise.resolve();

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
  if (firebase.auth) {
    const auth = firebase.auth(firebaseApp);
    authReady = auth.signInAnonymously().catch((error) => {
      console.error(error);
      userStatus.textContent = "Falha na autenticação anônima do Firebase.";
    });
  }
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
  if (!isAdmin() && Array.isArray(currentUser.rooms) && !currentUser.rooms.includes(room)) {
    return;
  }
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
  if (!text) return;
  try {
    await authReady;
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
  } catch (error) {
    alert("Falha ao enviar mensagem. Verifique permissões do Firestore.");
    console.error(error);
  }
}

async function sendSystemMessage(text) {
  if (!firebaseReady) return;
  if (!currentRoom) return;
  await authReady;
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
    const allRooms = snapshot.docs.map((doc) => doc.id);
    if (isAdmin() || !currentUser) {
      rooms = allRooms;
    } else if (Array.isArray(currentUser.rooms)) {
      rooms = allRooms.filter((room) => currentUser.rooms.includes(room));
    } else {
      rooms = [];
    }
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
  saveAuth(user);
  saveUser({ name: user.name, email: user.email, role: user.role, rooms: user.rooms || [] });
  setLoggedIn({ name: user.name, email: user.email, role: user.role, rooms: user.rooms || [] });
  listenRooms();
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
      rooms: Array.isArray(user.rooms) ? user.rooms : rooms.slice(),
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
  authForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const username = authUserInput.value.trim();
    const password = authPassInput.value;
    (async () => {
      try {
        if (!firebaseReady || !usersRef) return;
        await authReady;
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
        const userRooms = Array.isArray(found.rooms) ? found.rooms : [];
        const userData = {
          name: found.name,
          email: found.email,
          role: found.role,
          rooms: userRooms
        };
        handleAuthSuccess(userData);
        authUserInput.value = "";
        authPassInput.value = "";
      } catch (error) {
        showAuthError("Falha ao autenticar. Verifique permissões do Firestore.");
        console.error(error);
      }
    })();
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
      role: newUserRole.value,
      rooms: rooms.slice()
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

messageForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!firebaseReady) return;
  const text = messageInput.value.trim();
  if (!text || !currentRoom || !currentUser) return;
  await sendMessage(text);
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
      if (isAdmin()) {
        renderUsersFromSnapshot(snapshot);
      }
    });
  }
}
const savedAuth = loadAuth();
showAuthGate();
