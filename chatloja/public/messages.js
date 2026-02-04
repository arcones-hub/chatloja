// messages.js - Responsável por envio e manipulação de mensagens

// Função para enviar mensagem
async function sendMessageToRoom(roomsRef, currentRoom, currentUser, serverTimestamp, text, base64, type, filename) {
  if (!roomsRef || !currentRoom || !currentUser) return;
  const data = {
    senderName: currentUser.name,
    senderEmail: currentUser.email || "",
    system: false,
    createdAt: serverTimestamp()
  };
  if (base64) {
    if (type === 'audio') {
      data.type = 'audio';
      data.audio = base64;
    } else if (type === 'image') {
      data.type = 'image';
      data.image = base64;
    } else if (type === 'video') {
      data.type = 'video';
      data.video = base64;
    } else {
      data.type = 'file';
      data.file = base64;
      if (filename) data.filename = filename;
    }
  } else {
    data.type = 'text';
    data.text = text;
  }
  await roomsRef.doc(currentRoom).collection("messages").add(data);
}

// Exporta funções para uso em app.js
window.messagesModule = {
  sendMessageToRoom
};
