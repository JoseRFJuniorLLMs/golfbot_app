import { CourseHole } from "./course-hole";

export class Course {
    constructor(public id: number, public name: string, public location: string, public holes?: Array<CourseHole>) {}
}