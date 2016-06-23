import { Player } from "./player";

export class Team {
    constructor(public name: string, public players?: Array<Player>, public id?: number) {}
}