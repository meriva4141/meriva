const { setTeamLimits, getTeamLimits, TakimlariDengele, MacOynanabilir, GetTeam } = require('./matchControl');

let currentMapName = null;

function updateMapByPlayerCount(room, settings) {
  const players = room.getPlayerList().filter(p => p.id !== 0);
  const count = players.length;

  const setMapAndLimits = (map, red, blue) => {
    if (map.name !== currentMapName) {
      if (room.getScores()) room.stopGame(); // sadece harita değişiyorsa durdur
      room.setCustomStadium(JSON.stringify(map));
      currentMapName = map.name;
    }
    setTeamLimits(red, blue);
    TakimlariDengele(room);
    setTimeout(() => MacOynanabilir(room), 300);
  };

  // 1 oyuncu → ısınma
  if (count === 1) {
    return setMapAndLimits(settings.isinma, 1, 0);
  }

  // 2 oyuncu → 1v1
  if (count === 2) {
    return setMapAndLimits(settings["2v2"], 1, 1);
  }

  // 4 oyuncu → 2v2
  if (count === 4) {
    return setMapAndLimits(settings["2v2"], 2, 2);
  }

  // 6 oyuncu → 3v3
  if (count === 6) {
    return setMapAndLimits(settings.stadium, 3, 3);
  }

  // 3v3 sırasında biri çıkarsa → spec'ten biri tamamlanır
  if ((getTeamLimits().redMax === 3 || getTeamLimits().blueMax === 3) && count === 5) {
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
  }

  // 6 → 5 düşüşü (3v3'ten) → herkes spec → random 2v2
  if (count === 5 && (getTeamLimits().redMax === 3 || getTeamLimits().blueMax === 3)) {
    const shuffled = [...players].sort(() => Math.random() - 0.5);
    shuffled.forEach(p => room.setPlayerTeam(p.id, 0));
    shuffled.slice(0, 2).forEach(p => room.setPlayerTeam(p.id, 1));
    shuffled.slice(2, 4).forEach(p => room.setPlayerTeam(p.id, 2));
    setTeamLimits(2, 2);
    room.setCustomStadium(JSON.stringify(settings["2v2"]));
    currentMapName = settings["2v2"].name;
    setTimeout(() => MacOynanabilir(room), 300);
    return;
  }

  // 4 → 3 düşüşü (2v2'den) → herkes spec → random 1v1
  if (count === 3 && (getTeamLimits().redMax === 2 || getTeamLimits().blueMax === 2)) {
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

  // 5 oyuncu → eğer zaten 2v2'deyse sadece devam et
  if (count === 5 && getTeamLimits().redMax === 2 && getTeamLimits().blueMax === 2) {
    setTimeout(() => MacOynanabilir(room), 300);
    return;
  }
}

module.exports = { updateMapByPlayerCount };