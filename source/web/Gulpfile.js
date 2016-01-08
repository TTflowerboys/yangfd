/* Created by frank on 14-7-24. */
/* jshint node:true, strict:false, asi: true, unused: false */
var cache = require('gulp-cached')
var changed = require('gulp-changed')
var remember = require('gulp-remember')
var chalk = require('chalk')
var extender = require('gulp-html-extend')
var gulp = require('gulp')
require('gulp-stats')(gulp)
var include = require('gulp-file-include')
var less = require('gulp-less')
var sourcemaps = require('gulp-sourcemaps')
var minifyCss = require('gulp-minify-css')
var imagemin = require('gulp-imagemin');
var newer = require('gulp-newer')
var notify = require('gulp-notify')
var prefix = require('gulp-autoprefixer')
var del = require('del')
var vinylPaths = require('vinyl-paths')
var symlink = require('gulp-sym')
var usemin = require('gulp-usemin')
var footer = require('gulp-footer')
var jshint = require('gulp-jshint')
var stylish = require('jshint-stylish')
var rev = require('gulp-rev')
var revReplace = require('gulp-rev-replace')
var debug = require('gulp-debug')
var base64 = require('gulp-img64')
var gutil = require('gulp-util')
var preprocess = require('gulp-preprocess')
var uglify = require('gulp-uglify');
var pageSprite = require('gulp-page-sprite')
var replace = require('gulp-replace')
var bower = require('gulp-bower')

var argv = require('yargs').argv


var myPaths = {
    src: './src/',
    dist: './dist/',
    html: './src/{,*/,static/emails/,static/templates/,static/templates/master/,static/admin/emails/}{*.tpl.html,*.html}',
    symlink: './src/static/{themes,fonts,images,scripts,vendors,bower_components,admin/scripts,admin/templates,ios_resources}',
    static: './src/static/**/*.*',
    less: ['./src/static/styles/**/*.less', '!**/flycheck_*.*'],
    css: './src/static/styles/**/*.css',
    js: './src/static/{,admin/}scripts/**/*.js',
}

//bower
gulp.task('bower', function () {
    return bower();
})

//Debug

gulp.task('debug', ['bower', 'debug:lint', 'symlink', 'less2css', 'cssAutoPrefix', 'html-extend', 'watch'], function () {
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
    return gulp.src(myPaths.less)
        .pipe(less().on('error', function (error) {
            console.info(chalk.white.bgRed(error.message))
        }))
        .pipe(prefix('last 2 version', 'Firefox >= 20', 'ie 8'))
        .pipe(gulp.dest(myPaths.dist + 'static/styles/'))
    done()
})

gulp.task('cssAutoPrefix', ['less2css'], function (done) {
   return gulp.src(myPaths.css)
        .pipe(prefix('last 2 version', 'Firefox >= 20', 'ie 8'))
        .pipe(gulp.dest(myPaths.dist + 'static/styles/'))
})

gulp.task('styleless2css',function () {
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
    return gulp.src([myPaths.dist], {read: false})
        .pipe(vinylPaths(del))
})

