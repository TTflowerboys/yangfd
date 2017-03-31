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
var gap = require('gulp-append-prepend')
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
var i18n = require('gulp-i18n')
var debug = require('gulp-debug')
var pump = require('pump')
var mjml = require('gulp-mjml')
var argv = require('yargs').argv

// setup maxListener count
require('events').EventEmitter.prototype._maxListeners = 100;

var myPaths = {
    src: './src/',
    dist: './dist/',
    html: './src/{,*/,static/emails/,static/pdfs/,static/templates/,static/templates/master/,static/admin/emails/,static/admin/templates/}{*.tpl.html,*.html}',
    symlink: './src/static/{themes,fonts,images,scripts,vendors,bower_components,admin/scripts,ios_resources,admin/templates/message}',
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

gulp.task('debug', ['bower', 'lint', 'symlink', 'less2css', 'css-auto-prefix', 'html-extend', 'mjml', 'i18n', 'watch'], function () {
    console.info(chalk.black.bgWhite.bold('You can debug now!'))
})

gulp.task('lint', function () {
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

gulp.task('css-auto-prefix', ['less2css'], function (done) {
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

gulp.task('i18n', ['bower','html-extend'], function () {
    return  gulp.src([myPaths.dist + '*.html'], {base: 'dist'})
        .pipe(i18n({placeholder: '<!--I18N Placeholder-->'}))
        .pipe(gulp.dest(myPaths.dist))
})

gulp.task('watch:i18n', ['html-extend'], function () {
    return  gulp.src([myPaths.dist + '*.html'], {base: 'dist'})
        .pipe(i18n({placeholder: '<!--I18N Placeholder-->'}))
        .pipe(gulp.dest(myPaths.dist))
})

gulp.task('clean', function () {
    return gulp.src([myPaths.dist], {read: false})
        .pipe(vinylPaths(del))
})

var livereload = require('gulp-livereload')
gulp.task('watch', ['symlink', 'less2css', 'css-auto-prefix', 'html-extend', 'i18n'], function () {
    livereload.listen();
    gulp.watch(myPaths.less, ['less2css']).on('change', changeHanddler)
    gulp.watch(myPaths.less, ['css-auto-prefix']).on('change', changeHanddler)
    gulp.watch(myPaths.html, ['html-extend', 'watch:i18n']).on('change', changeHanddler)
    gulp.watch(myPaths.js, ['lint']).on('change', changeHanddler)
    function changeHanddler(event) {
        console.log(event.type)
        console.log(event.path)
        livereload.changed(event.path)
    }
})


// Build Target:
// 'debug': local python server
// 'dev': xxx-dev.bbtechgroup.com
// 'test': xxx-test.bbtechgroup.com
// 'production': online production version

gulp.task('build', ['bower', 'build:lint', 'clean', 'build:copy', 'build:mjml', 'build:imagemin', 'build:sprite', 'build:less2css', 'build:css-auto-prefix', 'build:html-extend', 'build:js-delimiter', 'build:concat','build:uglify', 'build:i18n', 'build:rev', 'build:fingerprint', 'build:rev-admin-page-resource', 'build:fingerprint-admin-page-resource', 'build:CDN'],
    function () {
        console.info(chalk.black.bgWhite.bold('Building tasks done!'))
    })


gulp.task('build:lint', function () {
    return gulp.src(myPaths.js)
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(jshint.reporter('fail'));
})

gulp.task('build:copy', ['clean', 'bower'], function () {
    return gulp.src(myPaths.src + '**/*.*')
        .pipe(gulp.dest('./dist/'))
})

gulp.task('build:mjml', ['build:copy'], function () {
    return gulp.src(myPaths.src + 'static/mjmls/*/*.*')
        .pipe(mjml())
        .pipe(gulp.dest('./dist/static/emails/'))
})

gulp.task('build:imagemin', ['build:copy'], function () {
    return gulp.src('dist/static/images/**/*', {base: './dist/'})
        .pipe(imagemin({verbose: false}))
        .pipe(gulp.dest('./dist/'))
})

gulp.task('build:sprite', ['build:imagemin'], function () {
    return gulp.src('./dist/{,*/,static/templates/,static/templates/master/}{*.tpl.html,*.html}', {base: './dist/'})
        .pipe(pageSprite({image_src:'./dist', image_dist:'./dist/static/sprite/', css_dist:'./dist/static/sprite/' + 'css'  +'/', image_path: '/static/sprite/'}))
        .pipe(gulp.dest('./dist/'))
})

gulp.task('build:less2css', ['build:sprite'], function (done) {
    return gulp.src(['./dist/static/styles/**/*.less', '!**/flycheck_*.*'])
        .pipe(less())
        .pipe(prefix('last 2 version', '> 1%', 'ie 8'))
        .pipe(gulp.dest(myPaths.dist + 'static/styles/'))
    done()
})

gulp.task('build:css-auto-prefix', ['build:less2css'], function (done) {
    return gulp.src('./dist/static/styles/**/*.css')
        .pipe(prefix('last 2 version', '> 1%', 'ie 8'))
        .pipe(gulp.dest(myPaths.dist + 'static/styles/'))
})

gulp.task('build:html-extend', ['build:css-auto-prefix'], function () {
    return gulp.src('./dist/{,*/,static/emails/,static/pdfs/,static/templates/,static/templates/master/,static/admin/emails/,static/admin/templates/}{*.tpl.html,*.html}', {base: './dist/'})
        .pipe(extender({verbose: false}))
        .pipe(preprocess({context: {ENV: argv.env}}))
        .pipe(gulp.dest(myPaths.dist))
})

gulp.task('build:js-delimiter', ['build:html-extend'], function () {
    return gulp.src(['dist/static/scripts/**/*.js',
                     'dist/static/vendors/**/*.js',
                     'dist/static/bower_components/**/*.js',
                     'dist/static/admin/scripts/**/*.js',
                    ], {base: 'dist'})
        .pipe(gap.appendText(';;;'))
        .pipe(gulp.dest(myPaths.dist)); // write manifest to build dir
})

gulp.task('build:concat', ['build:js-delimiter'], function () {
    return  gulp.src([myPaths.dist + '*.html', myPaths.dist + 'static/emails/*.html', myPaths.dist + 'static/pdfs/*.html'], {base: 'dist'})
        .pipe(usemin({
            css: ['concat'],
            js: [/*debug({title: 'So debug?:'})*/, 'concat'],
        }))
        .pipe(gulp.dest(myPaths.dist))
})

gulp.task('build:uglify', ['build:concat'], function () {
    return gulp.src(['dist/static/**/*.html.js'], {base: 'dist'})
        .pipe(uglify({mangle: false}))
        .pipe(gulp.dest(myPaths.dist))
})

gulp.task('build:i18n', ['build:uglify'], function () {
    return  gulp.src([myPaths.dist + '*.html'], {base: 'dist'})
        .pipe(i18n({placeholder: '<!--I18N Placeholder-->'}))
        .pipe(gulp.dest(myPaths.dist))
})

        //better only rev the css and html used in html
gulp.task('build:rev', ['build:i18n'], function () {
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

gulp.task('build:fingerprint', ['build:rev'], function () {
    var manifest = gulp.src(myPaths.dist + 'rev-manifest.json')
    return gulp.src([myPaths.dist + '*.html',
    myPaths.dist + 'static/admin/templates/**/*.html',
    myPaths.dist + 'static/admin/emails/**/*.html',
    myPaths.dist + 'static/templates/**/*.html',
    myPaths.dist + 'static/emails/*.html', 
    myPaths.dist + 'static/pdfs/*.html', 
    myPaths.dist + 'static/scripts/**/*.js', 
    myPaths.dist + 'static/styles/**/*.css', 
    myPaths.dist + 'static/sprite/css/*.css', 
    myPaths.dist + 'static/admin/*.js'], 
    { base: 'dist' })
        .pipe(revReplace({manifest:manifest}))
        .pipe(gulp.dest(myPaths.dist))
});

// admin/*.js 里面有revision过的html，
gulp.task('build:rev-admin-page-resource', ['build:fingerprint'], function () {
    return gulp.src(['dist/static/admin/*.js', 'dist/static/themes/genius_dashboard/css/bundle.css'], {base: 'dist'})
        .pipe(gulp.dest(myPaths.dist)) // here change to relative dir why?
        .pipe(rev())
        .pipe(gulp.dest(myPaths.dist))
        .pipe(rev.manifest())
        .pipe(replace(/"static/g,'"/static'))
        .pipe(gulp.dest(myPaths.dist + 'admin-manifest/')); // write manifest to build dir
})

gulp.task('build:fingerprint-admin-page-resource', ['build:rev-admin-page-resource'], function () {
    var manifest = gulp.src(myPaths.dist + 'admin-manifest/rev-manifest.json')

    return gulp.src(['dist/admin.html'], {base: 'dist'})
        .pipe(revReplace({manifest:manifest}))
        .pipe(gulp.dest(myPaths.dist));
});

gulp.task('build:CDN', ['build:fingerprint-admin-page-resource'], function () {
    if (argv.cdn) {
        var relaceRev =  function () {
            //html should only in root folder
            gulp.src([myPaths.dist + '*.html', myPaths.dist + 'static/emails/*.html', myPaths.dist + 'static/pdfs/*.html', myPaths.dist + 'static/admin/emails/**/*.html'], {base: 'dist'})
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


// MJML

gulp.task('mjml', function () {
    return gulp.src(myPaths.src + 'static/mjmls/*/*.*')
        .pipe(mjml())
        .pipe(gulp.dest('./dist/static/emails/'))
})

gulp.task('watch:mjml', ['mjml'], function () {
    gulp.watch(myPaths.src + 'static/mjmls/*/*.*', ['mjml']).on('change', changeHanddler)
    function changeHanddler(event) {
        console.log(event.type)
        console.log(event.path)
        livereload.changed(event.path)
    }
})

gulp.task('mjml_debug', ['clean', 'bower', 'lint', 'symlink','mjml', 'watch:mjml'])
