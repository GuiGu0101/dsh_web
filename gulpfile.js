
var path = require('path');
var fs = require('fs');
var yargs = require('yargs').argv;
var gulp = require('gulp');
var less = require('gulp-less');
var header = require('gulp-header');
var tap = require('gulp-tap');
var nano = require('gulp-cssnano');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var rename = require('gulp-rename');
var sourcemaps = require('gulp-sourcemaps');
var browserSync = require('browser-sync');
var pkg = require('./package.json');

var option = {base: 'src'};
var dist = __dirname + '/dist';

gulp.task('build:style', function (){
    var banner = [
        '/*!',
        ' * QTUI v<%= pkg.version %> (<%= pkg.homepage %>)',
        ' * Copyright <%= new Date().getFullYear() %> CISDI Info., Inc.',
        ' * Licensed under the <%= pkg.license %> license',
        ' */',
        ''].join('\n');
    gulp.src('src/style/main.less', option)
        .pipe(sourcemaps.init())
        .pipe(less().on('error', function (e) {
            console.error(e.message);
            this.emit('end');
        }))
        .pipe(postcss([autoprefixer(['iOS >= 7', 'Android >= 4.1'])]))
        .pipe(header(banner, { pkg : pkg } ))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(dist))
        .pipe(browserSync.reload({stream: true}))
        .pipe(nano({
            zindex: false,
            autoprefixer: false
        }))
        .pipe(rename(function (path) {
            path.basename += '.min';
        }))
        .pipe(gulp.dest(dist));
});

gulp.task('build:assets', function (){
    gulp.src('src/**/*.?(png|jpg|gif|js)', option)
        .pipe(gulp.dest(dist))
        .pipe(browserSync.reload({stream: true}));
});

gulp.task('build:html', function (){
    gulp.src('src/index.html', option)
        .pipe(gulp.dest(dist))
        .pipe(browserSync.reload({stream: true}));
});

gulp.task('release', ['build:style', 'build:html','build:assets']);

gulp.task('watch', ['release'], function () {
    gulp.watch('src/style/**/*', ['build:style']);
    gulp.watch('src/**/*.?(png|jpg|gif|js)', ['build:assets']);
    gulp.watch('src/**/*.html', ['build:html']);
});

gulp.task('server', function () {
    yargs.p = yargs.p || 8080;
    browserSync.init({
        server: {
            baseDir: "./dist"
        },
        ui: {
            port: yargs.p + 1,
            weinre: {
                port: yargs.p + 2
            }
        },
        port: yargs.p,
        startPath: '/'
    });
});

// 参数说明
//  -w: 实时监听
//  -s: 启动服务器
//  -p: 服务器启动端口，默认8080
gulp.task('default', ['release'], function () {
    if (yargs.s) {
        gulp.start('server');
    }

    if (yargs.w) {
        gulp.start('watch');
    }
});
