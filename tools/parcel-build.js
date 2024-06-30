// @ts-check

const path = require('path')
const fs = require('fs-extra')

async function copyLib() {
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
 *
 * @param {import('@parcel/types').InitialParcelOptions} options
 */
async function _compileParcel(options = {}) {
  const rootDir = path.resolve(path.join(__dirname, '../'))
  const entryFiles = [
    path.join(rootDir, 'static', 'index.html')
  ]
  const distDir = path.join(rootDir, 'dist');
  const publicDir = path.join(rootDir)

  const Parcel = require('@parcel/core').default;
  const bundler = new Parcel({
    config: '@parcel/config-default',
    defaultConfig: '@parcel/config-default',
    entries: entryFiles,
    logLevel: 'info',
    mode: 'development',
    defaultTargetOptions: {
      shouldOptimize: false,
      sourceMaps: true,
      distDir: distDir,
      publicUrl: publicDir,
      outputFormat: 'global',
      isLibrary: false,
      shouldScopeHoist: true
    },
    ...options
  })

  // Run the bundler, this returns the main bundle
  // Use the events if you're using watch mode as this promise will only trigger once and not for every rebuild
  try {
    await copyLib();
  } finally {
    return await bundler.run();
  }

  //if (fs.existsSync(distDir)) {
  //  fs.rmSync(distDir, { recursive: true });
  //}
  //const Parcel = require('@parcel/core').default
  //const distDir = path.join(__dirname, '/../dist/')
  //let bundler = new Parcel({
  //  entries: path.join(__dirname, '../static/index.html'),
  //  defaultConfig: require.resolve('@parcel/config-default'),
  //  defaultTargetOptions: {
  //    outputFormat: 'esmodule',
  //    distDir: distDir,
  //    engines: {
  //      browsers: ['> 0.25%, not dead'],
  //      electron: '31.1.0'
  //    },
  //    sourceMaps: true,
  //    shouldOptimize: false,
  //    shouldScopeHoist: false,
  //    publicUrl: path.join(__dirname, '/../')
  //  },
  //  logLevel: 'verbose',
  //  mode: 'development'
  //})
  //try {
  //  await copyLib()
  //} finally {
  //  return await bundler.run()
  //}
}

/**
 *
 * @param {import('@parcel/types').InitialParcelOptions} options
 */
module.exports = async (options = {}) => {
  let result;

  try {
    result = await _compileParcel(options);
    console.info(`[windows95] Compile step for Parcel completed.`);
  } catch (reason) {
    const issue = `[windows95] Error caught running Parcel. ${reason}`;
    console.error(issue);
    throw Error(issue);
  }

  return result;
};
