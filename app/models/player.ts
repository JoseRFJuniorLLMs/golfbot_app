export class Player {
    constructor(
        public firstName: string,
        public lastName: string,
        public realm: string,
        public username: string,
        public credentials: {"username": string, "password": string},
        public challenges: any,
        public email: string,
        public status: string,
        public created: Date,
        public lastUpdated: Date,
        public id: number,
        public teamId: number
        ) {}
}