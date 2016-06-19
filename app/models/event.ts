import { Round } from "./round";

export class Event {
    constructor(public name: string, public courseId: number, public rounds?: Array<Round>, public id?: number) {}
}