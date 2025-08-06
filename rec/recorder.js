const FormData = require('form-data');
const fetch = require('node-fetch');

function getScoresTime(time) {
  return ~~(Math.trunc(time) / 60) + ":" + (Math.trunc(time) % 60).toString().padStart(2, '0');
}

function sendDiscordWebhook1(room, settings, scores) {
  const red = room.getPlayerList().filter(player => player.team === 1).map(p => p.name);
  const blue = room.getPlayerList().filter(player => player.team === 2).map(p => p.name);
  const replayData = room.stopRecording();

  const form = new FormData();
  form.append('file', Buffer.from(replayData), {
    filename: `HBReplay-${new Date().toISOString()}.hbr2`,
    contentType: 'text/plain',
  });

  const embedPayload = {
    username: "Game Stats",
    avatar_url: "https://iconape.com/wp-content/files/yd/367702/svg/stats-logo-icon-png-svg.png",
    embeds: [
      {
        title: `${settings.roomName} - Maç Sonucu`,
        color: 5814783,
        fields: [
          { name: "🔴 Kırmızı Takım", value: `${red.join(", ")}\n**Goller:** ${scores.red}`, inline: true },
          { name: "🔵 Mavi Takım", value: `${blue.join(", ")}\n**Goller:** ${scores.blue}`, inline: true },
        ],
        footer: { text: `Oyun süresi: ${getScoresTime(scores.time)}` },
        timestamp: new Date().toISOString()
      }
    ]
  };

  form.append('payload_json', JSON.stringify(embedPayload));

  fetch(settings.webhookUrl1, {
    method: 'POST',
    body: form,
  })
    .then(res => {
      if (!res.ok) throw new Error(`Webhook HTTP hatası: ${res.status}`);
    })
    .catch(err => {
      console.error("❌ Maç sonucu webhook gönderim hatası:", err);
    });
}

module.exports = {
  sendDiscordWebhook1,
};