const DEV_PORT = 3001;

const gulp = require('gulp');
const gUtil = require('gulp-util');
const express = require('express');
const webpack = require('webpack');
const webpackStream = require('webpack-stream');
const webpackDevMiddleware = require('webpack-dev-middleware');
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

function getWebpackConfig(isDev) {

  const files = fs.readdirSync('./demo/', 'utf-8').filter(name => name.endsWith('.js'));
  const entry = {};
  if (isDev) {
    files.forEach(item => {
      const baseName = path.basename(item, '.js');
      entry[baseName] = ['babel-polyfill', `./demo/${item}`];
    });
  } else {
    entry.index = './src/index.js';
  }

  var config = {
    entry,
    output: {
      path: path.join(__dirname, 'build'),
      filename: isDev ? '[name].bundle.js' : 'index.umd.js',
      publicPath: isDev ? undefined : '/',
      library: isDev ? undefined : 'glib',
      libraryTarget: isDev ? undefined : 'umd'
    },
    module: {
      loaders: [
        {
          test: /\.js$/,
          exclude: /(node_modules)/,
          loader: 'babel-loader'
        }
      ]
    },
    plugins: [
    ]
  };

  if (!isDev) {
    config.plugins.push(new UglifyJSPlugin());
  }

  return config;
}

gulp.task('dev', (cb) => {
  const app = express();
  const config = getWebpackConfig(true);
  const compiler = webpack(config);
  app.use(webpackDevMiddleware(compiler, {
    publicPath: config.output.publicPath
  }));
  app.use(express.static('demo'));
  app.listen(DEV_PORT, function () {
    gUtil.log('[webpack-dev-server]', 'build');
  });
});

gulp.task('build', function () {
  return gulp.src('src/index.js')
    .pipe(webpackStream(getWebpackConfig()))
    .pipe(gulp.dest(process.env.BUILD_DEST || 'build/'));
});