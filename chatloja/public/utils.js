// utils.js - Funções auxiliares para o chat

function getInitials(name) {
  return name
    ? name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()
    : 'U';
}

function formatTime(date) {
  return new Date(date).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Exporta funções para uso global
window.utilsModule = {
  getInitials,
  formatTime
};
