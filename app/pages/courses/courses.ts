import {Component} from "@angular/core";
import {NavController, Loading} from "ionic-angular";
import {CourseApi, Course_holeApi} from "../../services/gb-services";
import {Course} from "../../models/course";
import {CourseHole} from "../../models/course-hole";
import {CoursePage} from "../course/course";
import * as _ from "lodash";

@Component({
  templateUrl: "build/pages/courses/courses.html",
  providers: [CourseApi, Course_holeApi]
})
export class CoursesPage {

    courses: Array<Course>;
    noCourses: boolean;

    constructor(public nav: NavController, private courseApi: CourseApi, private courseHoleApi: Course_holeApi) {
        // display the loading screen
        let loading = Loading.create({ content: "Loading courses..." });
        this.nav.present(loading);

        // get all of the courses from the remote database
        this.courseApi.find().subscribe((courses: Array<Course>) => {
            this.courses = courses;
            this.noCourses = this.courses.length === 0;
            loading.dismiss();
        });
    }

    courseTapped($event, course) {
        // get the course_holes for the course that was selected
        this.courseHoleApi.find({ where: {courseId: course.id } })
        .subscribe((courseHoles: Array<CourseHole>) => {
            // add the course holes to the course 
            course.holes = courseHoles;
            // redirect to the Course page with the fully loaded course
            this.nav.push(CoursePage, { course: course });
        }, error => {
            // there was an error fetching the course_holes
        });
    }

    createCourse() {
        // create a new, blank course
        let course = new Course(null, "", "", []);
        // create 18 blank holes and add them to the course
        _.range(1, 19).map(i => course.holes.push(new CourseHole(course.id, i, 4, 100)));
        // redirect to the blank course page to enter the new course data
        this.nav.push(CoursePage, { course: course });
    }
}
