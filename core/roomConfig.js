const { handlePlayerJoin } = require('../events/onJoin');
const { handlePlayerLeave } = require('../events/onLeave');
const { handleChat } = require('../events/onChat');
const { setupAfkCheck } = require('../utils/afkChecker');
const { setupAnnouncements } = require('../announcer/announcer');
const { handleTeamVictory, handleGameStart, handleBallKick, handleTeamGoal, resetTouch } = require('../events/onGameEvents');

function setupRoom(room, settings, db) {
  room.onPlayerJoin = (player) => handlePlayerJoin(room, settings, db, player);
  room.onPlayerLeave = (player) => handlePlayerLeave(room, settings, db, player);
  room.onPlayerChat = (player, message) => handleChat(room, settings, db, player, message);
  room.onTeamVictory = (scores) => handleTeamVictory(room, db, settings, scores);
  room.onGameStart = () => handleGameStart(room);
  room.onPlayerBallKick = (player) => handleBallKick(player);
  room.onTeamGoal = (team) => handleTeamGoal(room, team, db);
  room.onPositionsReset = () => resetTouch();

  room.setCustomStadium(JSON.stringify(settings.stadium));
  room.setTimeLimit(3);
  room.setScoreLimit(3);
  room.setTeamsLock(true);

  setupAfkCheck(room, settings);
  setupAnnouncements(room, db);
}

module.exports = { setupRoom };