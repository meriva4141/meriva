const bcrypt = require("bcrypt");
const { playerAuthConn } = require("./authUtils");

const saltRounds = 10;

function handleRegister(room, db, player, args, settings) {
  const playerId = player.id;
  const playerName = player.name;

  if (args.length !== 3) {
    room.sendAnnouncement("❗ Doğru kullanım: !kayıt ŞİFRE ŞİFRE", playerId, 0xFF0000, "bold", 2);
    return false;
  }

  const [_, pass1, pass2] = args;

  if (pass1 !== pass2) {
    room.sendAnnouncement("❗ Şifreler aynı değil.", playerId, 0xFF0000, "bold", 2);
    return false;
  }

  if (pass1.length < 4) {
    room.sendAnnouncement("❗ Şifre en az 4 karakter olmalı.", playerId, 0xFF0000, "bold", 2);
    return false;
  }

  db.query('SELECT * FROM users WHERE username COLLATE utf8mb4_general_ci = ?', [playerName], (err, results) => {
    if (err) {
      room.sendAnnouncement("❌ Kayıt kontrolünde hata oluştu.", playerId, 0xFF0000, "bold", 2);
      return;
    }

    if (results.length > 0) {
      room.sendAnnouncement("❌ Bu isimle zaten kayıtlı bir hesap var. Giriş yapmayı deneyin.", playerId, 0xFF0000, "bold", 2);
      return;
    }

    const auth = playerAuthConn[playerId]?.auth;
    const conn = playerAuthConn[playerId]?.conn;

    bcrypt.hash(pass1, saltRounds, (err, hash) => {
      if (err) {
        room.sendAnnouncement("❌ Şifreyi işlerken hata oluştu.", playerId, 0xFF0000, "bold", 2);
        return;
      }

      db.query(
        'INSERT INTO users (username, password, auth, conn) VALUES (?, ?, ?, ?)',
        [playerName, hash, auth, conn],
        (err) => {
          if (err) {
            room.sendAnnouncement("❌ Kayıt sırasında hata oluştu.", playerId, 0xFF0000, "bold", 2);
            return;
          }
          room.sendAnnouncement("✅ Kayıt işlemi tamamlandı!", playerId, 0x00FF00, "bold", 2);
        }
      );
    });
  });

  return false;
}

module.exports = { handleRegister };