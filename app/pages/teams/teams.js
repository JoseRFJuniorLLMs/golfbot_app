"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require("@angular/core");
var ionic_angular_1 = require("ionic-angular");
var gb_services_1 = require("../../services/gb-services");
var team_1 = require("../../models/team");
var team_2 = require("../team/team");
var TeamsPage = (function () {
    function TeamsPage(nav, teamApi) {
        var _this = this;
        this.nav = nav;
        this.teamApi = teamApi;
        // display the loading screen
        var loading = ionic_angular_1.Loading.create({ content: "Loading teams..." });
        this.nav.present(loading);
        // get all of the teams from the remote database
        this.teamApi.find().subscribe(function (teams) {
            _this.teams = teams;
            _this.noTeams = _this.teams.length === 0;
            loading.dismiss();
        });
    }
    TeamsPage.prototype.teamTapped = function ($event, team) {
        // go to the team page for the team that was selected
        this.nav.push(team_2.TeamPage, { team: team });
    };
    TeamsPage.prototype.createTeam = function () {
        // create a new, blank team
        var team = new team_1.Team(null);
        this.nav.push(team_2.TeamPage, { team: team });
    };
    TeamsPage = __decorate([
        core_1.Component({
            templateUrl: "build/pages/teams/teams.html",
            providers: [gb_services_1.TeamApi]
        }), 
        __metadata('design:paramtypes', [ionic_angular_1.NavController, gb_services_1.TeamApi])
    ], TeamsPage);
    return TeamsPage;
}());
exports.TeamsPage = TeamsPage;
