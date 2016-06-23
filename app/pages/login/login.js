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
var http_1 = require("@angular/http");
var gb_services_1 = require("../../services/gb-services");
var LoginPage = (function () {
    function LoginPage(nav, playerApi, fb) {
        this.nav = nav;
        this.playerApi = playerApi;
        this.loginForm = fb.group({
            "username": ["", common_1.Validators.required],
            "password": ["", common_1.Validators.required]
        });
    }
    LoginPage.prototype.login = function (event) {
        event.preventDefault();
        this.playerApi.login(this.loginForm.value)
            .subscribe(this.storeCredentials, this.notifyOnFail);
    };
    LoginPage.prototype.storeCredentials = function (user) {
        console.log(user);
    };
    LoginPage.prototype.notifyOnFail = function (err) {
        console.log(err);
    };
    Object.defineProperty(LoginPage.prototype, "value", {
        get: function () { return this.loginForm.value; },
        enumerable: true,
        configurable: true
    });
    LoginPage = __decorate([
        core_1.Component({
            templateUrl: "build/pages/login/login.html",
            providers: [http_1.HTTP_PROVIDERS, gb_services_1.PlayerApi]
        }), 
        __metadata('design:paramtypes', [ionic_angular_1.NavController, gb_services_1.PlayerApi, common_1.FormBuilder])
    ], LoginPage);
    return LoginPage;
}());
exports.LoginPage = LoginPage;
