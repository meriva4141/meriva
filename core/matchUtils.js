// Takım limitlerini merkezi tutmak için değişken
let redMax = 1;
let blueMax = 1;

function setTeamLimits(red, blue) {
  redMax = red;
  blueMax = blue;
}

function getTeamLimits() {
  return { redMax, blueMax };
}

function MacOynanabilir(room) {
  const red = room.getPlayerList().filter(p => p.id !== 0 && p.team === 1);
  const blue = room.getPlayerList().filter(p => p.id !== 0 && p.team === 2);

  if (red.length === redMax && blue.length === blueMax) {
    room.startGame();
    room.sendAnnouncement("⚽ Maç başladı!");
  } else {
    room.stopGame();
    room.sendAnnouncement(`Maç, yeterli sayıda oyuncu bulunduğunda başlatılacak! (${redMax} Red - ${blueMax} Blue)`);
  }
}

module.exports = {
  setTeamLimits,
  getTeamLimits,
  MacOynanabilir
};