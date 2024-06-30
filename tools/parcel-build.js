// @ts-check

async function copyLib() {
  const path = require('path')
  const fs = require('fs-extra')
  const target = path.join(__dirname, '../dist/static')
  const lib = path.join(__dirname, '../src/renderer/lib')
  const index = path.join(target, 'index.html')

  // Copy in lib
  await fs.copy(lib, target)

  // Patch so that fs.read is used
  const libv86path = path.join(target, 'libv86.js')
  const libv86 = fs.readFileSync(libv86path, 'utf-8')
  const patchedLibv86 = libv86.replace(
    'v86util.load_file="undefined"===typeof XMLHttpRequest',
    'v86util.load_file="undefined"!==typeof XMLHttpRequest'
  )
  fs.writeFileSync(libv86path, patchedLibv86)

  // Overwrite
  const indexContents = fs.readFileSync(index, 'utf-8')
  const replacedContents = indexContents.replace(
    '<!-- libv86 -->',
    '<script src="libv86.js"></script>'
  )
  fs.writeFileSync(index, replacedContents)
}

/**
 * Run Parcel to compile and generate assets which are then passed to Electron Forge and processed further.
 *
 * @param {boolean} watch
 */
async function _compileParcel(watch = false) {
  const path = require('path')
  const rootDir = path.resolve(path.join(__dirname, '../'))
  const entryFiles = [path.join(rootDir, 'static', 'index.html')]

  const distDir = path.join(rootDir, 'dist')
  const publicDir = path.join(rootDir)

  const Parcel = require('@parcel/core').default
  const bundler = new Parcel({
    config: '@parcel/config-default',
    defaultConfig: '@parcel/config-default',
    entries: entryFiles,
    logLevel: 'verbose',
    mode: 'development',
    defaultTargetOptions: {
      shouldOptimize: false,
      sourceMaps: true,
      distDir: distDir,
      publicUrl: publicDir,
      outputFormat: 'esmodule',
      isLibrary: false,
      shouldScopeHoist: false,
      engines: {
        browsers: ['> 0.25%, not dead'],
        electron: '31.1.0'
      }
    }
  })

  // Run the bundler, this returns the main bundle
  // Use the events if you're using watch mode as this promise will only trigger once and not for every rebuild
  try {
    await copyLib()
  } finally {
    if (watch) {
      return bundler.watch((err, buildEvent) => {
        if (err) {
          console.error(
            `[windows95] Parcel build event '${buildEvent}' failed to complete. ${err}`
          )
        } else {
          console.info(`[windows95] Parcel build event '${buildEvent}' completed.`)
        }
      })
    }
    return bundler.run()
  }
}

/**
 *
 * @param {boolean} watch
 * @returns
 */
module.exports = async (watch = false) => {
  let result

  try {
    result = await _compileParcel(watch)
    console.info(`[windows95] Compile step for Parcel completed.`)
  } catch (reason) {
    const issue = `[windows95] Error caught running Parcel. ${reason}`
    console.error(issue)
    throw Error(issue)
  }

  return result
}
