const
fs = require('fs'),
path = require('path'),
fsPromises = fs.promises,
gulp = require('gulp'),
replace = require('gulp-replace'),
googleWebfonts = require('gulp-google-webfonts')

function downloadGoogleFonts(paths) {
  return new Promise((resolve, reject) => {
    const sourceDir = path.join(paths.dist, paths.css)
    const sourcePath = path.join(sourceDir, '_fonts.scss')
    const destDir = path.join(paths.vendor.css, 'google')

    gulp.src('fonts.list')
      .pipe(googleWebfonts({
        fontsDir: paths.fonts,
        cssDir: paths.css,
        cssFilename: '_fonts.scss',
        fontDisplayType: 'block'
      }))
      .pipe(replace(/url\((['"]?)assets\/fonts\//g, 'url($1../fonts/'))
      .pipe(gulp.dest(paths.dist))
      .on('end', () => {
        gulp.src(sourcePath)
          .pipe(gulp.dest(destDir))
          .on('end', async () => {
            try {
              await fsPromises.unlink(sourcePath)
              resolve()
            } catch (err) {
              reject(err)
            }
          })
          .on('error', reject)
      })
      .on('error', reject)
  })
}

module.exports = { downloadGoogleFonts }
