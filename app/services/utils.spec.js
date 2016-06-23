"use strict";
var utils_1 = require('./utils');
var common_1 = require('@angular/common');
var testing_1 = require('@angular/core/testing');
testing_1.describe('Utils', function () {
    testing_1.it('resets a control', function () {
        var control = new common_1.Control('');
        var returnedControl = null;
        control.markAsTouched();
        control.updateValue('dave');
        returnedControl = utils_1.Utils.resetControl(control);
        testing_1.expect(returnedControl.touched).toBe(false);
        testing_1.expect(returnedControl.untouched).toBe(true);
        testing_1.expect(returnedControl.pristine).toBe(true);
        testing_1.expect(returnedControl.dirty).toBe(false);
        testing_1.expect(returnedControl.value).toBe('');
    });
});
