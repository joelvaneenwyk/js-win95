/* tslint:disable */

const compileParcel = require('./parcel-build-v2')

module.exports = async () => {
  try {
    await compileParcel()
    console.info('Assets generated successfully!')
  } catch (error) {
    console.error(`Error generating assets: ${error}`)
  }
}
