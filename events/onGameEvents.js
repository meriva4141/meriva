const { loggedInPlayers } = require('../auth/authUtils');
const { sendDiscordWebhook1 } = require('../rec/recorder');
const {
  GetTeam,
  GetSpecPlayersSorted,
  NumberSpecPlayersForCaptain,
  SetCaptain,
  ResetCaptain
} = require('../core/teamUtils');
const { MacOynanabilir, TakimlariDengele, setTeamLimits } = require('../core/matchControl');

let lastPlayersTouched = [null, null];
let captainTimeout = null;

function handleTeamVictory(room, db, settings, scores) {
  const players = room.getPlayerList().filter(p => p.id !== 0);
  const red = GetTeam(room, 1);
  const blue = GetTeam(room, 2);
  const specs = GetTeam(room, 0);
  const winnerId = scores.red > scores.blue ? 1 : 2;
  const loserId = winnerId === 1 ? 2 : 1;
  const winnerTeam = GetTeam(room, winnerId);
  const loserTeam = GetTeam(room, loserId);

  // 🧮 Oyuncu istatistiklerini güncelle
  players.forEach(player => {
    if (!loggedInPlayers[player.id]) return;
    const name = player.name;

    if (player.team === winnerId) {
      db.query('UPDATE users SET win = win + 1 WHERE username COLLATE utf8mb4_general_ci = ?', [name]);
      if ((winnerId === 1 && scores.blue === 0) || (winnerId === 2 && scores.red === 0)) {
        db.query('UPDATE users SET cs = cs + 1 WHERE username COLLATE utf8mb4_general_ci = ?', [name]);
      }
    } else if (player.team === loserId) {
      db.query('UPDATE users SET lose = lose + 1 WHERE username COLLATE utf8mb4_general_ci = ?', [name]);
    }
  });

  // 🎯 Discord’a webhook gönder
  sendDiscordWebhook1(room, settings, scores);

  room.sendAnnouncement("🏁 Maç sona erdi!", null, 0x00FF00, "bold", 2);

  // 👥 6'dan az oyuncu varsa klasik spec + dengeleme
  if (players.length < 6) {
    [...winnerTeam, ...loserTeam].forEach(p => room.setPlayerTeam(p.id, 0));
    setTeamLimits(2, 2);
    setTimeout(() => TakimlariDengele(room), 500);
    return;
  }

  // ⚖️ 6+ kişi varsa kaptanlı sistem devrede
  loserTeam.forEach(p => room.setPlayerTeam(p.id, 0)); // Kaybedenler spec’e
  const updatedSpecs = GetSpecPlayersSorted(room);

  if (updatedSpecs.length <= 3) {
    // 🤖 3 veya daha az oyuncu varsa otomatik kaybeden takıma ekle
    updatedSpecs.forEach(p => room.setPlayerTeam(p.id, loserId));
    room.sendAnnouncement(`🤖 Spec'teki tüm oyuncular ${loserId === 1 ? "Kırmızı" : "Mavi"} takımına aktarıldı.`, null, 0xFFFF00, "bold", 2);
    setTimeout(() => MacOynanabilir(room), 500);
    return;
  }

  // 🧠 Kaptan seçimi
  const newCaptain = updatedSpecs[0];
  SetCaptain(newCaptain.id);
  room.setPlayerTeam(newCaptain.id, loserId);

  room.sendAnnouncement(`🎯 ${newCaptain.name} kaptan seçildi. Takımına 2 oyuncu seç.`, null, 0x00CCFF, "bold", 2);
  room.sendAnnouncement(NumberSpecPlayersForCaptain(room), newCaptain.id, 0xDDDDDD, "normal", 2);

  // ⏳ 15 saniye içinde seçim yapılmazsa kaptanı oyundan at
  if (captainTimeout) clearTimeout(captainTimeout);
  captainTimeout = setTimeout(() => {
    const isStillInRoom = GetSpecPlayersSorted(room).find(p => p.id === newCaptain.id);
    if (isStillInRoom) {
      room.kickPlayer(newCaptain.id, "⏳ Zamanında seçim yapmadığınız için kaptanlıktan atıldınız.");
      ResetCaptain();
      setTimeout(() => TakimlariDengele(room), 500);
    }
  }, 15000);
}

function handleGameStart(room) {
  room.startRecording();
}

function handleBallKick(player) {
  lastPlayersTouched[0] = player;
}

function handleTeamGoal(room, team, db) {
  const scorer = lastPlayersTouched[0];
  if (!scorer) return;

  const ownGoal = (team === 1 && scorer.team === 2) || (team === 2 && scorer.team === 1);
  const type = ownGoal ? "kk" : "goal";
  const msg = ownGoal
    ? `${scorer.name} kendi kalesine gol attı! 😓`
    : `${scorer.name} harika bir gol attı! ⚽️`;

  room.sendAnnouncement(msg, null, ownGoal ? 0xFF0000 : 0x00FF00, "bold", 2);

  if (loggedInPlayers[scorer.id]) {
    db.query(`UPDATE users SET ${type} = ${type} + 1 WHERE username COLLATE utf8mb4_general_ci = ?`, [scorer.name]);
  }
}

function resetTouch() {
  lastPlayersTouched = [null, null];
}

module.exports = {
  handleTeamVictory,
  handleGameStart,
  handleBallKick,
  handleTeamGoal,
  resetTouch
};