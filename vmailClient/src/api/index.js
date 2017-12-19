import axios from 'axios'
var VueCookie = require('vue-cookie')

export default {
  request (method, uri, data = null, headers= {'authorization': VueCookie.get('auth_token')}) {
    if (!method) {
      console.error('API function call requires method argument')
      return
    }

    if (!uri) {
      console.error('API function call requires uri argument')
      return
    }

    var url = process.env.microURL + uri
    return axios({ method, url, data, headers })
    .then(response => {
      return response
    })
    .catch(error => {
      return error.response.status
    })
  }
}