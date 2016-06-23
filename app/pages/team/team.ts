import { Component } from "@angular/core";
import { NavController, NavParams, Loading } from "ionic-angular";
import { FormBuilder, ControlGroup, Validators } from "@angular/common";
import { TeamApi } from "../../services/gb-services";
import { Team } from "../../models/team";
import { TeamsPage } from "../teams/teams";

@Component({
    templateUrl: "build/pages/team/team.html",
    providers: [TeamApi],
})
export class TeamPage {

    team: Team;
    teamForm: ControlGroup;

    constructor(public nav: NavController, private teamApi: TeamApi, fb: FormBuilder, params: NavParams) {
        // get the team that was passed in
        this.team = params.get("team");

        // create a control group for the form
        this.teamForm = fb.group({
            name: [this.team.name, Validators.required]
        });
    }

    saveTeam($event, tm) {
        $event.preventDefault();
        // use "upsert" which will update if necessary; otherwise create
        this.teamApi.upsert(tm).subscribe(done => {
            this.nav.push(TeamsPage);
        }, error => {
            // error upserting the team
        });
    }
}
