"use strict";
var Event = (function () {
    function Event(name, courseId, rounds, id) {
        this.name = name;
        this.courseId = courseId;
        this.rounds = rounds;
        this.id = id;
    }
    return Event;
}());
exports.Event = Event;
