module.exports = config => {
    config.set({
        frameworks: ['jasmine'],
        files: [
            // './app/**/*.ts',
            './spec/**/*.spec.ts'
        ],
        preprocessors: { '**/*.ts': ['typescript']},
        typescriptPreprocessor: {
            options: {
                "target": "es5",
                "module": "commonjs",
                "emitDecoratorMetadata": true,
                "experimentalDecorators": true,
                "sourceMap": true
            },
            transformPath: path => path.replace(/\.ts$/, '.js')
        },
        browsers: ['PhantomJS'],
        reporters: ['clear-screen','spec','notify']
        // ,logLevel: config.LOG_DEBUG
    });
};