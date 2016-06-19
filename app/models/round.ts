import { Hole } from "./hole";

export class Round {
    constructor(public eventId: number, public num: string, public date: Date, public holes: Array<Hole>, public id?: number) {}
}