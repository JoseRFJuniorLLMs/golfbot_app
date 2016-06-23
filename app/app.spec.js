"use strict";
var browser_static_1 = require('@angular/platform-browser/testing/browser_static');
var platform_browser_dynamic_1 = require('@angular/platform-browser-dynamic');
var testing_1 = require('@angular/core/testing');
var app_1 = require('./app');
// this needs doing _once_ for the entire test suite, hence it's here
testing_1.resetBaseTestProviders();
testing_1.setBaseTestProviders(browser_static_1.TEST_BROWSER_STATIC_PLATFORM_PROVIDERS, [
    platform_browser_dynamic_1.BROWSER_APP_DYNAMIC_PROVIDERS,
    browser_static_1.ADDITIONAL_TEST_BROWSER_PROVIDERS,
]);
// Mock out Ionic's platform class
var MockClass = (function () {
    function MockClass() {
    }
    MockClass.prototype.ready = function () {
        return new Promise(function (resolve) {
            resolve();
        });
    };
    return MockClass;
}());
var gba = null;
describe('The GolfBot app', function () {
    beforeEach(function () {
        var platform = (new MockClass());
        gba = new app_1.GolfBotApp(platform);
    });
    it('initialises with two possible pages', function () {
        expect(gba).not.toBeNull();
    });
});
