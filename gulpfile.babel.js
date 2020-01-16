'use strict';
const isProduction = process.env.NODE_ENV === 'production';

// Dependencies
import gulp from 'gulp';
import del from 'del';
import gulpLoadPlugins from 'gulp-load-plugins';
import autoprefixer from 'autoprefixer';
import postcssClean from 'postcss-clean';
import spritesmith from 'gulp.spritesmith-multi';
import BrowserSync from 'browser-sync';
import webpack from 'webpack';
import webpackConfig from './webpack.config.js';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import log from 'fancy-log';

const plugins = gulpLoadPlugins();
const bworserSync = BrowserSync.create();
const webpackBundler = webpack(webpackConfig);

const paths = {
  clean: {
    demo: 'build/',
    sprites: 'src/assets/css/_ui/_sprite-*.less'
  },
  markup: {
    basepath: './src/',
    src: ['src/**/*.html', '!**/_*/**/*', '!**/_*'],
    partial: ['src/_*/**/*.html', 'src/**/_*.html'],
    dest: 'build/'
  },
  style: {
    src: ['src/**/*.less', '!**/_*/**/*', '!**/_*'],
    watch: ['src/**/*.less'],
    dest: 'build/'
  },
  image: {
    src: ['src/**/*.{png,jpg,jpeg,gif,svg}', '!**/_*/**/*', '!**/_*'],
    dest: 'build/'
  },
  sprites: {
    src: ['src/assets/images/_sprite/**/*.png'],
    dest: 'build/assets/images/sprite/',
    style: 'src/assets/css/_ui/',
    cssTemplate: 'src/assets/images/_sprite/template.hbs',
    imgPath: '/assets/images/sprite/'
  },
  server: {
    baseDir: 'build/'
  },
  font: {
    src: ['src/**/*.{eot,ttf,woff,woff2}'],
    dest: 'build/'
  },
  video: {
    src: ['src/**/*.mp4'],
    dest: 'build/'
  },
  json: {
    src: ['src/**/*.json'],
    dest: 'build/'
  }
};

// Task Functions
const clean = {
  demo: () => del([paths.clean.demo]),
  sprites: () => del([paths.clean.sprites])
};

const markup = () => {
  return gulp
    .src(paths.markup.src)
    .pipe(plugins.plumberNotifier())
    .pipe(plugins.newer(paths.markup.dest))
    .pipe(
      plugins.fileInclude({
        prefix: '@@',
        basepath: paths.markup.basepath,
        indent: true
      })
    )
    .pipe(
      plugins.htmlhint({
        htmlhintrc: '.htmlhintrc'
      })
    )
    .pipe(plugins.htmlhint.reporter())
    .pipe(gulp.dest(paths.markup.dest));
};

const partialedMarkup = () => {
  return gulp
    .src(paths.markup.src)
    .pipe(plugins.plumberNotifier())
    .pipe(
      plugins.fileInclude({
        prefix: '@@',
        basepath: paths.markup.basepath,
        indent: true
      })
    )
    .pipe(
      plugins.htmlhint({
        htmlhintrc: '.htmlhintrc'
      })
    )
    .pipe(plugins.htmlhint.reporter())
    .pipe(gulp.dest(paths.markup.dest));
};

const style = () => {
  return gulp
    .src(paths.style.src)
    .pipe(plugins.plumberNotifier())
    .pipe(plugins.newer(paths.style.dest))
    .pipe(plugins.if(!isProduction, plugins.sourcemaps.init()))
    .pipe(plugins.less())
    .pipe(plugins.csslint('.csslintrc'))
    .pipe(plugins.csslint.formatter())
    .pipe(plugins.csslint.formatter('fail'))
    .pipe(plugins.postcss([autoprefixer()]))
    .pipe(
      plugins.if(
        isProduction,
        plugins.postcss([
          postcssClean({
            compatibility: 'ie7',
            aggressiveMerging: false,
            restructuring: false,
            format: 'keep-breaks'
          })
        ])
      )
    )
    .pipe(plugins.if(!isProduction, plugins.sourcemaps.write()))
    .pipe(gulp.dest(paths.style.dest));
};

