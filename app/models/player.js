"use strict";
var Player = (function () {
    function Player(firstName, lastName, realm, username, credentials, challenges, email, status, created, lastUpdated, id, teamId) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.realm = realm;
        this.username = username;
        this.credentials = credentials;
        this.challenges = challenges;
        this.email = email;
        this.status = status;
        this.created = created;
        this.lastUpdated = lastUpdated;
        this.id = id;
        this.teamId = teamId;
    }
    return Player;
}());
exports.Player = Player;
