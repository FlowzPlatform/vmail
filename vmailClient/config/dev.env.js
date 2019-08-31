'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  loginURL: JSON.stringify(process.env.loginURL) || JSON.stringify('http://auth.flowzcluster.tk/api'),
  microURL: JSON.stringify(process.env.microUrl) || JSON.stringify('http://localhost:3003'),
  serverURL: JSON.stringify(process.env.serverBaseUrl) || JSON.stringify('http://localhost:3036'),
  socketUrl: JSON.stringify(process.env.socketUrl) || JSON.stringify('http://localhost:3036'),
  loginWithGoogleUrl: JSON.stringify(process.env.loginWithGoogleUrl) || JSON.stringify('http://auth.flowzcluster.tk/auth/Gplus'),
  loginWithFacebookUrl: JSON.stringify(process.env.loginWithFacebookUrl) || JSON.stringify('http://auth.flowzcluster.tk/auth/facebook'),
  loginWithTwitterUrl: JSON.stringify(process.env.loginWithTwitterUrl) || JSON.stringify('http://auth.flowzcluster.tk/auth/twitter'),
  loginWithGithubUrl: JSON.stringify(process.env.loginWithGithubUrl) || JSON.stringify('http://auth.flowzcluster.tk/auth/github'),
	callbackUrl: JSON.stringify(process.env.callbackUrl) || JSON.stringify('http://localhost:8080')
})
