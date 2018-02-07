const gulp = require('gulp');
const dalaran = require('dalaran');

const libTasks = dalaran.libraryTasks({
    babelPolyfill: true,
    port: 2000
});

gulp.task('dev', libTasks.dev);
gulp.task('compile', libTasks.compile);