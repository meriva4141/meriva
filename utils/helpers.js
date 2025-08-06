const { handleJoin } = require("../events/onJoin");
const { handleLeave } = require("../events/onLeave");
const { handleChat } = require("../events/onChat");
const { handleTeamVictory, handleGameStart, handleGoal, resetLastTouched } = require("../events/onGame");
const { setupAfkCheck } = require('./afk');
const { startAnnouncements } = require("../events/announcements");

function setupRoom(room, settings, db) {
    room.onPlayerJoin = player => handleJoin(room, db, settings, player);
    room.onPlayerLeave = player => handleLeave(room, db, settings, player);
    room.onPlayerChat = (player, message) => handleChat(room, db, settings, player, message);
    room.onTeamVictory = scores => handleTeamVictory(room, db, settings, scores);
    room.onGameStart = () => handleGameStart(room);
    room.onTeamGoal = team => handleGoal(room, team, db);
    room.onPositionsReset = () => resetLastTouched();

    setupAfkCheck(room, db, settings);
    startAnnouncements(room, db);
}

module.exports = { setupRoom };