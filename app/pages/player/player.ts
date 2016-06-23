import {Component} from "@angular/core";
import {NavController, NavParams, Loading} from "ionic-angular";
import {FormBuilder, Control, ControlArray, ControlGroup, Validators} from "@angular/common";
import * as _ from "lodash";
import * as Rx from "rxjs";
import {PlayerApi} from "../../services/gb-services";
import {Player} from "../../models/player";
import {Team} from "../../models/team";
import {PlayersPage} from "../players/players";

@Component({
    templateUrl: "build/pages/player/player.html",
    providers: [PlayerApi],
})
export class PlayerPage {

    player: Player;
    playerForm: ControlGroup;
    holes: ControlArray;
    teams: Array<Team>;

    constructor(public nav: NavController, private playerApi: PlayerApi, fb: FormBuilder, params: NavParams) {
        // set up our field validators
        let req = Validators.required;

        // get the player that was passed in
        this.player = params.get("player");

        // get the teams that wre passed in
        this.teams = params.get("teams");

        // create a control group for the form including the 18 holes we created
        this.playerForm = fb.group({
            firstName: [this.player.firstName, req],
            lastName: [this.player.lastName, req],
            teamId: [this.player.teamId, req],
            username: [this.player.username, req],
            passwords: fb.group({
                password: [this.player.password],
                confirm:  [this.player.password]
            }, { validator: this.confirmed("password", "confirm") }),
            email: [this.player.email, req]
        });
    }

    savePlayer($event, plyr) {
        $event.preventDefault();
        // update or create?
        if (typeof plyr.id !== "undefined") {
            // update
            this.playerApi.updateAttributes(plyr.id, plyr)
                .subscribe((p: Player) => {
                    this.nav.push(PlayersPage);
                });
        } else {
            // create
            this.playerApi.create(plyr)
                .subscribe((p: Player) => {
                    // go back to the Players page
                    this.nav.push(PlayersPage);
                }, error => {
                    // error upserting the player
                });
        }

    }

    confirmed(c1: string, c2: string) {
        return (cg: ControlGroup) => {
            let field1 = cg.controls[c1],
                field2 = cg.controls[c2];
            if (field1.pristine || field2.pristine) {
                return null;
            }
            cg.markAsTouched();
            if (cg.controls[c1].value !== cg.controls[c2].value) {
                return cg.controls[c2].setErrors({notConfirmed: true});
            }
        };
    }
}
