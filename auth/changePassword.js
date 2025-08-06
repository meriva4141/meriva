const bcrypt = require("bcrypt");
const { loggedInPlayers } = require("./authUtils");

function handlePasswordChange(room, db, player, args) {
  const playerId = player.id;
  const adminLevel = loggedInPlayers[playerId];

  if (adminLevel < 10) {
    room.sendAnnouncement("🚫 Bu komutu kullanma yetkiniz yok.", playerId, 0xFF0000, "bold", 2);
    return false;
  }

  if (args.length !== 4) {
    room.sendAnnouncement("❗ Doğru kullanım: !şifredeğiştir İSİM YENİŞİFRE YENİŞİFRE", playerId, 0xFF0000, "bold", 2);
    return false;
  }

  const [_, targetName, pass1, pass2] = args;

  if (pass1 !== pass2) {
    room.sendAnnouncement("❌ Şifreler aynı değil.", playerId, 0xFF0000, "bold", 2);
    return false;
  }

  if (pass1.length < 5) {
    room.sendAnnouncement("❌ Şifre en az 5 karakter olmalıdır.", playerId, 0xFF0000, "bold", 2);
    return false;
  }

  db.query('SELECT * FROM users WHERE username COLLATE utf8mb4_general_ci = ?', [targetName], (err, results) => {
    if (err || results.length === 0) {
      room.sendAnnouncement("❌ Kullanıcı bulunamadı.", playerId, 0xFF0000, "bold", 2);
      return;
    }

    bcrypt.hash(pass1, 10, (err, hash) => {
      if (err) {
        room.sendAnnouncement("❌ Şifre hashlenemedi.", playerId, 0xFF0000, "bold", 2);
        return;
      }

      db.query('UPDATE users SET password = ? WHERE username COLLATE utf8mb4_general_ci = ?', [hash, targetName], (err) => {
        if (err) return room.sendAnnouncement("❌ Güncelleme hatası.", playerId, 0xFF0000, "bold", 2);
        room.sendAnnouncement(`✅ ${targetName} için şifre güncellendi.`, playerId, 0x00FF00, "bold", 2);
      });
    });
  });

  return false;
}

module.exports = { handlePasswordChange };