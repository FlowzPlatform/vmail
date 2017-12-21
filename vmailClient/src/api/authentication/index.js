import axios from 'axios'

export default {
  login: (params) => {
    return axios({
      method: 'post',
      url: process.env.loginURL + '/login',
      data: params
    }).then(response => {
      if (response) {
        return response.data
      } else {
        throw new Error('Network error!')
      }
    })
  },
  ldapLogin: (params) => {
    return axios({
      method: 'post',
      url: process.env.loginURL + '/ldapauth',
      data: params
    }).then(response => {
      if (response) {
        return response.data
      } else {
        throw new Error('Network error!')
      }
    })
  },
  gmailLogin: (params) => {
    return axios({
      method: 'post',
      url: process.env.loginURL + '/verifyemail',
      data: params
    }).then(response => {
      if (response) {
        return response.data
      } else {
        throw new Error('Network error!')
      }
    })
  },
  userdetail: (authToken) => {
    return axios({
      method: 'get',
      url: process.env.loginURL + '/userdetails',
      headers: {
        'authorization': authToken
      }
    }).then(response => {
      if (response) {
        return response.data.data
      } else {
        throw new Error('Network error!')
      }
    })
  },
  // register: (params) => {
  //   return axios({
  //     method: 'post',
  //     url: config.loginURL + '/setup',
  //     data: params
  //   }).then(response => {
  //     if (response) {
  //       return response.data
  //     } else {
  //       throw new Error('Network error!')
  //     }
  //   }).catch(error => {
  //     throw error
  //   })
  // }
}