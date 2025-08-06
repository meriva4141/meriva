// utils/captainTimer.js
const { GetCaptain, ResetCaptain, GetSpecPlayersSorted } = require('./teamUtils');

function startCaptainTimeout(room, captainId, teamId) {
  setTimeout(() => {
    if (GetCaptain() === captainId) {
      room.kickPlayer(captainId, "⏰ Seçim yapmadığınız için odadan atıldınız.");
      ResetCaptain();

      const specs = GetSpecPlayersSorted(room);
      if (specs.length >= 1) {
        const nextCaptain = specs[0];
        room.setPlayerTeam(nextCaptain.id, teamId);
        SetCaptain(nextCaptain.id);
        room.sendAnnouncement(`🎖️ Yeni kaptan: ${nextCaptain.name}`, null, 0xFFD700, "bold", 2);
        room.sendAnnouncement("Oyuncu seçmek için numara veya isim yaz.", nextCaptain.id, 0xFFFFFF);
      }
    }
  }, 15000); // 15 saniye
}

module.exports = { startCaptainTimeout };