const image = () => {
  return gulp
    .src(paths.image.src)
    .pipe(plugins.plumberNotifier())
    .pipe(plugins.newer(paths.image.dest))
    // .pipe(
    //   plugins.if(
    //     isProduction,
    //     plugins.imagemin({
    //       interlaced: true,
    //       progressive: true
    //     })
    //   )
    // )
    .pipe(gulp.dest(paths.image.dest));
};

const sprites = () => {
  return gulp
    .src(paths.sprites.src)
    .pipe(plugins.plumberNotifier())
    .pipe(plugins.newer(paths.sprites.dest))
    .pipe(
      spritesmith({
        spritesmith: function(options, sprite) {
          options.cssName = '_sprite-' + sprite + '.less';
          options.cssSpritesheetName = 'sprite-' + sprite;
          options.cssTemplate = paths.sprites.cssTemplate;
          options.padding = 10;
          // options.imgPath = paths.sprites.imgPath + options.imgName;
          options.imgPath = '../images/sprite/' + options.imgName;
          options.cssHandlebarsHelpers = {
            sort: arr => {
              arr.sort((a, b) => {
                if (a.name < b.name) {
                  return -1;
                }
                if (a.name > b.name) {
                  return 1;
                }
                return 0;
              });
            },
            returnpx: function(num) {
              return num + 'px';
            }
          };
        }
      })
    )
    .pipe(
      plugins.if(
        '*.png',
        gulp.dest(paths.sprites.dest),
        gulp.dest(paths.sprites.style)
      )
    );
};

const server = () => {
  bworserSync.init({
    server: {
      baseDir: paths.server.baseDir,
      directory: true
    },
    middleware: [
      webpackDevMiddleware(webpackBundler, {
        publicPath: webpackConfig.output.publicPath,
        serverSideRender: true
      }),
      webpackHotMiddleware(webpackBundler)
    ],
    cors: true,
    startPath: '/',
    files: [
      paths.markup.dest + '**/*.html',
      paths.style.dest + '**/*.css',
      paths.image.dest + '**/*.{png,jpg,jpeg,gif}',
      paths.json.dest + '**/*.json',
      paths.json.dest + '**/*.mp4'
    ],
    ghostMode: false,
    notify: false
  });
};

const scripts = () => {
  return new Promise((resolve, reject) => {
    webpack(webpackConfig, (err, stats) => {
      if (err) {
        log.error('Webpack', err);
        reject(err);
      }

      log(stats.toString({ colors: true }));

      resolve();
    });
  });
};

const copy = {
  font: () => {
    return gulp
      .src(paths.font.src)
      .pipe(plugins.newer(paths.font.dest))
      .pipe(gulp.dest(paths.font.dest));
  },
  json:()=>{
    return gulp
      .src(paths.json.src)
      .pipe(plugins.newer(paths.json.dest))
      .pipe(gulp.dest(paths.json.dest));
  },
  video:()=>{
    console.log('video')
    return gulp
      .src(paths.video.src)
      .pipe(plugins.newer(paths.video.dest))
      .pipe(gulp.dest(paths.video.dest));
  }
};

const watch = () => {
  gulp.watch(paths.markup.src, gulp.series(['html']));
  gulp.watch(paths.sprites.src, gulp.series(['sprite+css']));
  gulp.watch(paths.style.watch, gulp.series(['css']));
  gulp.watch(paths.image.src, gulp.series(['img']));
  gulp.watch(paths.font.src, gulp.series(['copy']));
  gulp.watch(paths.json.src, gulp.series(['copy']));
  gulp.watch(paths.video.src, gulp.series(['copy']));
  gulp.watch(paths.markup.partial, gulp.parallel([partialedMarkup]));
};

gulp.task('clean', gulp.parallel([clean.demo, clean.sprites]));
gulp.task('html', markup);
gulp.task('css', style);
gulp.task('img', image);
gulp.task('sprites', sprites);
gulp.task('sprite+css', gulp.series('sprites', 'css'));
gulp.task('copy', gulp.parallel([copy.font,copy.json,copy.video]));
gulp.task('js', scripts);

const buildTasks = ['html', 'img',  'sprite+css', 'copy'];
let defaultTasks;

if (isProduction) {
  buildTasks.push('js');
  defaultTasks = gulp.series('clean', gulp.parallel(buildTasks));
} else {
  defaultTasks = gulp.series(
    'clean',
    gulp.parallel(buildTasks),
    gulp.parallel([server, watch])
  );
}

gulp.task('default', defaultTasks);
