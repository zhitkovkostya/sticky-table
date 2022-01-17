const package = require('./package.json');
const gulp = require('gulp');
const clean = require('gulp-clean');
const uglify = require('gulp-uglify');
const header = require('gulp-header');
const concat = require('gulp-concat');
const sass = require('gulp-sass')(require('sass'));
const rename = require('gulp-rename');

const banner = ['/**',
    ' * Vanilla Javascript Sticky Table v<%= pkg.version %>',
    ' * <%= pkg.homepage %>',
    ' */',
    ''].join('\n');


gulp.task('scripts', function () {
    return gulp.src(['./src/scripts/**/*.js'])
        .pipe(concat('bundle.js'))
        .pipe(uglify())
        .pipe(header(banner, {
            pkg: package
        }))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('./dist'));
});

gulp.task('styles', function () {
    return gulp.src(['./src/styles/styles.scss'])
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(concat('styles.css'))
        .pipe(header(banner, {
            pkg: package
        }))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('./dist'));
});

gulp.task('clean', function () {
    return gulp.src(['dist'], { read: false, allowEmpty: true })
        .pipe(clean());
});

gulp.task('default', gulp.series('clean', 'scripts', 'styles'))
