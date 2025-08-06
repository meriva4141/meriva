const {
  SetCaptain,
  ResetCaptain,
  GetSpecPlayersSorted,
  NumberSpecPlayersForCaptain
} = require('../core/teamUtils');

let redMax = 1;
let blueMax = 1;
let currentMapName = null;

function setTeamLimits(red, blue) {
  redMax = red;
  blueMax = blue;
}

function getTeamLimits() {
  return { redMax, blueMax };
}

function GetTeam(room, teamId) {
  return room.getPlayerList().filter(p => p.id !== 0 && p.team === teamId);
}

function MacOynanabilir(room) {
  const red = GetTeam(room, 1);
  const blue = GetTeam(room, 2);
  const { redMax, blueMax } = getTeamLimits();

  if (red.length === redMax && blue.length === blueMax) {
    room.startGame();
  } else {
    room.stopGame();
    room.sendAnnouncement(`Maç, yeterli sayıda oyuncu bulunduğunda başlatılacak! (${redMax} Red - ${blueMax} Blue)`);
  }
}

function TakimlariDengele(room) {
  const { redMax, blueMax } = getTeamLimits();
  const players = room.getPlayerList().filter(p => p.id !== 0);

  let red = GetTeam(room, 1);
  let blue = GetTeam(room, 2);
  let spec = GetTeam(room, 0);

  let red_ = red.length;
  let blue_ = blue.length;

  for (let i = 0; i < spec.length; i++) {
    if (red_ < redMax && red_ <= blue_) {
      room.setPlayerTeam(spec[i].id, 1);
      red_++;
    } else if (blue_ < blueMax && blue_ <= red_) {
      room.setPlayerTeam(spec[i].id, 2);
      blue_++;
    }
  }

  setTimeout(() => MacOynanabilir(room), 100);
}

function MacBitti(room, winnerTeamId) {
  room.stopGame();

  const red = GetTeam(room, 1);
  const blue = GetTeam(room, 2);
  const all = room.getPlayerList().filter(p => p.id !== 0);
  const loserTeamId = winnerTeamId === 1 ? 2 : 1;

  // Tüm oyuncuları spec'e al
  [...red, ...blue].forEach(p => room.setPlayerTeam(p.id, 0));

  // 6'dan fazla kişi varsa kaptan sistemi devreye girsin
  if (all.length >= 6) {
    const specs = GetSpecPlayersSorted(room);

    // Kaybeden takımı tekrar takıma koy
    const loserPlayers = loserTeamId === 1 ? red : blue;
    loserPlayers.forEach(p => room.setPlayerTeam(p.id, loserTeamId));

    // Kaptan belirleme
    const captain = specs[0];
    if (!captain) return;

    SetCaptain(captain.id);
    room.setPlayerTeam(captain.id, loserTeamId);
    room.sendAnnouncement(`👑 ${captain.name} kaptan olarak seçildi.`, null, 0x00FF00, "bold", 2);
    room.sendAnnouncement(`Kaptan, aşağıdan 2 oyuncu seç: \n${NumberSpecPlayersForCaptain(room)}`, captain.id, 0xFFFF00, "bold", 2);

    // Kaptan süresi: 15 saniye
    setTimeout(() => {
      const stillCaptain = GetSpecPlayersSorted(room).find(p => p.id === captain.id);
      if (stillCaptain) {
        room.kickPlayer(stillCaptain.id, "⏳ Zamanında seçim yapmadığınız için oyundan atıldınız.");
        ResetCaptain();
        setTimeout(() => TakimlariDengele(room), 500);
      }
    }, 15000);

  } else {
    // Kaptan sistemi yok, otomatik dengeleme
    setTimeout(() => TakimlariDengele(room), 300);
  }
}

function updateMapByPlayerCount(room, settings) {
  const players = room.getPlayerList().filter(p => p.id !== 0);
  const count = players.length;

  const setMapAndLimits = (map, red, blue) => {
    if (map.name !== currentMapName) {
      if (room.getScores()) room.stopGame();
      room.setCustomStadium(JSON.stringify(map));
      currentMapName = map.name;
    }
    setTeamLimits(red, blue);
    TakimlariDengele(room);
    setTimeout(() => MacOynanabilir(room), 300);
  };

  if (count === 1) return setMapAndLimits(settings.isinma, 1, 0);
  if (count === 2) return setMapAndLimits(settings["2v2"], 1, 1);
  if (count === 4) return setMapAndLimits(settings["2v2"], 2, 2);
  if (count === 6) return setMapAndLimits(settings.stadium, 3, 3);

  if ((redMax === 3 || blueMax === 3) && count === 5) {
    const redCount = GetTeam(room, 1).length;
    const blueCount = GetTeam(room, 2).length;
    const spec = GetTeam(room, 0);

    if (spec.length > 0 && (redCount < 3 || blueCount < 3)) {
      const next = spec[0];
      const teamToFill = redCount < 3 ? 1 : 2;
      room.setPlayerTeam(next.id, teamToFill);
      setTimeout(() => MacOynanabilir(room), 300);
      return;
    }

    const all = [...players].sort(() => Math.random() - 0.5);
    all.forEach(p => room.setPlayerTeam(p.id, 0));
    all.slice(0, 2).forEach(p => room.setPlayerTeam(p.id, 1));
    all.slice(2, 4).forEach(p => room.setPlayerTeam(p.id, 2));
    setTeamLimits(2, 2);
    room.setCustomStadium(JSON.stringify(settings["2v2"]));
    currentMapName = settings["2v2"].name;
    setTimeout(() => MacOynanabilir(room), 300);
    return;
  }

  if (count === 3 && (redMax === 2 || blueMax === 2)) {
    const shuffled = [...players].sort(() => Math.random() - 0.5);
    shuffled.forEach(p => room.setPlayerTeam(p.id, 0));
    room.setPlayerTeam(shuffled[0].id, 1);
    room.setPlayerTeam(shuffled[1].id, 2);
    setTeamLimits(1, 1);
    room.setCustomStadium(JSON.stringify(settings["2v2"]));
    currentMapName = settings["2v2"].name;
    setTimeout(() => MacOynanabilir(room), 300);
    return;
  }

  if (count === 5 && redMax === 2 && blueMax === 2) {
    setTimeout(() => MacOynanabilir(room), 300);
    return;
  }
}

module.exports = {
  setTeamLimits,
  getTeamLimits,
  GetTeam,
  MacOynanabilir,
  TakimlariDengele,
  MacBitti,
  updateMapByPlayerCount
};