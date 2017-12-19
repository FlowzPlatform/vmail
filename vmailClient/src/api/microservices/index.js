import api from '../../api'

export default {
  emailList: () => {
    return api.request('get', '/emailGroups')
  },
  subjectList: (emailId) => {
    return api.request('get', '/emailSubjects?eid='+emailId)
  },
  getConversation: (mId,sId) => {
    return api.request('get', '/emailConversation?mid='+mId+'&sid='+sId)
  },
  sendEmail: (data) => {
    return api.request('post', '/sendEmail', data)
  },
  requestIcalEvents: (start,end,emailId) => {
    return api.request('get', '/requestIcalEvents?start='+start+'&end='+end+'&email='+emailId)
  },
  saveMjml: (data) => {
    return api.request('post', '/saveMjml', data)
  },
  mjmlList: () => {
    return api.request('get', '/mjmlList')
  },
  getTheme: (id) => {
    return api.request('get', '/getTheme/'+id)
  },
  emailDetail: (key) => {
    return api.request('get', '/emailDetail?s3Key='+key)
  }
}