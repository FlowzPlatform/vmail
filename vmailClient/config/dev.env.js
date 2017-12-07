var merge = require('webpack-merge')
var prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: JSON.stringify('development'),
  serviceUrl: JSON.stringify(process.env.microUrl) || JSON.stringify('http://localhost:3003'),
  serverUrl: JSON.stringify(process.env.serverBaseUrl) || JSON.stringify('http://localhost:3036/'),
  authUrl: JSON.stringify(process.env.userLogin) || JSON.stringify('http://auth.flowz.com/api'),
  userUpdate: JSON.stringify(process.env.userUpdate) || JSON.stringify('http://162.242.223.167:3004/updateuserdetails/'),
  secretkey: JSON.stringify(process.env.secretkey),
  accesskey: JSON.stringify(process.env.accesskey),
  loginWithGoogleUrl: JSON.stringify(process.env.loginWithGoogleUrl) || JSON.stringify("http://ec2-54-88-11-110.compute-1.amazonaws.com/auth/Gplus"),
  loginWithFacebookUrl: JSON.stringify(process.env.loginWithFacebookUrl) || JSON.stringify("http://ec2-54-88-11-110.compute-1.amazonaws.com/auth/facebook"),
  callbackUrl: JSON.stringify(process.env.callbackUrl) || JSON.stringify("http://vmail.flowz.com")
})
