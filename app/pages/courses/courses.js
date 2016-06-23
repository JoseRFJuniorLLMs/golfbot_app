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
var gb_services_1 = require("../../services/gb-services");
var course_1 = require("../../models/course");
var course_hole_1 = require("../../models/course-hole");
var course_2 = require("../course/course");
var _ = require("lodash");
var CoursesPage = (function () {
    function CoursesPage(nav, courseApi, courseHoleApi) {
        var _this = this;
        this.nav = nav;
        this.courseApi = courseApi;
        this.courseHoleApi = courseHoleApi;
        // display the loading screen
        var loading = ionic_angular_1.Loading.create({ content: "Loading courses..." });
        this.nav.present(loading);
        // get all of the courses from the remote database
        this.courseApi.find().subscribe(function (courses) {
            _this.courses = courses;
            _this.noCourses = _this.courses.length === 0;
            loading.dismiss();
        });
    }
    CoursesPage.prototype.courseTapped = function ($event, course) {
        var _this = this;
        // get the course_holes for the course that was selected
        this.courseHoleApi.find({ where: { courseId: course.id } })
            .subscribe(function (courseHoles) {
            // add the course holes to the course 
            course.holes = courseHoles;
            // redirect to the Course page with the fully loaded course
            _this.nav.push(course_2.CoursePage, { course: course });
        }, function (error) {
            // there was an error fetching the course_holes
        });
    };
    CoursesPage.prototype.createCourse = function () {
        // create a new, blank course
        var course = new course_1.Course(null, "", "", []);
        // create 18 blank holes and add them to the course
        _.range(1, 19).map(function (i) { return course.holes.push(new course_hole_1.CourseHole(course.id, i, 4, 100)); });
        // redirect to the blank course page to enter the new course data
        this.nav.push(course_2.CoursePage, { course: course });
    };
    CoursesPage = __decorate([
        core_1.Component({
            templateUrl: "build/pages/courses/courses.html",
            providers: [gb_services_1.CourseApi, gb_services_1.Course_holeApi]
        }), 
        __metadata('design:paramtypes', [ionic_angular_1.NavController, gb_services_1.CourseApi, gb_services_1.Course_holeApi])
    ], CoursesPage);
    return CoursesPage;
}());
exports.CoursesPage = CoursesPage;
