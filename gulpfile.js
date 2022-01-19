const package = require('./package.json');
const gulp = require('gulp');
const header = require('gulp-header');
const concat = require('gulp-concat');
const sass = require('gulp-sass')(require('sass'));
const rename = require('gulp-rename');

const banner = ['/**',
    ' * Vanilla Javascript Sticky Table v<%= pkg.version %>',
    ' * <%= pkg.homepage %>',
    ' */',
    ''].join('\n');

function styles() {
    return gulp.src(['./src/styles/styles.scss'])
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(concat('styles.css'))
        .pipe(header(banner, {
            pkg: package
        }))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('./dist'))
        .pipe(gulp.dest('./demo'));
}

exports.styles = styles;
exports.default = gulp.series(styles);
