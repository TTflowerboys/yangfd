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
var imagemin = require('gulp-imagemin');
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
var base64 = require('gulp-img64')
var gutil = require('gulp-util')
var preprocess = require('gulp-preprocess')
var uglify = require('gulp-uglify');
var pageSprite = require('gulp-page-sprite')
var replace = require('gulp-replace')
var argv = require('yargs').argv;
var bower = require('gulp-bower');


var myPaths = {
    src: './src/',
    dist: './dist/',
    html: './src/{,*/,static/emails/,static/templates/,static/templates/master/}{*.tpl.html,*.html}',
    symlink: './src/static/{themes,fonts,images,scripts,vendors,bower_components,admin/scripts,admin/templates}',
    static: './src/static/**/*.*',
    less: ['./src/static/styles/**/*.less', '!**/flycheck_*.*'],
    css: './src/static/styles/**/*.css',
    js: './src/static/{,admin/}scripts/**/*.js',
    sprite: './sprite/',
    sprite_html: './sprite/{,*/,static/emails/,static/templates/,static/templates/master/}{*.tpl.html,*.html}',
    sprite_dist: './dist/static/sprite/',
    sprite_static: './sprite/static/**/*.*',
    sprite_less: ['./sprite/static/styles/**/*.less', '!**/flycheck_*.*'],
    sprite_css: './sprite/static/styles/**/*.css',
    sprite_js: './sprite/static/{,admin/}scripts/**/*.js'
}

//bower
gulp.task('bower', function () {
    return bower();
})

//Debug

gulp.task('debug', ['bower', 'debug:lint', 'symlink', 'less2css', 'html-extend', 'watch'], function () {
    console.info(chalk.black.bgWhite.bold('You can debug now!'))
})


gulp.task('debug:lint', function () {
    return gulp.src(myPaths.js)
        .pipe(cache('linting'))
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'))
})


gulp.task('symlink', ['bower'], function () {
    return gulp.src(myPaths.symlink)
        .pipe(symlink(function (file) {
            return file.path.replace('/src/', '/dist/')
        }))
})


gulp.task('less2css', function (done) {
    gulp.src(myPaths.css)
        .pipe(prefix('last 2 version', 'Firefox >= 20', 'ie 8'))
        .pipe(gulp.dest(myPaths.dist + 'static/styles/'))
    gulp.src(myPaths.less)
        .pipe(less().on('error', function (error) {
            console.info(chalk.white.bgRed(error.message))
        }))
        .pipe(prefix('last 2 version', 'Firefox >= 20', 'ie 8'))
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
        .pipe(extender({verbose:false}))
        .pipe(preprocess({context: {ENV: 'debug'}}))
        .pipe(gulp.dest(myPaths.dist))
})



gulp.task('clean', function () {
    return gulp.src(myPaths.dist, {read: false})
        .pipe(rimraf({force: true, verbose: true}))
})


// Build Target:
// 'debug': local python server
// 'dev': xxx-dev.bbtechgroup.com
// 'test': xxx-test.bbtechgroup.com
// 'production': online production version

gulp.task('build', ['bower', 'lint', 'clean', 'build:clean-sprite', 'build:copy-src-to-sprite', 'sprite', 'build:copy-sprite-static', 'build:less2css', 'build:html-extend', 'setupCDN'],
    function () {
        console.info(chalk.black.bgWhite.bold('Building tasks done!'))
    })


gulp.task('lint', function () {
    return gulp.src(myPaths.js)
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(jshint.reporter('fail'));
})


gulp.task('build:copy-sprite-static', ['clean', 'sprite'], function () {
    return gulp.src(myPaths.sprite_static)
        .pipe(imagemin())
        .pipe(gulp.dest(myPaths.dist + 'static/'))
})


gulp.task('build:ngAnnotate', ['build:copy-sprite-static'], function () {
    return gulp.src(myPaths.src + '/static/{,admin/}scripts/**/*.js')
        .pipe(ngAnnotate())
        .pipe(gulp.dest(myPaths.dist + 'static/'));
})



