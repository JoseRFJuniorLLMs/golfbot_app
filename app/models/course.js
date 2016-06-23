"use strict";
var Course = (function () {
    function Course(id, name, location, holes) {
        this.id = id;
        this.name = name;
        this.location = location;
        this.holes = holes;
    }
    return Course;
}());
exports.Course = Course;
