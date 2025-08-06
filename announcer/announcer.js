let currentIndex = 0;

function setupAnnouncements(room, db) {
  setInterval(() => {
    db.query('SELECT announcements FROM announcement', (err, results) => {
      if (err) {
        console.error("❌ Duyuru sorgu hatası:", err.stack);
        return;
      }

      if (results.length > 0) {
        const announcement = results[currentIndex].announcements;

        if (typeof announcement === 'string' && announcement.trim() !== '') {
          room.sendAnnouncement(announcement, null, 0x00FF00, "bold", 2);
          currentIndex = (currentIndex + 1) % results.length;
        } else {
          console.warn("⚠️ Geçersiz duyuru:", announcement);
        }
      }
    });
  }, 120000); // 2 dakika = 120000 ms
}

module.exports = { setupAnnouncements };