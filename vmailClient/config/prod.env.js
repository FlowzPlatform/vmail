module.exports = {
  NODE_ENV: JSON.stringify('production'),
  serviceUrl: JSON.stringify(process.env.microUrl) || JSON.stringify('http://localhost:3000'),
  serverUrl: JSON.stringify(process.env.serverBaseUrl) || JSON.stringify('http://localhost:3036/'),
  authUrl: JSON.stringify(process.env.userLogin) || JSON.stringify('http://ec2-54-88-11-110.compute-1.amazonaws.com/api')
}