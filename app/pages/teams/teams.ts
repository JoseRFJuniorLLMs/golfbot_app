import { Component } from "@angular/core";
import { NavController, Loading } from "ionic-angular";
import { TeamApi } from "../../services/gb-services";
import { Team } from "../../models/team";
import { TeamPage } from "../team/team";

@Component({
    templateUrl: "build/pages/teams/teams.html",
    providers: [TeamApi]
})
export class TeamsPage {

    teams: Array<Team>;
    noTeams: boolean;

    constructor(public nav: NavController, private teamApi: TeamApi) {
        // display the loading screen
        let loading = Loading.create({ content: "Loading teams..." });
        this.nav.present(loading);

        // get all of the teams from the remote database
        this.teamApi.find().subscribe((teams: Array<Team>) => {
            this.teams = teams;
            this.noTeams = this.teams.length === 0;
            loading.dismiss();
        });
    }

    teamTapped($event, team) {
        // go to the team page for the team that was selected
        this.nav.push(TeamPage, { team: team });
    }

    createTeam() {
        // create a new, blank team
        let team = new Team(null);
        this.nav.push(TeamPage, { team: team });
    }
}
