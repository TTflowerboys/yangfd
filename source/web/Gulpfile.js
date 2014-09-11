/* Created by frank on 14-7-24. */
/* jshint node:true, strict:false, asi: true, unused: false */
var cache = require('gulp-cached')
var changed = require('gulp-changed')
var remember = require('gulp-remember')
var chalk = require('chalk')
var extender = require('gulp-html-extend')
var gulp = require('gulp')
var include = require('gulp-file-include')
var less = require('gulp-less')
var sourcemaps = require('gulp-sourcemaps')
var minifyCss = require('gulp-minify-css')
var newer = require('gulp-newer')
var ngAnnotate = require('gulp-ng-annotate')
var notify = require('gulp-notify')
var prefix = require('gulp-autoprefixer')
var rimraf = require('gulp-rimraf')
var symlink = require('gulp-sym')
var usemin = require('gulp-usemin')
var footer = require('gulp-footer')
var jshint = require('gulp-jshint')
var stylish = require('jshint-stylish')
var rev = require('gulp-rev')
var revReplace = require('gulp-rev-replace')
var useref = require('gulp-useref')
var when = require('gulp-if')
var filter = require('gulp-filter')
var debug = require('gulp-debug')

var myPaths = {
    src: './src/',
    dist: './dist/',
    html: './src/{,*/}*.html',
    symlink: './src/static/{themes,fonts,images,scripts,vendors,templates,admin/scripts,admin/templates}',
    static: './src/static/**/*.*',
    less: './src/static/styles/**/*.less',
    css: './src/static/styles/**/*.css',
    js: './src/static/{,admin/}scripts/**/*.js'
}


gulp.task('debug', ['debug:lint', 'symlink', 'less2css', 'html-extend', 'watch'], function () {
    console.info(chalk.black.bgWhite.bold('You can debug now!'))
})


gulp.task('build', ['lint', 'clean', 'build:html-extend'],
    function () {
        console.info(chalk.black.bgWhite.bold('Building tasks done!'))
    })


gulp.task('lint', function () {
    return gulp.src(myPaths.js)
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(jshint.reporter('fail'));
})


gulp.task('debug:lint', function () {
    return gulp.src(myPaths.js)
        .pipe(cache('linting'))
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'))
})


gulp.task('build:copy', ['clean'], function () {
    return gulp.src(myPaths.static)
        .pipe(gulp.dest(myPaths.dist + 'static/'))
})


gulp.task('build:ngAnnotate', ['build:copy'], function () {
    return gulp.src(myPaths.src + '/static/{,admin/}scripts/**/*.js')
        .pipe(ngAnnotate())
        .pipe(gulp.dest(myPaths.dist + 'static/'));
})


gulp.task('symlink', function () {
    return gulp.src(myPaths.symlink)
        .pipe(symlink(function (file) {
            return file.path.replace('/src/', '/dist/')
        }))
})


gulp.task('clean', function () {
    return gulp.src(myPaths.dist, {read: false})
        .pipe(rimraf({force: true, verbose: true}))
})


gulp.task('less2css', function (done) {
    gulp.src(myPaths.css)
        .pipe(prefix('last 2 version', '> 1%', 'ie 8'))
        .pipe(gulp.dest(myPaths.dist + 'static/styles/'))
    gulp.src(myPaths.less)
        .pipe(less())
        .pipe(prefix('last 2 version', '> 1%', 'ie 8'))
        .pipe(gulp.dest(myPaths.dist + 'static/styles/'))
    done()
})


gulp.task('build:less2css', ['build:copy'], function (done) {
    gulp.src(myPaths.css)
        .pipe(prefix('last 2 version', '> 1%', 'ie 8'))
        .pipe(gulp.dest(myPaths.dist + 'static/styles/'))
    return gulp.src(myPaths.less)
        .pipe(less())
        .pipe(prefix('last 2 version', '> 1%', 'ie 8'))
        .pipe(gulp.dest(myPaths.dist + 'static/styles/'))
    done()
})


gulp.task('styleless2css', function () {
    gulp.src(myPaths.src + 'static/themes/genius_dashboard/css/style.less')
        .pipe(sourcemaps.init())
        .pipe(less({compress: true}))
        // To write external source map files, pass a path RELATIVE to the destination to sourcemaps.write().
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(myPaths.src + 'static/themes/genius_dashboard/css/'))
})


gulp.task('html-extend', function () {
    return gulp.src(myPaths.html)
        .pipe(extender())
        .pipe(gulp.dest(myPaths.dist))
})


gulp.task('build:html-extend', ['build:copy', 'build:less2css'], function () {

    var publicHtmlFilter = filter('*.html')

    return gulp.src(myPaths.html, {base: './src/'})
        .pipe(extender())
        .pipe(publicHtmlFilter)
        .pipe(usemin({
            css: ['concat', rev()],
            js: [ footer(';/*EOF*/;'), 'concat', rev()]
        }))
        .pipe(revReplace())
        .pipe(gulp.dest(myPaths.dist))
        .pipe(publicHtmlFilter.restore())
})


gulp.task('watch', function () {
    gulp.watch(myPaths.less, ['less2css'])
    gulp.watch(myPaths.html, ['html-extend'])
    gulp.watch(myPaths.js, ['debug:lint'])
})

