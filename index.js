const { fork } = require('child_process');
const fs = require('fs');
const path = require('path');
const HaxballJS = require('haxball.js');
const db = require('./db/mysql');
const { setupRoom } = require('./core/roomConfig');

const settings = JSON.parse(fs.readFileSync(path.join(__dirname, 'settings.json'), 'utf8'));

// Proxyleri yükle ve uygun formata çevir
const rawProxies = fs.readFileSync(path.join(__dirname, 'proxy.txt'), 'utf8')
  .split('\n')
  .map(line => line.trim())
  .filter(Boolean);

const proxies = rawProxies.map(line => {
  const [ip, port, user, pass] = line.split(':');
  return `http://${user}:${pass}@${ip}:${port}`;
});

// Bekleme fonksiyonu (ms cinsinden)
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Eğer bu alt process ise → direkt oda başlat
if (process.argv[2]) {
  const roomIndex = parseInt(process.argv[2]);
  const roomSettings = settings.rooms[roomIndex];

  const mergedSettings = {
    ...settings.common,
    ...roomSettings,
    proxy: proxies[roomIndex] || null
  };

  HaxballJS.then((HBInit) => {
    const room = HBInit({
      roomName: mergedSettings.roomName,
      playerName: mergedSettings.botName,
      public: mergedSettings.public,
      maxPlayers: mergedSettings.playerCount,
      token: mergedSettings.token,
      noPlayer: mergedSettings.noPlayer,
      geo: mergedSettings.geo,
      proxy: mergedSettings.proxy
    });
room.settings = mergedSettings;

    room.onRoomLink = (link) => {
      console.log(`🔗 ${mergedSettings.roomName} bağlantısı: ${link}`);
    };

    setupRoom(room, mergedSettings, db);

    room.setCustomStadium(JSON.stringify(mergedSettings.stadium));
    room.setTimeLimit(3);
    room.setScoreLimit(3);
    room.setTeamsLock(true);

    console.log(`✅ ${mergedSettings.roomName} başarıyla başlatıldı.`);
  });
} else {
  // Ana process: Odaları sırayla başlat (10 saniye aralıkla)
  (async () => {
    for (let i = 0; i < settings.rooms.length; i++) {
      console.log(`⏳ ${i + 1}. oda başlatılıyor...`);
      fork(__filename, [i]);
      await delay(10000); // 10 saniye bekle
    }
  })();
}