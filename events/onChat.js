const { handleRegister } = require('../auth/register');
const { handleLogin } = require('../auth/login');
const { handlePasswordChange } = require('../auth/changePassword');
const { sendMessageToDiscord } = require('../utils/webhook');
const { containsURL, containsBadWords } = require('../utils/filter');
const { loggedInPlayers, playerLoginAttempts } = require('../auth/authUtils');

const {
  IsCaptain,
  GetCaptain,
  ResetCaptain,
  GetSpecPlayersSorted,
  FindSpecPlayerByInput,
  GetTeam
} = require('../core/teamUtils');

const chatCooldowns = {};
let selectedPlayers = [];
let lastCaptainId = null;

function handleChat(room, settings, db, player, message) {
  const args = message.trim().split(" ");
  const playerId = player.id;
  const name = player.name;
  const now = Date.now();
  const isCommand = message.startsWith("!");

  // 🪵 Discord log
  if (!isCommand) sendMessageToDiscord(message, player, settings);

  // 🕑 Spam engelleme
  if (chatCooldowns[playerId] && now - chatCooldowns[playerId] < 2000 && !player.admin) {
    room.sendAnnouncement("⚠️ Lütfen 2 saniye bekleyin.", playerId, 0xFF0000, "bold", 2);
    return false;
  }
  chatCooldowns[playerId] = now;

  // 🔐 Giriş zorunluluğu
  if (settings.requireLogin && playerLoginAttempts[playerId] && !args[0].startsWith("!giriş")) {
    room.sendAnnouncement("🔐 Önce !giriş yapmalısın.", playerId, 0xFF0000, "bold", 2);
    return false;
  }

  // 🚫 Küfür / link engelleme
  if (!player.admin) {
    if (containsBadWords(message, settings.badWords)) {
      room.sendAnnouncement(`${name}, mesajın reddedildi.`, playerId, 0xFF0000, "bold", 2);
      return false;
    }
    if (containsURL(message, settings.urlExtensions)) {
      room.sendAnnouncement(`${name}, URL paylaşmak yasaktır.`, playerId, 0xFF0000, "bold", 2);
      return false;
    }
  }

  // 🛠️ Komutları işle
  if (args[0] === "!kayıt") return handleRegister(room, db, player, args, settings);
  if (args[0] === "!giriş") return handleLogin(room, db, player, args);
  if (args[0] === "!şifredeğiştir") return handlePasswordChange(room, db, player, args);

  // 👑 Kaptan seçim modunda mı?
  const captainId = GetCaptain();
  if (captainId && player.id === captainId) {
    // Kaptan değiştiyse önceki seçilenleri temizle
    if (lastCaptainId !== captainId) {
      selectedPlayers = [];
      lastCaptainId = captainId;
    }

    const input = message.trim();
    const selected = FindSpecPlayerByInput(room, input);

    if (!selected) {
      room.sendAnnouncement(`⛔ Geçersiz seçim: ${input}`, playerId, 0xFF0000, "bold", 2);
      return false;
    }

    // Aynı oyuncu tekrar seçilemez
    if (selectedPlayers.find(p => p.id === selected.id)) {
      room.sendAnnouncement(`⚠️ ${selected.name} zaten seçildi.`, playerId, 0xFFFF00, "bold", 2);
      return false;
    }

    // Kaptan takımına al: kaybeden takım
    const red = GetTeam(room, 1).length;
    const blue = GetTeam(room, 2).length;
    const teamToFill = red < blue ? 1 : 2;

    room.setPlayerTeam(selected.id, teamToFill);
    selectedPlayers.push(selected);

    room.sendAnnouncement(`✅ ${selected.name} takıma katıldı. (${selectedPlayers.length}/2)`, null, 0x00FF00, "bold", 2);

    if (selectedPlayers.length >= 2) {
      selectedPlayers = [];
      ResetCaptain();
      lastCaptainId = null;
      room.sendAnnouncement(`🚀 Takımlar tamamlandı, maç başlıyor!`, null, 0x00FF00, "bold", 2);
      setTimeout(() => room.startGame(), 1500);
    }

    return false; // Komutu işledi
  }

  return true; // Normal chat mesajıysa devam et
}

module.exports = { handleChat };