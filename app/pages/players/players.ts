import { Component } from "@angular/core";
import { NavController, Loading } from "ionic-angular";
import * as Rx from "rxjs";
import { PlayerApi } from "../../services/gb-services";
import { TeamApi } from "../../services/gb-services";
import { Player } from "../../models/player";
import { PlayerPage } from "../player/player";
import { Team } from "../../models/team";
import { ArrayFilterPipe } from "../../pipes/array-filter.pipe";

@Component({
    templateUrl: "build/pages/players/players.html",
    providers: [PlayerApi, TeamApi],
    pipes: [ArrayFilterPipe]
})
export class PlayersPage {

    players: Array<Player>;
    noPlayers: boolean;
    teams: Array<Team>;

    constructor(public nav: NavController, private playerApi: PlayerApi, private teamApi: TeamApi) {
        // display the loading screen
        let loading = Loading.create({ content: "Loading players..." });
        this.nav.present(loading);

        // aggregate API calls and wait for them to finish 
        Rx.Observable.forkJoin(
            // get all of the players ordered by team ID and last name
            this.playerApi.find({ order: ["teamId ASC", "lastName ASC"] }),
            // get all of the teams ordered by name
            this.teamApi.find({ order: ["name ASC"] })
        ).subscribe((results) => {
            this.players = results[0];
            this.teams   = results[1];
            this.noPlayers = 0 === this.players.length;
            loading.dismiss();
        }, error => {
            // there was an error retrieving either teams or players
        });
    }

    playerTapped($event, player, team) {
        // go to the player page for the player that was selected
        this.nav.push(PlayerPage, { player: player, teams: this.teams });
    }

    createPlayer() {
        // create a new, blank player
        let player = new Player(null);
        this.nav.push(PlayerPage, { player: player, teams: this.teams });
    }
}
