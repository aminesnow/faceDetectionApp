/*=====================================
=        Default Configuration        =
=====================================*/

// Please use config.js to override these selectively:

var config = {
   dest: 'www',
   minify_images: true,

   vendor: {
      js: [
         './bower_components/angular/angular.js',
         './bower_components/angular-route/angular-route.js',
         './bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js',
         './bower_components/ng-file-upload/ng-file-upload-all.js',
         './bower_components/socket.io-client/dist/socket.io.js',
         './bower_components/webcam-directive/dist/webcam.min.js'
       ],

       fonts: [
          './bower_components/font-awesome/fonts/fontawesome-webfont.*'
       ]
  },

  server: {
    host: '0.0.0.0',
    port: '8000'
  }
};


if (require('fs').existsSync('./config.js')) {
  var configFn = require('./config');
  configFn(config);
}

/*-----  End of Configuration  ------*/


/*========================================
=            Requiring stuffs            =
========================================*/

var gulp           = require('gulp'),
    seq            = require('run-sequence'),
    connect        = require('gulp-connect'),
    nodemon        = require('gulp-nodemon'),
    less           = require('gulp-less'),
    uglify         = require('gulp-uglify'),
    sourcemaps     = require('gulp-sourcemaps'),
    cssmin         = require('gulp-cssmin'),
    order          = require('gulp-order'),
    concat         = require('gulp-concat'),
    ignore         = require('gulp-ignore'),
    rimraf         = require('gulp-rimraf'),
    imagemin       = require('gulp-imagemin'),
    pngcrush       = require('imagemin-pngcrush'),
    templateCache  = require('gulp-angular-templatecache'),
    mobilizer      = require('gulp-mobilizer'),
    ngAnnotate     = require('gulp-ng-annotate'),
    replace        = require('gulp-replace'),
    ngFilesort     = require('gulp-angular-filesort'),
    streamqueue    = require('streamqueue'),
    rename         = require('gulp-rename'),
    path           = require('path');


/*================================================
=            Report Errors to Console            =
================================================*/

gulp.on('error', function(e) {
  throw(e);
});


/*=========================================
=            Clean dest folder            =
=========================================*/

gulp.task('clean', function (cb) {
   return gulp.src([
        path.join(config.dest, 'index.html'),
        path.join(config.dest, 'images'),
        path.join(config.dest, 'css'),
        path.join(config.dest, 'js'),
        path.join(config.dest, 'fonts')
      ], { read: false })
     .pipe(rimraf());

});


/*==========================================
=            Start a web server            =
==========================================*/


gulp.task('start', function () {
  nodemon({
    script: 'server.js'
    , ext: 'js html'
    , env: { 'NODE_ENV': 'production' }
  })
})

/*==============================================================
=            Setup live reloading on source changes            =
==============================================================*/

gulp.task('livereload', function () {
  /*
  gulp.src(path.join(config.dest, '*.html'))
    .pipe(connect.reload());
  */
});


/*=====================================
=            Minify images            =
=====================================*/

gulp.task('images', function () {

   var stream = gulp.src('src/images/**/*');

  if (config.minify_images) {
    stream = stream.pipe(imagemin({
        progressive: true,
        svgoPlugins: [{removeViewBox: false}],
        use: [pngcrush()]
    }));
  }

   return stream.pipe(gulp.dest(path.join(config.dest, 'images')));
});


/*==================================
=            Copy fonts            =
==================================*/

gulp.task('fonts', function() {
   return gulp.src(config.vendor.fonts).pipe(gulp.dest(path.join(config.dest, 'fonts')));
});


/*=================================================
=            Copy html files to dest              =
=================================================*/

gulp.task('html', function() {
  var inject = [];

  gulp.src(['src/**/*.html'])
  .pipe(replace('<!-- inject:js -->', inject.join('\n    ')))
  .pipe(gulp.dest(config.dest));

});


/*======================================================================
=            Compile, minify, mobilize less                            =
======================================================================*/

gulp.task('less', function () {

  gulp.src(['./src/less/app.less', './src/less/responsive.less'])
    .pipe(less({
      paths: [ path.resolve(__dirname, 'src/less'), path.resolve(__dirname, 'bower_components') ]
    }))
    .pipe(mobilizer('app.css', {
      'app.css': {
        hover: 'exclude',
        screens: ['0px']
      },
      'hover.css': {
        hover: 'only',
        screens: ['0px']
      }
    }))
    .pipe(cssmin())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest(path.join(config.dest, 'css')));

    gulp.src(['./bower_components/bootstrap/dist/css/bootstrap.css'])
      .pipe(cssmin())
      .pipe(rename({suffix: '.min'})).pipe(gulp.dest(path.join(config.dest, 'css')));

});


/*====================================================================
=            Compile and minify js generating source maps            =
====================================================================*/
// - Orders ng deps automatically
// - Precompile templates to ng templateCache

gulp.task('js', function() {
   //iti app
    streamqueue({ objectMode: true },
      gulp.src(config.vendor.js),
      gulp.src('./src/js/**/*.js').pipe(ngFilesort()),
      gulp.src(['src/templates/**/*.html']).pipe(templateCache({ module: 'CamFaceDetectionApp' }))
    )
    .pipe(sourcemaps.init())
    .pipe(concat('app.js'))
    .pipe(ngAnnotate())
    .pipe(uglify({  mangle: false }))
    .pipe(rename({suffix: '.min'}))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(path.join(config.dest, 'js')));


});


/*===================================================================
=            Watch for source changes and rebuild/reload            =
===================================================================*/

gulp.task('watch', function () {
  if (typeof config.server === 'object') {
     gulp.watch([config.dest + '/**/*'], ['livereload']);
    gulp.watch([config.dest_bkoff + '/**/*'], ['livereload']);
  }
  gulp.watch(['./src/**/*'], ['html']);
  gulp.watch(['./src/less/**/*'], ['less']);
  gulp.watch(['./src/js/**/*', './src/templates/**/*', config.vendor.js], ['js']);
  gulp.watch(['./src/images/**/*'], ['images']);
});


/*======================================
=            Build Sequence            =
======================================*/

gulp.task('build', function(done) {
  var tasks = ['html', 'fonts',  'images', 'less', 'js'];
  seq('clean', tasks, done);
});


/*====================================
=            Default Task            =
====================================*/

gulp.task('default', function(done){
  var tasks = [];


  if (typeof config.server === 'object') {
    tasks.push('start');
  }

  tasks.push('watch');

  seq('build', tasks, done);
});
