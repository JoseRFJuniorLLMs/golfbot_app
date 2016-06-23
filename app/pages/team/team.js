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
var common_1 = require("@angular/common");
var gb_services_1 = require("../../services/gb-services");
var teams_1 = require("../teams/teams");
var TeamPage = (function () {
    function TeamPage(nav, teamApi, fb, params) {
        this.nav = nav;
        this.teamApi = teamApi;
        // get the team that was passed in
        this.team = params.get("team");
        // create a control group for the form
        this.teamForm = fb.group({
            name: [this.team.name, common_1.Validators.required]
        });
    }
    TeamPage.prototype.saveTeam = function ($event, tm) {
        var _this = this;
        $event.preventDefault();
        // use "upsert" which will update if necessary; otherwise create
        this.teamApi.upsert(tm).subscribe(function (done) {
            _this.nav.push(teams_1.TeamsPage);
        }, function (error) {
            // error upserting the team
        });
    };
    TeamPage = __decorate([
        core_1.Component({
            templateUrl: "build/pages/team/team.html",
            providers: [gb_services_1.TeamApi],
        }), 
        __metadata('design:paramtypes', [ionic_angular_1.NavController, gb_services_1.TeamApi, common_1.FormBuilder, ionic_angular_1.NavParams])
    ], TeamPage);
    return TeamPage;
}());
exports.TeamPage = TeamPage;
