"use strict";

var gulp = require("gulp");
var plumber = require("gulp-plumber");
var sourcemap = require("gulp-sourcemaps");
var sass = require("gulp-sass");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var server = require("browser-sync").create();
var del = require('del');
var csso = require('gulp-csso');
var rename = require("gulp-rename");
var imagemin = require('gulp-imagemin');
var webp = require('gulp-webp');
var svgstore = require('gulp-svgstore');
var htmlmin = require('gulp-htmlmin');
var uglify = require('gulp-uglify');
var pipeline = require('readable-stream').pipeline;

gulp.task("css", function () {
  return gulp.src("source/sass/style.sass")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(csso())
    .pipe(rename("style.min.css"))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/css"))
    .pipe(server.stream());
});

gulp.task("server", function () {
  server.init({
    server: "build/",
    notify: false,
    open: true,
    cors: true,
    ui: false
});

  gulp.watch("source/sass/**/*.sass", gulp.series("css"));
  gulp.watch([
    "source/img/htmlacademy.svg",
    "source/img/icon-fb.svg",
    "source/img/icon-insta.svg",
    "source/img/icon-vk.svg"
  ], gulp.series("sprite", "refresh"));
  gulp.watch(["source/*.html", "source/js/**"], gulp.series("refresh"));
});

gulp.task("refresh", function (done) {
  server.reload();
  done();
});

gulp.task("copy", function () {
  return gulp.src([
    "source/fonts/**/*.{woff,woff2}",
    "source/img/**/*.{png,jpg,svg}"
  ], {
    base: "source"
  })
    .pipe(gulp.dest("build"));
});

gulp.task("clean", function () {
  return del("build");
});

gulp.task("sprite", function () {
  return gulp.src([
    "build/img/htmlacademy.svg",
    "build/img/icon-fb.svg",
    "build/img/icon-insta.svg",
    "build/img/icon-vk.svg"
  ])
    .pipe(svgstore({ inlineSvg: true }))
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("build/img"));
});

gulp.task("optim", function () {
  return gulp.src(["build/img/**/*.{png,jpg,svg}", "!build/img/**/logo-*.svg"])
    .pipe(imagemin([
      imagemin.jpegtran({progressive: true}),
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest("build/img"));
});

gulp.task("webp", function () {
  return gulp.src("build/img/**/*.{png,jpg}")
    .pipe(webp({quality: 90}))
    .pipe(gulp.dest("build/img"));
});

gulp.task("html", function () {
  return gulp.src("source/*.html")
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest("build"));
});

gulp.task("js", function () {
  return pipeline(
        gulp.src("source/js/*.js"),
        uglify(),
        gulp.dest("build/js")
  );
});

gulp.task("build", gulp.series("clean", "copy", "css", "html", "js", "optim", "webp", "sprite"));
gulp.task("start", gulp.series("build", "server"));