//better only rev the css and html used in html
gulp.task('rev', ['build:concat'], function () {
    return gulp.src(['dist/static/admin/templates/**/*.html',
    'dist/static/admin/emails/**/*.html',
    'dist/static/fonts/**/*', 
    'dist/static/images/**/*', 
    'dist/static/sprite/*', 
    'dist/static/scripts/**/*', 
    'dist/static/styles/**/*.css', 
    'dist/static/templates/**/*', 
    'dist/static/sprite/css/sprite-build.css'],
    {base: 'dist'})
        .pipe(gulp.dest(myPaths.dist))// here change to relative dir why?
        .pipe(rev())
        .pipe(gulp.dest(myPaths.dist))  // write rev'd assets to build dir
        .pipe(rev.manifest())
        .pipe(replace(/"static/g,'"/static'))
        .pipe(gulp.dest(myPaths.dist)); // write manifest to build dir
})

gulp.task('fingerprint', ['rev'], function () {
    var manifest = gulp.src(myPaths.dist + 'rev-manifest.json')
    
    return gulp.src([myPaths.dist + '*.html',
    myPaths.dist + 'static/admin/templates/**/*.html',
    myPaths.dist + 'static/admin/emails/**/*.html',
    myPaths.dist + 'static/templates/**/*.html',
    myPaths.dist + 'static/emails/*.html', 
    myPaths.dist + 'static/scripts/**/*.js', 
    myPaths.dist + 'static/styles/**/*.css', 
    myPaths.dist + 'static/sprite/css/*.css', 
    myPaths.dist + 'static/admin/*.js'], 
    { base: 'dist' })
        .pipe(revReplace({manifest:manifest}))
        .pipe(gulp.dest(myPaths.dist))
});

// admin/*.js 里面有revision过的html，
gulp.task('revAdminPageResource', ['fingerprint'], function () {
    return gulp.src(['dist/static/admin/*.js', 'dist/static/themes/genius_dashboard/css/bundle.css'], {base: 'dist'})
        .pipe(gulp.dest(myPaths.dist)) // here change to relative dir why?
        .pipe(rev())
        .pipe(gulp.dest(myPaths.dist))
        .pipe(rev.manifest())
        .pipe(replace(/"static/g,'"/static'))
        .pipe(gulp.dest(myPaths.dist + "admin-manifest/")); // write manifest to build dir
})

gulp.task('fingerprintAdminPageResource', ['revAdminPageResource'], function () {
    var manifest = gulp.src(myPaths.dist + 'admin-manifest/rev-manifest.json')

    return gulp.src(['dist/admin.html'], {base: 'dist'})
        .pipe(revReplace({manifest:manifest}))
        .pipe(gulp.dest(myPaths.dist));
});

// Build Target:
// 'debug': local python server
// 'dev': xxx-dev.bbtechgroup.com
// 'test': xxx-test.bbtechgroup.com
// 'production': online production version

gulp.task('build', ['bower', 'lint', 'clean', 'build:copy', 'build:imagemin', 'sprite', 'build:less2css', 'build:cssAutoPrefix', 'build:html-extend', 'build:concat', 'rev', 'fingerprint', 'revAdminPageResource', 'fingerprintAdminPageResource', 'setupCDN'],
    function () {
        console.info(chalk.black.bgWhite.bold('Building tasks done!'))
    })


gulp.task('lint', function () {
    return gulp.src(myPaths.js)
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(jshint.reporter('fail'));
})

gulp.task('build:copy', ['clean', 'bower'], function () {
    return gulp.src(myPaths.src + '**/*.*')
        .pipe(gulp.dest('./dist/'))
})

gulp.task('build:imagemin', ['build:copy'], function () {
    return gulp.src('dist/static/images/**/*', {base: './dist/'})
        .pipe(imagemin())
        .pipe(gulp.dest('./dist/'))
})

gulp.task('sprite', ['build:imagemin'], function () {
    return gulp.src('./dist/{,*/,static/templates/,static/templates/master/}{*.tpl.html,*.html}', {base: './dist/'})
        .pipe(pageSprite({image_src:'./dist', image_dist:'./dist/static/sprite/', css_dist:'./dist/static/sprite/' + 'css'  +'/', image_path: '/static/sprite/'}))
        .pipe(gulp.dest('./dist/'))
})

gulp.task('build:less2css', ['sprite'], function (done) {
    return gulp.src(['./dist/static/styles/**/*.less', '!**/flycheck_*.*'])
        .pipe(less())
        .pipe(prefix('last 2 version', '> 1%', 'ie 8'))
        .pipe(gulp.dest(myPaths.dist + 'static/styles/'))
    done()
})

gulp.task('build:cssAutoPrefix', ['build:less2css'], function (done) {
    return gulp.src('./dist/static/styles/**/*.css')
        .pipe(prefix('last 2 version', '> 1%', 'ie 8'))
        .pipe(gulp.dest(myPaths.dist + 'static/styles/'))
})


gulp.task('build:html-extend', ['build:cssAutoPrefix'], function () {
    return gulp.src('./dist/{,*/,static/emails/,static/templates/,static/templates/master/,static/admin/emails/}{*.tpl.html,*.html}', {base: './dist/'})
        .pipe(extender({verbose: false}))
        .pipe(preprocess({context: {ENV: argv.env}}))
        .pipe(gulp.dest(myPaths.dist))
})

gulp.task('build:concat', ['build:html-extend'], function () {
    return  gulp.src([myPaths.dist + '*.html', myPaths.dist + 'static/emails/*.html'], {base: 'dist'})
        .pipe(usemin({
            css: ['concat'],
            //inlinecss: [minifyCss({keepSpecialComments: 0}), 'concat'],
            js: [ footer(';;;'), 'concat', uglify({mangle: false})],
            //inlinejs: [ uglify() ],
        }))
        .pipe(gulp.dest(myPaths.dist))
})

gulp.task('setupCDN', ['fingerprintAdminPageResource'], function () {
    if (argv.cdn) {
        var relaceRev =  function () {
            //html should only in root folder
            gulp.src([myPaths.dist + '*.html', myPaths.dist + 'static/emails/*.html',  myPaths.dist + 'static/admin/emails/**/*.html'], {base: 'dist'})
                .pipe(replace(/\/static\/images\//g, argv.cdn + '/images/'))
                .pipe(replace(/\/static\/sprite\//g, argv.cdn + '/sprite/'))
                .pipe(replace(/\/static\/styles\//g, argv.cdn + '/styles/'))
                .pipe(replace(/\/static\/scripts\//g, argv.cdn + '/scripts/'))
                .pipe(replace(/\/static\/vendors\//g, argv.cdn + '/vendors/'))
                .pipe(replace(/\/static\/bower_components\//g, argv.cdn + '/bower_components/'))
                .pipe(replace(/\/static\/fonts\//g, argv.cdn + '/fonts/'))
                .pipe(gulp.dest(myPaths.dist))

            gulp.src(myPaths.dist + 'static/styles/' + '**/*.css')
                .pipe(replace(/\/static\/images\//g,  argv.cdn + '/images/'))
                .pipe(replace(/\/static\/fonts\//g, argv.cdn + '/fonts/'))
                .pipe(gulp.dest(myPaths.dist + 'static/styles/'))

            gulp.src(myPaths.dist + 'static/scripts/' + '**/*.js')
                .pipe(replace(/\/static\/images\//g,  argv.cdn + '/images/'))
                .pipe(gulp.dest(myPaths.dist + 'static/scripts/'))

            gulp.src(myPaths.dist + 'static/sprite/' + 'css/*.css', {base: 'dist'})
                .pipe(replace(/\/static\/sprite\//g, argv.cdn + '/sprite/'))
                .pipe(gulp.dest(myPaths.dist))
        }
        relaceRev()

    }
})

var livereload = require('gulp-livereload')
gulp.task('watch', ['symlink', 'less2css', 'cssAutoPrefix', 'html-extend'], function () {
    livereload.listen();
    gulp.watch(myPaths.less, ['less2css']).on('change', changeHanddler)
    gulp.watch(myPaths.less, ['cssAutoPrefix']).on('change', changeHanddler)
    gulp.watch(myPaths.html, ['html-extend']).on('change', changeHanddler)
    gulp.watch(myPaths.js, ['debug:lint']).on('change', changeHanddler)
    function changeHanddler(event) {
        console.log(event.type)
        console.log(event.path)
        livereload.changed(event.path)
    }
})
