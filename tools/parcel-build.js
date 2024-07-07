// @ts-check

const path = require('path')
var log = require('loglevel')
const fs = require('fs-extra')

async function copyLib() {
  const target = path.join(__dirname, '../dist/static')
  const sourceStatic = path.join(__dirname, '../static')
  const lib = path.join(__dirname, '../src/renderer/lib')

  // Copy in lib
  let copiedPaths = [target]
  await fs.copy(lib, target)

  // Patch so that fs.read is used
  const libv86path = path.join(target, 'libv86.js')
  const libv86 = fs.readFileSync(libv86path, 'utf-8')
  const patchedLibv86 = libv86.replace(
    'v86util.load_file="undefined"===typeof XMLHttpRequest',
    'v86util.load_file="undefined"!==typeof XMLHttpRequest'
  )
  fs.writeFileSync(libv86path, patchedLibv86)
  copiedPaths.push(libv86path)

  // Overwrite
  const indexSource = path.join(sourceStatic, 'index.html')
  const index = path.join(target, 'index.html')
  let indexContents = ''
  try {
    indexContents = fs.readFileSync(index, 'utf-8')
  } catch (error) {
    indexContents = fs.readFileSync(indexSource, 'utf-8')
  }
  const replacedContents = indexContents.replace(
    '<!-- libv86 -->',
    '<script src="libv86.js"></script>'
  )
  fs.writeFileSync(index, replacedContents)
  copiedPaths.push(index)

  return copiedPaths
}

/**
 * Run Parcel to compile and generate assets which are then passed to Electron Forge and processed further.
 *
 * @param {boolean} watch
 */
async function buildAssets(watch = false) {
  // BuildSuccessEvent
  /** @type {import('@parcel/types').BuildSuccessEvent | undefined} */
  let result

  /** @type {import('@parcel/core').Parcel | undefined} */
  let bundler

  // Run the bundler, this returns the main bundle
  // Use the events if you're using watch mode as this promise will only trigger once and not for every rebuild
  try {
    const updatedFiles = await copyLib()
    if (updatedFiles !== null) {
      const rootDir = path.resolve(path.join(__dirname, '../'))

      const distDir = path.join(rootDir, 'dist')
      const publicDir = path.join(rootDir)

      const entryFiles = [
        path.join(rootDir, 'src', 'main', 'main.ts'),
        path.join(rootDir, 'static', 'index.html')
      ]
      const Parcel = require('@parcel/core').default
      bundler = new Parcel({
        defaultConfig: '@parcel/config-default',
        entries: entryFiles,
        shouldDisableCache: true,
        logLevel: 'verbose',
        mode: 'development',
        defaultTargetOptions: {
          shouldOptimize: false,
          sourceMaps: true,
          distDir: distDir,
          publicUrl: publicDir,
          shouldScopeHoist: false
        }
      })

      result = await bundler.run()

      if (result !== undefined && watch) {
        log.warn('[windows95] Initiating Parcel watch mode.')
        await bundler?.watch((err, buildEvent) => {
          if (err) {
            log.error(
              `[windows95] Parcel build event '${buildEvent}' failed to complete. ${err}`
            )
          } else {
            log.info(`[windows95] Parcel build event '${buildEvent}' completed.`)
          }
        })
      }
    } else {
      log.error('[windows95] Error copying lib files.')
    }
  } catch (reason) {
    log.trace()
    const issue = `[windows95] Error caught running Parcel. ${reason}`
    log.error(issue)
  }

  return result
}

// @ts-ignore
if (!module.parent) {
  log.info('Running asset generation directly since we were not imported.')
  buildAssets()
}

module.exports = buildAssets