gulp.task('build:clean-sprite', function () {
    return gulp.src(myPaths.sprite, {read: false})
        .pipe(rimraf({force: true, verbose: true}))
})


gulp.task('build:copy-src-to-sprite', ['build:clean-sprite', 'bower'], function () {
    return gulp.src(myPaths.src + '**/*.*')
        .pipe(gulp.dest(myPaths.sprite))
})


gulp.task('build:less2css', ['build:copy-sprite-static'], function (done) {
    gulp.src(myPaths.sprite_css)
        .pipe(prefix('last 2 version', '> 1%', 'ie 8'))
        .pipe(minifyCss({keepSpecialComments: 0}))
        .pipe(gulp.dest(myPaths.dist + 'static/styles/'))
    return gulp.src(myPaths.sprite_less)
        .pipe(less())
        .pipe(prefix('last 2 version', '> 1%', 'ie 8'))
        .pipe(minifyCss({keepSpecialComments: 0}))
        .pipe(gulp.dest(myPaths.dist + 'static/styles/'))
    done()
})



gulp.task('sprite', ['clean', 'build:clean-sprite', 'build:copy-src-to-sprite'], function () {
    return gulp.src(myPaths.sprite_html, {base: './sprite/'})
        .pipe(pageSprite({image_src:'./sprite', image_dist:myPaths.sprite_dist, css_dist:myPaths.sprite_dist}))
    .pipe(gulp.dest(myPaths.sprite))
})

gulp.task('build:html-extend', ['build:less2css'], function () {
    var publicHtmlFilter = filter('*.html')
    return gulp.src(myPaths.sprite_html, {base: './sprite/'})
        .pipe(extender({verbose: false}))
        .pipe(preprocess({context: {ENV: argv.env}}))
        .pipe(publicHtmlFilter)
        .pipe(usemin({
            //TODO: Rev images
            css: ['concat', rev()],
            js: [ footer(';;;'), 'concat', uglify({mangle: false}),rev()]
        }))
        .pipe(revReplace())
        .pipe(publicHtmlFilter.restore())
        .pipe(gulp.dest(myPaths.dist))
})

gulp.task('setupCDN', ['build:html-extend'], function () {
    if (argv.cdn) {
        var relaceRev =  function () {
            //html should only in root folder
            gulp.src(myPaths.dist + '*.html')
                .pipe(replace(/\/static\/images\//g, argv.cdn + '/images/'))
                .pipe(replace(/\/static\/sprite\//g, argv.cdn + '/sprite/'))
                .pipe(replace(/\/static\/styles\//g, argv.cdn + '/styles/'))
                .pipe(replace(/\/static\/vendors\//g, argv.cdn + '/vendors/'))
                .pipe(replace(/\/static\/fonts\//g, argv.cdn + '/fonts/'))
                .pipe(gulp.dest(myPaths.dist))

            gulp.src(myPaths.dist + 'static/styles/' + '**/*.css')
                .pipe(replace(/\/static\/images\//g,  argv.cdn + '/images/'))
                .pipe(replace(/\/static\/fonts\//g, argv.cdn + '/fonts/'))
                .pipe(gulp.dest(myPaths.dist + 'static/styles/'))

            gulp.src(myPaths.dist + 'static/scripts/' + '**/*.js')
                .pipe(replace(/\/static\/images\//g,  argv.cdn + '/images/'))
                .pipe(gulp.dest(myPaths.dist + 'static/scripts/'))
        }
        relaceRev()

    }
})

var livereload = require('gulp-livereload')
gulp.task('watch', ['symlink', 'less2css', 'html-extend'], function () {
    livereload.listen();
    gulp.watch(myPaths.less, ['less2css'])
    gulp.watch(myPaths.html, ['html-extend'])
    gulp.watch(myPaths.js, ['debug:lint'])

    gulp.watch(myPaths.src + '**/*.*').on('change', function (event) {
        console.log(event.type)
        console.log(event.path)
        livereload.changed(event.path)
    })
})

