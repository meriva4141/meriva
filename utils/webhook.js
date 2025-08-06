const fetch = require("node-fetch");

function sendMessageToDiscord(message, player, settings) {
  const payload = {
    content: `${player.name}: ${message}`,
    username: settings.username,
    avatar_url: settings.avatar_url,
  };

  fetch(settings.webhookURL, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" },
  })
    .then((res) => {
      if (!res.ok) {
        console.error("❌ Webhook gönderim hatası:", res.statusText);
      }
    })
    .catch((err) => {
      console.error("❌ Webhook bağlantı hatası:", err);
    });
}

module.exports = {
  sendMessageToDiscord,
};