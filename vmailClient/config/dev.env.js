var merge = require('webpack-merge')
var prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: JSON.stringify('development'),
  serviceUrl: JSON.stringify(process.env.microUrl) || JSON.stringify('http://localhost:3000'),
  serverUrl: JSON.stringify(process.env.serverBaseUrl) || JSON.stringify('http://localhost:3030'),
  authUrl: JSON.stringify(process.env.userLogin) || JSON.stringify('http://ec2-54-88-11-110.compute-1.amazonaws.com/api'),
  userUpdate: JSON.stringify(process.env.userUpdate) || JSON.stringify('http://162.242.223.167:3004/updateuserdetails/'),
  secretkey: JSON.stringify(process.env.secretkey),
  accesskey: JSON.stringify(process.env.accesskey)
})
