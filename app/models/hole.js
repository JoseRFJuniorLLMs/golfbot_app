"use strict";
var Hole = (function () {
    function Hole(roundId, courseHoleId, playerId, score, putts, fairway, gir, updown, sandsave, penalties, id) {
        this.roundId = roundId;
        this.courseHoleId = courseHoleId;
        this.playerId = playerId;
        this.score = score;
        this.putts = putts;
        this.fairway = fairway;
        this.gir = gir;
        this.updown = updown;
        this.sandsave = sandsave;
        this.penalties = penalties;
        this.id = id;
    }
    return Hole;
}());
exports.Hole = Hole;
