import gulp from "gulp";
import dartSass from "gulp-dart-sass";
import concat from "gulp-concat";
import cached from "gulp-cached";
import plumber from "gulp-plumber";
import uglify from "gulp-uglify-es";
import browserSyncLib from "browser-sync";
import autoprefixer from "gulp-autoprefixer";
import clean from "gulp-clean";
import webp from "gulp-webp";
import imagemin from "gulp-imagemin";
import newer from "gulp-newer";
import svgSprite from "gulp-svg-sprite";
import fonter from 'gulp-fonter';
import ttf2woff2Gulp from "gulp-ttf2woff2";
import include from "gulp-include";
import flatten from "gulp-flatten";

const { src, dest, watch, parallel, series } = gulp;

const browserSync = browserSyncLib.create();

function pages() {
  return src('app/pages/*.html')
  .pipe(include({
    includePaths: 'app/components'
  }))
  .pipe(dest('app'))
  .pipe(browserSync.stream())
}

function fonts() {
  return src('app/fonts/src/*.*')
  .pipe(fonter({
    formats: ['woff','ttf']
  }))
  .pipe(src('app/fonts/src/*.ttf'))
  .pipe(ttf2woff2Gulp())
  .pipe(flatten())
  .pipe(dest('app/fonts'))
}

function images() {
  return src(["app/images/src/**.*"], { encoding: false })
    .pipe(newer("app/images"))
    .pipe(webp())
    .pipe(dest("app/images"))

    .pipe(src("app/images/src/**.*"))
    .pipe(newer("app/images"))
    .pipe(imagemin())

    .pipe(dest("app/images"));
}

function sprite() {
  return src("app/images/*.svg")
    .pipe(svgSprite({
      mode: {
        symbol: { // Включаем режим "symbol"
          sprite: "../sprite.svg", // Путь к файлу спрайта
          example: true // Генерация HTML-примера (опционально)
        }
      }
    }))
    .pipe(dest("app/images"));
}

function scripts() {
  return src(["node_modules/swiper/swiper-bundle.js", "app/js/main.js"])
    .pipe(concat("main.min.js"))
    .pipe(uglify.default())
    .pipe(dest("app/js"))
    .pipe(browserSync.stream());
}

function styles() {
  return src("app/scss/style.scss") // Обрабатываем только главный SCSS-файл
    .pipe(plumber()) // Обработка ошибок
    .pipe(dartSass({ outputStyle: "compressed" })) // Компилируем SCSS в CSS
    .pipe(autoprefixer({ overrideBrowserslist: ["last 10 versions"] })) // Добавляем автопрефиксы
    .pipe(concat("style.min.css")) // Результат сохраняем как style.min.css
    .pipe(dest("app/css")) // Кладем итоговый файл в папку
    .pipe(browserSync.stream()); // Обновляем браузер
}


function watching() {
  browserSync.init({
    server: {
      baseDir: "app/",
    },
  });
  watch(["app/**/*.scss"], styles);
  watch(["app/images/src"], images);
  watch(["app/**/*.js"], scripts);
  watch(['app/components/*', 'app/pages/*'], pages)
  watch(["app/**/*.html"]).on("change", browserSync.reload);
}

function cleanDist() {
  return src("dist", { allowEmpty: true }).pipe(clean());
}

function building() {
  return src(
    [
      "app/css/style.min.css",
      "app/js/main.min.js",
      "app/**/*.html",
      "app/images/*.*",
      "!app/images/*.svg",
      "!app/images/symbol/**",
      "app/images/sprite.svg",
      "app/fonts/*.*"
    ],
    {
      base: "app",
    }
  ).pipe(dest("dist"));
}

export {fonts, images, sprite, scripts, styles, pages,watching };
export const build = series(cleanDist, building);
export default parallel(images, styles, scripts, pages, watching);
