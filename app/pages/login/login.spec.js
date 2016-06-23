"use strict";
var testing_1 = require("@angular/core/testing");
var testing_2 = require("@angular/compiler/testing");
var core_1 = require("@angular/core");
var login_1 = require("./login");
var utils_1 = require("../../services/utils");
var gb_services_1 = require("../../services/gb-services");
var ionic_angular_1 = require("ionic-angular");
var MockClass = (function () {
    function MockClass() {
    }
    MockClass.prototype.get = function () {
        return {};
    };
    MockClass.prototype.getBoolean = function () {
        return true;
    };
    MockClass.prototype.getNumber = function () {
        return 42;
    };
    return MockClass;
}());
var loginPage = null;
var loginPageFixture = null;
testing_1.describe("The Login page", function () {
    testing_1.beforeEachProviders(function () { return [
        ionic_angular_1.Form,
        core_1.provide(ionic_angular_1.NavController, { useClass: MockClass }),
        core_1.provide(ionic_angular_1.NavParams, { useClass: MockClass }),
        core_1.provide(ionic_angular_1.Config, { useClass: MockClass }),
        core_1.provide(ionic_angular_1.App, { useClass: MockClass }),
        core_1.provide(ionic_angular_1.Platform, { useClass: MockClass }),
    ]; });
    testing_1.beforeEach(testing_1.injectAsync([testing_2.TestComponentBuilder], function (tcb) {
        return tcb
            .createAsync(login_1.LoginPage)
            .then(function (componentFixture) {
            loginPageFixture = componentFixture;
            loginPage = componentFixture.componentInstance;
            loginPageFixture.detectChanges();
        })
            .catch(utils_1.Utils.promiseCatchHandler);
    }));
    testing_1.it("initialises", function () {
        testing_1.expect(loginPage).not.toBeNull();
        testing_1.expect(loginPageFixture).not.toBeNull();
    });
    testing_1.it("has a login method", function () {
        var successObj = {
            "id": "Qf6hwX5JEsRU9mkFx9nGNucVEKSQK9MBFRHQaRYeair6HIZijpD51eBJsEC09ILf",
            "ttl": 1209600,
            "created": "2016-06-09T04:48:09.632Z",
            "userId": 1
        };
        spyOn(gb_services_1.PlayerApi, "login").and.callFake(function () {
            return successObj;
        });
        loginPage.loginForm.value = { username: "mcbenton", password: "letmein" };
        testing_1.expect(loginPage.login).not.toBeNull();
        // expect(PlayerApi.login).toH
    });
    testing_1.it("stores a user's credentials on successful login", function () {
        testing_1.expect(loginPage.storeCredentials).not.toBeNull();
    });
    testing_1.it("notifies the user when login fails", function () {
        testing_1.expect(loginPage.notifyOnFail).not.toBeNull();
    });
});
