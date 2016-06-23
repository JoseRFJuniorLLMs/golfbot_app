"use strict";
var path_1 = require('path');
var config = {
    gulp: require('gulp'),
    appDir: 'app',
    testDir: 'test',
    testDest: 'www/build/test',
    typingsDir: 'typings',
};
var imports = {
    gulp: require('gulp'),
    runSequence: require('run-sequence'),
    ionicGulpfile: require(path_1.join(process.cwd(), 'gulpfile.js')),
};
var gulp = imports.gulp;
var runSequence = imports.runSequence;
// just a hook into ionic's build
gulp.task('build-app', function (done) {
    runSequence('build', done);
});
// compile E2E typescript into individual files, project directoy structure is replicated under www/build/test
gulp.task('build-e2e', ['clean-test'], function () {
    var typescript = require('gulp-typescript');
    var tsProject = typescript.createProject('tsconfig.json');
    var src = [
        path_1.join(config.typingsDir, '/index.d.ts'),
        path_1.join(config.appDir, '**/*e2e.ts'),
    ];
    var result = gulp.src(src)
        .pipe(typescript(tsProject));
    return result.js
        .pipe(gulp.dest(config.testDest));
});
// delete everything used in our test cycle here
gulp.task('clean-test', function () {
    var del = require('del');
    // You can use multiple globbing patterns as you would with `gulp.src`
    return del([config.testDest]).then(function (paths) {
        console.log('Deleted', paths && paths.join(', ') || '-');
    });
});
// run jasmine unit tests using karma with PhantomJS2 in single run mode
gulp.task('karma', function (done) {
    var karma = require('karma');
    var karmaOpts = {
        configFile: path_1.join(process.cwd(), config.testDir, 'karma.config.js'),
        singleRun: true,
    };
    new karma.Server(karmaOpts, done).start();
});
// run jasmine unit tests using karma with Chrome, Karma will be left open in Chrome for debug
gulp.task('karma-debug', function (done) {
    var karma = require('karma');
    var karmaOpts = {
        configFile: path_1.join(process.cwd(), config.testDir, 'karma.config.js'),
        singleRun: false,
        browsers: ['Chrome'],
    };
    new karma.Server(karmaOpts, done).start();
});
// run tslint against all typescript
gulp.task('lint', function () {
    var tslint = require('gulp-tslint');
    return gulp.src(path_1.join(config.appDir, '**/*.ts'))
        .pipe(tslint())
        .pipe(tslint.report('verbose'));
});
// build unit tests, run unit tests, remap and report coverage
gulp.task('unit-test', function (done) {
    runSequence(
    // ['lint', 'html'],
    ['html'], 'karma', done);
});
