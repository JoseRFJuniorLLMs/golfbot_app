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
var ionic_native_1 = require("ionic-native");
var getting_started_1 = require("./pages/getting-started/getting-started");
var list_1 = require("./pages/list/list");
var login_1 = require("./pages/login/login");
var teams_1 = require("./pages/teams/teams");
var courses_1 = require("./pages/courses/courses");
var GolfBotApp = (function () {
    function GolfBotApp(platform) {
        this.platform = platform;
        this.rootPage = getting_started_1.GettingStartedPage;
        this.initializeApp();
        // used for an example of ngFor and navigation
        this.pages = [
            { title: "Getting Started", component: getting_started_1.GettingStartedPage },
            { title: "Courses", component: courses_1.CoursesPage },
            { title: "Teams", component: teams_1.TeamsPage },
            { title: "List", component: list_1.ListPage },
            { title: "Login", component: login_1.LoginPage },
        ];
    }
    GolfBotApp.prototype.initializeApp = function () {
        this.platform.ready().then(function () {
            // Okay, so the platform is ready and our plugins are available.
            // Here you can do any higher level native things you might need.
            ionic_native_1.StatusBar.styleDefault();
        });
    };
    GolfBotApp.prototype.openPage = function (page) {
        // Reset the content nav to have just this page
        // we wouldn"t want the back button to show in this scenario
        this.nav.setRoot(page.component);
    };
    __decorate([
        core_1.ViewChild(ionic_angular_1.Nav), 
        __metadata('design:type', ionic_angular_1.Nav)
    ], GolfBotApp.prototype, "nav", void 0);
    GolfBotApp = __decorate([
        core_1.Component({
            templateUrl: "build/app.html",
        }), 
        __metadata('design:paramtypes', [ionic_angular_1.Platform])
    ], GolfBotApp);
    return GolfBotApp;
}());
exports.GolfBotApp = GolfBotApp;
// Pass the main app component as the first argument
// Pass any providers for your app in the second argument
// Set any config for your app as the third argument:
// http://ionicframework.com/docs/v2/api/config/Config/
ionic_angular_1.ionicBootstrap(GolfBotApp);
