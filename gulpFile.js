const { src, dest, watch, parallel, series } = require("gulp");
const sass = require("gulp-dart-sass");
const concat = require("gulp-concat");
const plumber = require("gulp-plumber");
const uglify = require("gulp-uglify-es").default;
const browserSync = require("browser-sync").create();
const autoprefixer = require('gulp-autoprefixer');
const clean = require('gulp-clean');

function scripts() {
  return src(["node_modules/swiper/swiper-bundle.js", "app/js/main.js"])
    .pipe(concat("main.min.js"))
    .pipe(uglify())
    .pipe(dest("app/js"))
    .pipe(browserSync.stream());
}

function styles() {
  return src("app/scss/style.scss")
    .pipe(autoprefixer({ overrideBrowserslist: ["last 10 versions"] })) 
    .pipe(sass({ outputStyle: "compressed" }))
    .pipe(concat("style.min.css"))
    .pipe(dest("app/css"))
    .pipe(plumber())
    .pipe(browserSync.stream());
}

function watching() {
  browserSync.init({
    server: {
      baseDir: "app/",
    },
  });
  watch(["app/scss/style.scss"], styles);
  watch(["app/js/main.js"], scripts);
  watch(["app/**/*.html"]).on("change", browserSync.reload);
}

function cleanDist() {
  return src('dist', {allowEmpty: true})
  .pipe(clean())
}

function building() {
  return src([
    'app/css/style.min.css',
    'app/js/main.min.js',
    'app/**/*.html'
  ], {base: 'app'})
  .pipe(dest('dist'))
}

exports.scripts = scripts;
exports.styles = styles;
exports.watching = watching;
exports.browsersync = browsersync;
exports.build = series(cleanDist,building)

exports.default = parallel(styles, scripts, browsersync, watching);
