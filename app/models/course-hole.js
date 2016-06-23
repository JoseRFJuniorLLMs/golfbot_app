"use strict";
var CourseHole = (function () {
    function CourseHole(courseId, num, par, yds, id) {
        if (par === void 0) { par = 4; }
        if (yds === void 0) { yds = 100; }
        this.courseId = courseId;
        this.num = num;
        this.par = par;
        this.yds = yds;
        this.id = id;
    }
    return CourseHole;
}());
exports.CourseHole = CourseHole;
