const compileParcel = require('./parcel-build-v2')

module.exports = async () => {
  try {
    await Promise.all([compileParcel({ watch: true })])
    console.info('Assets generated successfully!')
  } catch (error) {
    console.error(`Error generating assets: ${error}`)
  }
}
