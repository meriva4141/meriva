let playerLoginTimeouts = {};
let playerLoginAttempts = {};
let playerAuthConn = {};
let loggedInPlayers = {};
let afkData = {};

function setupLoginTimeout(room, playerId, playerName, isRegister = false) {
  if (!room.settings || !room.settings.requireLogin) return; // ❗ ODA ZORUNLU GİRİŞ YAPMIYORSA HİÇBİR ŞEY YAPMA

  const message = isRegister
    ? "⏳ Kayıt olmadığınız için atılacaksınız."
    : "⏳ Giriş yapmadığınız için odadan atılacaksınız.";

  const duration = isRegister ? 30000 : 20000;

  playerLoginTimeouts[playerId] = setTimeout(() => {
    room.kickPlayer(playerId, message, false);
    delete playerLoginTimeouts[playerId];
    delete playerLoginAttempts[playerId];
    delete playerAuthConn[playerId];
  }, duration);
}

function clearAuthForPlayer(playerId) {
  if (playerLoginTimeouts[playerId]) clearTimeout(playerLoginTimeouts[playerId]);
  delete playerLoginTimeouts[playerId];
  delete playerLoginAttempts[playerId];
  delete playerAuthConn[playerId];
  delete loggedInPlayers[playerId];
}

module.exports = {
  playerLoginTimeouts,
  playerLoginAttempts,
  playerAuthConn,
  loggedInPlayers,
  afkData,
  setupLoginTimeout,
  clearAuthForPlayer
};