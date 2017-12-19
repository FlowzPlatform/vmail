'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  loginURL: JSON.stringify(process.env.loginURL) || JSON.stringify('http://auth.flowz.com/api'),
  microURL: JSON.stringify(process.env.microUrl) || JSON.stringify('http://api.flowz.com/vmailmicro'),
  serverURL: JSON.stringify(process.env.serverBaseUrl) || JSON.stringify('http://api.flowz.com/vservice/'),
  socketUrl: JSON.stringify(process.env.socketUrl) || JSON.stringify('http://ws.flowz.com:4036'),
  loginWithGoogleUrl: JSON.stringify(process.env.loginWithGoogleUrl) || JSON.stringify('http://auth.flowz.com/auth/Gplus'),
  loginWithFacebookUrl: JSON.stringify(process.env.loginWithFacebookUrl) || JSON.stringify('http://auth.flowz.com/auth/facebook'),
	callbackUrl: JSON.stringify(process.env.callbackUrl) || JSON.stringify('http://vmail.flowz.com')
})
