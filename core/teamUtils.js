let currentCaptainId = null;

/**
 * Belirtilen takımdaki oyuncuları getirir.
 * @param {*} room
 * @param {*} teamId - 0 = spec, 1 = red, 2 = blue
 * @returns array of players
 */
function GetTeam(room, teamId) {
  return room.getPlayerList().filter(player => player.id !== 0 && player.team === teamId);
}

/**
 * Spec'te bulunan oyuncuları id’ye göre sıralı getirir.
 * @param {*} room
 * @returns array of players
 */
function GetSpecPlayersSorted(room) {
  return room.getPlayerList()
    .filter(p => p.id !== 0 && p.team === 0)
    .sort((a, b) => a.id - b.id);
}

/**
 * Spec’teki oyuncuları numaralandırır (1. Ahmet, 2. Mehmet… gibi)
 * @param {*} room
 * @returns string (satır satır isimler)
 */
function NumberSpecPlayersForCaptain(room) {
  const specs = GetSpecPlayersSorted(room);
  return specs.map((p, i) => `${i + 1}. ${p.name}`).join('\n');
}

/**
 * Spec oyuncusunu numara ya da isim ile bulur.
 * @param {*} room
 * @param {*} input
 * @returns player object ya da null
 */
function FindSpecPlayerByInput(room, input) {
  const specs = GetSpecPlayersSorted(room);
  const num = parseInt(input);
  if (!isNaN(num) && num >= 1 && num <= specs.length) {
    return specs[num - 1];
  }
  return specs.find(p => p.name.toLowerCase() === input.toLowerCase());
}

/**
 * Kaptan atanır.
 * @param {*} playerId
 */
function SetCaptain(playerId) {
  currentCaptainId = playerId;
}

/**
 * Mevcut kaptan id’sini verir.
 * @returns number | null
 */
function GetCaptain() {
  return currentCaptainId;
}

/**
 * Oyuncunun kaptan olup olmadığını kontrol eder.
 * @param {*} player
 * @returns boolean
 */
function IsCaptain(player) {
  return player.id === currentCaptainId;
}

/**
 * Kaptanı sıfırlar.
 */
function ResetCaptain() {
  currentCaptainId = null;
}

module.exports = {
  GetTeam,
  GetSpecPlayersSorted,
  NumberSpecPlayersForCaptain,
  FindSpecPlayerByInput,
  SetCaptain,
  GetCaptain,
  IsCaptain,
  ResetCaptain
};