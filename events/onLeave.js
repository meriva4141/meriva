const { DeleteOyuncu } = require('../core/playerData');
const { TakimlariDengele } = require('../core/matchControl');
const { updateMapByPlayerCount } = require('../core/mapManager');
const { clearAuthForPlayer, afkData } = require('../auth/authUtils');

function handlePlayerLeave(room, settings, db, player) {
  DeleteOyuncu(player.id);
  console.log(`${player.name} odayı terk etti.`);

  if (player.team === 1 || player.team === 2) {
    room.sendAnnouncement("🚨 Oyuncu ayrıldı. Maç iptal edildi.");
    room.stopGame();
  }

  TakimlariDengele(room); // 🔁 takım güncelle
  updateMapByPlayerCount(room, settings); // 🗺️ harita & denge mantığını çalıştır
  clearAuthForPlayer(player.id);
  delete afkData[player.id];
}

module.exports = { handlePlayerLeave };