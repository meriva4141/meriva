const bcrypt = require("bcrypt");
const { playerLoginTimeouts, playerLoginAttempts, playerAuthConn, loggedInPlayers } = require("./authUtils");

function handleLogin(room, db, player, args) {
  const playerId = player.id;
  const playerName = player.name;

  if (args.length !== 2) {
    room.sendAnnouncement("❗ Doğru kullanım: !giriş ŞİFRE", playerId, 0xFF0000, "bold", 2);
    return false;
  }

  const password = args[1];

  db.query('SELECT * FROM users WHERE username COLLATE utf8mb4_general_ci = ?', [playerName], (err, results) => {
    if (err) return room.sendAnnouncement("❌ Giriş sırasında hata oluştu.", playerId, 0xFF0000, "bold", 2);

    if (results.length === 0) {
      room.sendAnnouncement("🚫 Bu isimle kayıt bulunamadı.", playerId, 0xFF0000, "bold", 2);
      return;
    }

    const user = results[0];

    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) return room.sendAnnouncement("❌ Şifre kontrolü sırasında hata oluştu.", playerId, 0xFF0000, "bold", 2);

      if (!isMatch) {
        room.sendAnnouncement("❌ Geçersiz şifre.", playerId, 0xFF0000, "bold", 2);
        return;
      }

      loggedInPlayers[playerId] = user.AdminLevel;
      room.sendAnnouncement("✅ Başarıyla giriş yaptınız!", playerId, 0x00FF00, "bold", 2);
      if (user.AdminLevel >= 1) room.setPlayerAdmin(playerId, true);

      if (playerLoginTimeouts[playerId]) {
        clearTimeout(playerLoginTimeouts[playerId]);
        delete playerLoginTimeouts[playerId];
        delete playerLoginAttempts[playerId];
      }

      const { auth, conn } = playerAuthConn[playerId] || {};
      if (auth && conn) {
        db.query('UPDATE users SET auth = ?, conn = ? WHERE username COLLATE utf8mb4_general_ci = ?', [auth, conn, playerName]);
      }
    });
  });

  return false;
}

module.exports = { handleLogin };