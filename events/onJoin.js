const { CreateOyuncu } = require('../core/playerData');
const { TakimlariDengele } = require('../core/matchControl');
const { updateMapByPlayerCount } = require('../core/mapManager');
const {
  setupLoginTimeout,
  playerLoginTimeouts,
  playerLoginAttempts,
  playerAuthConn,
  loggedInPlayers
} = require('../auth/authUtils');

function handlePlayerJoin(room, settings, db, player) {
  db.query(
    'SELECT * FROM banned_member WHERE isim = ? OR auth = ? OR conn = ?',
    [player.name, player.auth, player.conn],
    (err, results) => {
      if (err) {
        console.error('Ban kontrolü sırasında hata:', err);
        return;
      }

      if (results.length > 0) {
        room.kickPlayer(player.id, "Kara listede olduğunuz için banlandınız.");
        return;
      }
    }
  );

  CreateOyuncu(player);
  TakimlariDengele(room);
  updateMapByPlayerCount(room, settings);
  console.log(`${player.name} odaya katıldı.`);

  const { name, id, auth, conn } = player;

  // Eğer giriş zorunluluğu kapalıysa otomatik geç
  if (!settings.requireLogin) return;

  // Aksi halde giriş zorunluluğu olan akış
  db.query('SELECT * FROM users WHERE username COLLATE utf8mb4_general_ci = ?', [name], (err, results) => {
    if (err) return console.error(err);

    if (results.length > 0) {
      const user = results[0];
      if (user.auth === auth && user.conn === conn) {
        loggedInPlayers[id] = user.AdminLevel;
        room.sendAnnouncement('✅ Otomatik olarak giriş yaptınız!', id, 0x00FF00, "bold", 2);
        if (user.AdminLevel >= 1) room.setPlayerAdmin(id, true);
      } else {
        room.sendAnnouncement('🔐 20 saniye içinde `!giriş ŞİFRE` yazarak giriş yapınız.', id, 0xFF0000, "bold", 2);
        setupLoginTimeout(room, id, name);
        playerLoginAttempts[id] = true;
        playerAuthConn[id] = { auth, conn };
      }
    } else {
      room.sendAnnouncement('📌 Kayıt bulunamadı. 30 saniye içinde `!kayıt ŞİFRE ŞİFRE` ile kayıt olun.', id, 0xFF0000, "bold", 2);
      setupLoginTimeout(room, id, name, true);
      playerAuthConn[id] = { auth, conn };
    }
  });

  if (room.getPlayerList().length >= settings.playerCount) {
    db.query('SELECT AdminLevel FROM users WHERE username COLLATE utf8mb4_general_ci = ?', [player.name], (err, res) => {
      if (err) return;
      if (!res.length || res[0].AdminLevel < 1) {
        room.kickPlayer(player.id, "Oda dolu. Giriş izniniz yok.");
      }
    });
  }
}

module.exports = { handlePlayerJoin };