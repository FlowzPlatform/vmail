'use strict'
module.exports = {
  NODE_ENV: '"production"',
  loginURL: JSON.stringify(process.env.loginURL) || JSON.stringify('https://auth.'+process.env.domainkey+'/api'),
  microURL: JSON.stringify(process.env.microUrl) || JSON.stringify('https://api.'+process.env.domainkey+'/vmailmicro'),
  serverURL: JSON.stringify(process.env.serverBaseUrl) || JSON.stringify('https://api.'+process.env.domainkey+'/vservice/'),
  socketUrl: JSON.stringify(process.env.socketUrl) || JSON.stringify('wss://ws.'+process.env.domainkey+':4036'),
  loginWithGoogleUrl: JSON.stringify(process.env.loginWithGoogleUrl) || JSON.stringify('https://auth.'+process.env.domainkey+'/auth/Gplus'),
  loginWithFacebookUrl: JSON.stringify(process.env.loginWithFacebookUrl) || JSON.stringify('https://auth.'+process.env.domainkey+'/auth/facebook'),
  loginWithTwitterUrl: JSON.stringify(process.env.loginWithTwitterUrl) || JSON.stringify('https://auth.'+process.env.domainkey+'/auth/twitter'),
  loginWithGithubUrl: JSON.stringify(process.env.loginWithGithubUrl) || JSON.stringify('https://auth.'+process.env.domainkey+'/auth/github'),
  callbackUrl: JSON.stringify(process.env.callbackUrl) || JSON.stringify('https://vmail.'+process.env.domainkey)
}
