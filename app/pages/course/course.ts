import {Component} from "@angular/core";
import {NavController, NavParams, Loading} from "ionic-angular";
import {FormBuilder, Control, ControlArray, ControlGroup, Validators} from "@angular/common";
import * as _ from "lodash";
import * as Rx from "rxjs";
import {CourseApi, Course_holeApi} from "../../services/gb-services";
import {Course} from "../../models/course";
import {CourseHole} from "../../models/course-hole";
import {CoursesPage} from "../courses/courses";

@Component({
    templateUrl: "build/pages/course/course.html",
    providers: [CourseApi, Course_holeApi],
})
export class CoursePage {

    course: Course;
    courseForm: ControlGroup;
    holes: ControlArray;

    constructor(public nav: NavController, private courseApi: CourseApi, private courseHoleApi: Course_holeApi, fb: FormBuilder, params: NavParams) {
        // set up our field validators
        let req = Validators.required,
            num = (c: Control) => !isNaN(c.value) && c.value >=   1 && c.value <=  18 ? null : { num: { valid: false } },
            par = (c: Control) => !isNaN(c.value) && c.value >=   2 && c.value <=   5 ? null : { par: { valid: false } },
            yds = (c: Control) => !isNaN(c.value) && c.value >= 100 && c.value <= 700 ? null : { yds: { valid: false } };

        // get the course that was passed in
        this.course = params.get("course");

        // populate a control array with the fields necessary for 18 holes
        this.holes = new ControlArray([]);
        _.range(0, 18).map(i => {
            this.holes.push(fb.group({
                num: [this.course.holes[i].num, num],
                yds: [this.course.holes[i].yds, yds],
                par: [this.course.holes[i].par, par]
            }));
        });

        // create a control group for the form including the 18 holes we created
        this.courseForm = fb.group({
            name:     [this.course.name,     req],
            location: [this.course.location, req],
            holes:    this.holes
        });
    }

    saveCourse($event, crs) {
        $event.preventDefault();
        // use "upsert" which will update if necessary; otherwise create
        this.courseApi.upsert(crs)
        .subscribe((c: Course) => {
            // forkJoin() will aggregate all 18 HTTP requests needed to update
            // the holes in the database, and won't fire it's subscribe() until
            // all of them have completed
            Rx.Observable.forkJoin(
                // map() will perform simultaneous HTTP requests for all 18 holes
                crs.holes.map((h: CourseHole) => {
                    // set the courseId on the course hole (necessary for new courses)
                    h.courseId = c.id;
                    return this.courseHoleApi.upsert(h);
                })
            ).subscribe(done => {
                // go back to the Courses page
                this.nav.push(CoursesPage);
            }, error => {
                // error upserting course holes
            });
        }, error => {
            // error upserting the course
        });
    }
}
