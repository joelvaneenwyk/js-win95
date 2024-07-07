const { FusesPlugin } = require('@electron-forge/plugin-fuses')
const { FuseV1Options, FuseVersion } = require('@electron/fuses')
const { config } = require('dotenv')
const { resolve } = require('path')
const { execSync } = require('child_process');
const parcelBuild = require('./tools/parcel-build');

function initializeEnvironment() {
  config()

  /* @joelvaneenwyk #todo
  if (process.env['WINDOWS_CODESIGN_FILE']) {
    const certPath = path.join(__dirname, 'win-certificate.pfx')
    const certExists = fs.existsSync(certPath)

    if (certExists) {
      process.env['WINDOWS_CODESIGN_FILE'] = certPath
    }
  }
  */
}

initializeEnvironment()

module.exports = {
  hooks: {
    prePackage: async () => {
      execSync('npm run prePackage');
    },
    generateAssets: async () => {
      return await parcelBuild();
    }
  },
  packagerConfig: {
    asar: true,
    icon: resolve(__dirname, 'assets', 'icon'),
    appBundleId: 'com.joelvaneenwyk.windows95',
    appCategoryType: 'public.app-category.developer-tools',
    win32metadata: {
      CompanyName: 'Felix Rieseberg',
      OriginalFilename: 'windows95'
    },
    linux: {
      target: 'zip'
    },
    osxSign: {
      identity: 'Developer ID Application: Felix Rieseberg (LT94ZKYDCJ)',
      'hardened-runtime': true,
      'gatekeeper-assess': false,
      entitlements: 'assets/entitlements.plist',
      'entitlements-inherit': 'assets/entitlements.plist',
      'signature-flags': 'library'
    },
    osxNotarize: {
      appBundleId: 'com.felixrieseberg.macintoshjs',
      appleId: process.env['APPLE_ID'],
      appleIdPassword: process.env['APPLE_ID_PASSWORD'],
      ascProvider: 'LT94ZKYDCJ'
    },
    ignore: [
      /\/\.github(\/?)/,
      /\/\.yarn(\/?)/,
      /\/\.vs(\/?)/,
      /\/assets(\/?)/,
      /\/docs(\/?)/,
      /\/tools(\/?)/,
      /\/src\/.*\.ts/,
      /package-lock\.json/,
      /README\.md/,
      /tsconfig\.json/,
      /Dockerfile/,
      /issue_template\.md/
    ]
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: (arch) => {
        return {
          name: 'windows95',
          authors: 'Felix Rieseberg',
          description: 'The Windows 95 app that runs on macOS, Windows, and Linux.',
          exe: 'windows95.exe',
          noMsi: true,
          remoteReleases: '',
          iconUrl:
            'https://raw.githubusercontent.com/joelvaneenwyk/windows95/develop/assets/icon.ico',
          loadingGif: './assets/boot.gif',
          setupExe: `windows95-${package_json.version}-setup-${arch}.exe`,
          setupIcon: path.resolve(__dirname, 'assets', 'icon.ico')
          //certificateFile: process.env['WINDOWS_CODESIGN_FILE'],
          //certificatePassword: process.env['WINDOWS_CODESIGN_PASSWORD']
        }
      }
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin']
    },
    {
      name: '@electron-forge/maker-deb',
      config: {}
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {}
    }
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {}
    },
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true
    })
  ]
}
