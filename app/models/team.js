"use strict";
var Team = (function () {
    function Team(name, players, id) {
        this.name = name;
        this.players = players;
        this.id = id;
    }
    return Team;
}());
exports.Team = Team;
