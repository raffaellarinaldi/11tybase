const
path = require('path'),
gulp = require('gulp'),
rename = require('gulp-rename'),
download = require('gulp-download'),
cleanCSS = require('gulp-clean-css'),
uglify = require('gulp-uglify'),
concat = require('gulp-concat'),
{ handleStream } = require('./utils')

function copyAssets(config, cb) {
  const { paths, cdnResources, nodeModules } = config

  const tasks = []

  if (nodeModules.bootstrap) {
    tasks.push(
      gulp.src(nodeModules.bootstrap.scss)
        .pipe(gulp.dest(`${paths.vendor.css}/bootstrap`))
    )
    if (nodeModules.bootstrap.css) {
      tasks.push(
        gulp.src(nodeModules.bootstrap.css)
          .pipe(cleanCSS({ level: { 1: { specialComments: 0 } } }))
          .pipe(gulp.dest(`${paths.dist}/${paths.css}`))
      )
    }
    tasks.push(
      gulp.src(nodeModules.bootstrap.js)
        .pipe(uglify({ output: { comments: false } }))
        .pipe(gulp.dest(`${paths.dist}/${paths.js}`))
    )
  }

  if (nodeModules.uikit) {
    tasks.push(
      gulp.src(nodeModules.uikit.scss)
        .pipe(gulp.dest(`${paths.vendor.css}/uikit`))
    )
    tasks.push(
      gulp.src(nodeModules.uikit.js)
        .pipe(concat('uikit.min.js', { newLine: '' }))
        .pipe(uglify({ output: { comments: false } }))
        .pipe(gulp.dest(`${paths.dist}/${paths.js}`))
    )
  }

  cdnResources.css?.forEach(({ url, rename: newName }) => {
    const stream = download(url)
      .pipe(rename(newName || { dirname: '' }))
      .pipe(cleanCSS({ level: { 1: { specialComments: 0 } } }))
      .pipe(gulp.dest(`${paths.dist}/${paths.css}`))
    tasks.push(stream)
  })

  cdnResources.js?.forEach(({ url, rename: newName, minify }) => {
    let stream = download(url)
      .pipe(rename(filePath => {
        if (newName) filePath.basename = newName.replace(/\.js$/, '')
      }))
      .pipe(rename({ dirname: '' }))
    if (minify) stream = stream.pipe(uglify())
    stream = stream.pipe(uglify({ output: { comments: false } }))
    stream = stream.pipe(gulp.dest(`${paths.dist}/${paths.js}`))
    tasks.push(stream)
  })

  cdnResources.fonts?.forEach(({ url }) => {
    const stream = download(url, { encoding: false })
      .pipe(rename({ dirname: '' }))
      .pipe(gulp.dest(`${paths.dist}/${paths.fonts}`))
    tasks.push(stream)
  })

  Promise.all(tasks.map(handleStream))
    .then(() => {
      console.log('✔ All assets processed.')
      cb()
    })
    .catch(err => {
      console.error('✖ Error processing assets:', err)
      cb(err)
    })
}

module.exports = { copyAssets }
