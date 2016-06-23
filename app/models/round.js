"use strict";
var Round = (function () {
    function Round(eventId, num, date, holes, id) {
        this.eventId = eventId;
        this.num = num;
        this.date = date;
        this.holes = holes;
        this.id = id;
    }
    return Round;
}());
exports.Round = Round;
