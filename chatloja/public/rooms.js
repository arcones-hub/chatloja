// rooms.js - Responsável por manipulação de salas

// Funções para manipular salas
function joinRoom(room, firebaseReady, currentUser, currentRoom, leaveCurrentRoom, clearMessages, clearRoomActivity, renderRooms, enableChat, subscribeToRoom, subscribeToRoomActivity, updateRoomActivity) {
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

function leaveRoom(firebaseReady, currentRoom, currentUser, updateRoomActivity, currentRoomUnsub, activityUnsub, renderRooms) {
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

// Exporta funções para uso em app.js
window.roomsModule = {
  joinRoom,
  leaveRoom
};
