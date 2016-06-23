"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require("@angular/core");
var ionic_angular_1 = require("ionic-angular");
var common_1 = require("@angular/common");
var _ = require("lodash");
var Rx = require("rxjs");
var gb_services_1 = require("../../services/gb-services");
var courses_1 = require("../courses/courses");
var CoursePage = (function () {
    function CoursePage(nav, courseApi, courseHoleApi, fb, params) {
        var _this = this;
        this.nav = nav;
        this.courseApi = courseApi;
        this.courseHoleApi = courseHoleApi;
        // set up our field validators
        var req = common_1.Validators.required, num = function (c) { return !isNaN(c.value) && c.value >= 1 && c.value <= 18 ? null : { num: { valid: false } }; }, par = function (c) { return !isNaN(c.value) && c.value >= 2 && c.value <= 5 ? null : { par: { valid: false } }; }, yds = function (c) { return !isNaN(c.value) && c.value >= 100 && c.value <= 700 ? null : { yds: { valid: false } }; };
        // get the course that was passed in
        this.course = params.get("course");
        // populate a control array with the fields necessary for 18 holes
        this.holes = new common_1.ControlArray([]);
        _.range(0, 18).map(function (i) {
            _this.holes.push(fb.group({
                num: [_this.course.holes[i].num, num],
                yds: [_this.course.holes[i].yds, yds],
                par: [_this.course.holes[i].par, par]
            }));
        });
        // create a control group for the form including the 18 holes we created
        this.courseForm = fb.group({
            name: [this.course.name, req],
            location: [this.course.location, req],
            holes: this.holes
        });
    }
    CoursePage.prototype.saveCourse = function ($event, crs) {
        var _this = this;
        $event.preventDefault();
        // use "upsert" which will update if necessary; otherwise create
        this.courseApi.upsert(crs)
            .subscribe(function (c) {
            // forkJoin() will aggregate all 18 HTTP requests needed to update
            // the holes in the database, and won't fire it's subscribe() until
            // all of them have completed
            Rx.Observable.forkJoin(
            // map() will perform simultaneous HTTP requests for all 18 holes
            crs.holes.map(function (h) {
                // set the courseId on the course hole (necessary for new courses)
                h.courseId = c.id;
                return _this.courseHoleApi.upsert(h);
            })).subscribe(function (done) {
                // go back to the Courses page
                _this.nav.push(courses_1.CoursesPage);
            }, function (error) {
                // error upserting course holes
            });
        }, function (error) {
            // error upserting the course
        });
    };
    CoursePage = __decorate([
        core_1.Component({
            templateUrl: "build/pages/course/course.html",
            providers: [gb_services_1.CourseApi, gb_services_1.Course_holeApi],
        }), 
        __metadata('design:paramtypes', [ionic_angular_1.NavController, gb_services_1.CourseApi, gb_services_1.Course_holeApi, common_1.FormBuilder, ionic_angular_1.NavParams])
    ], CoursePage);
    return CoursePage;
}());
exports.CoursePage = CoursePage;
