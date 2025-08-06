const { afkData } = require("../auth/authUtils");

function setupAfkCheck(room, settings) {
  const interval = 5000; // 5 saniyede bir kontrol
  const limit = 40000;   // 40 saniye hareketsizlik

  setInterval(() => {
    if (!room.getScores()) return;

    const players = room.getPlayerList().filter(p => p.id !== 0 && p.team !== 0);

    const now = Date.now();

    players.forEach(player => {
      const pos = room.getPlayerDiscProperties(player.id);
      if (!pos || typeof pos.x !== "number" || typeof pos.y !== "number") return;

      if (!afkData[player.id]) {
        afkData[player.id] = { lastX: pos.x, lastY: pos.y, lastActive: now, warned: false };
        return;
      }

      const last = afkData[player.id];
      const moved = Math.abs(pos.x - last.lastX) > 1 || Math.abs(pos.y - last.lastY) > 1;

      if (moved) {
        afkData[player.id] = { lastX: pos.x, lastY: pos.y, lastActive: now, warned: false };
      } else {
        const idle = now - last.lastActive;

        if (idle > limit && !last.warned) {
          room.sendAnnouncement(`${player.name}, hareketsizsin! 5 saniye içinde hareket etmezsen atılacaksın.`, player.id, 0xFF0000, "bold", 2);
          afkData[player.id].warned = true;
        }

        if (idle > limit + 5000) {
          room.kickPlayer(player.id, "AFK kaldığın için atıldın.");
          delete afkData[player.id];
        }
      }
    });
  }, interval);
}

module.exports = { setupAfkCheck };