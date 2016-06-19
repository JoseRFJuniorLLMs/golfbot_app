import { Penalty } from "./penalty";

export class Hole {
    constructor(
        public roundId: number,
        public courseHoleId: number,
        public playerId: number,
        public score?: number,
        public putts?: number,
        public fairway?: string,
        public gir?: string,
        public updown?: string,
        public sandsave?: string,
        public penalties?: Array<Penalty>,
        public id?: number) {}
}