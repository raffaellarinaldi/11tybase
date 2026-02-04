require('dotenv').config()
const ftp = require('basic-ftp')

const ftpUpload = async () => {
  const client = new ftp.Client()
  client.ftp.verbose = true
  try {
    await client.access({
      host: process.env.FTP_HOST,
      user: process.env.FTP_USER,
      password: process.env.FTP_PASSWORD,
      port: process.env.FTP_DEFAULT_PORT || 21,
      secure: true,
      secureOptions: {
        rejectUnauthorized: false
      }
    })
    console.log(await client.list())
    await client.ensureDir('')
    await client.clearWorkingDir()
    await client.uploadFromDir(process.env.FTP_DIR)
  }
  catch(err) {
    console.log(err)
  }
  client.close()
}

module.exports = (eleventyConfig) => {
	if (process.env.ELEVENTY_ENV === 'deployment') {
		eleventyConfig.on('eleventy.after', () => {
			ftpUpload()
		})
	}
}
