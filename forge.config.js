const path = require('path');
const fs = require('fs');
const package_json = require('./package.json');

require('dotenv').config();

if (process.env['WINDOWS_CODESIGN_FILE']) {
  const certPath = path.join(__dirname, 'win-certificate.pfx');
  const certExists = fs.existsSync(certPath);

  if (certExists) {
    process.env['WINDOWS_CODESIGN_FILE'] = certPath;
  }
}

module.exports = {
  hooks: {
    generateAssets: require('./tools/generate-assets'),
  },
  packagerConfig: {
    asar: true,
    icon: path.resolve(__dirname, 'assets', 'icon'),
    appBundleId: 'com.joelvaneenwyk.windows95',
    appCategoryType: 'public.app-category.developer-tools',
    win32metadata: {
      CompanyName: 'Felix Rieseberg',
      OriginalFilename: 'windows95',
    },
    linux: {
      target: 'zip',
    },
    osxSign: {
      identity: 'Developer ID Application: Felix Rieseberg (LT94ZKYDCJ)',
      'hardened-runtime': true,
      'gatekeeper-assess': false,
      entitlements: 'assets/entitlements.plist',
      'entitlements-inherit': 'assets/entitlements.plist',
      'signature-flags': 'library',
    },
    osxNotarize: {
      appBundleId: 'com.felixrieseberg.macintoshjs',
      appleId: process.env['APPLE_ID'],
      appleIdPassword: process.env['APPLE_ID_PASSWORD'],
      ascProvider: 'LT94ZKYDCJ',
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
      /issue_template\.md/,
    ],
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin', 'win32', 'linux'],
    },
    {
      name: '@electron-forge/maker-squirrel',
      platforms: ['win32'],
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
          setupIcon: path.resolve(__dirname, 'assets', 'icon.ico'),
          certificateFile: process.env['WINDOWS_CODESIGN_FILE'],
          certificatePassword: process.env['WINDOWS_CODESIGN_PASSWORD'],
        };
      },
    },
    {
      name: '@electron-forge/maker-deb',
    },
    {
      name: '@electron-forge/maker-rpm',
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
  ],
};
