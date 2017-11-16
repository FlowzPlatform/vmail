import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
let Promise = require('promise')
const simpleParser = require('mailparser').simpleParser;

Vue.use(Vuex)

export const store = new Vuex.Store({
  state: {
    loginToken:localStorage.getItem("token"),
    calenderOpen:false,
    sidebarOpen:true,
    composeOpen:false,
    settingOpen:false,
    displayReply:false,
    mjmlOpen:false,
    selectedEmailId:'',
    selectedSubjectId:'',
    replyDetails:{
      to: [],
      cc: [],
      subject: '',
      from: '',
      parentId: ''
    },
    subjects:[],
    conversations:[],
    emailDetail:'',
    dateFormat: 'DD/MM/YY',
    dateType: 'relative',
    userDetails: '',
    mjmlTheme: ''
  },
  actions: {
    async getSubjects({ commit,state }, emailId) {
      await axios({
        method: 'get',
        url: process.env.serviceUrl+'/emailSubjects?eid='+emailId,
        headers: {
          'authorization' : localStorage.getItem("token")
        }
      })
      .then(response => {
        state.subjects = response.data
      })
      .catch(function(e){
        if(e.response.status === 401){
          localStorage.removeItem("token")
          state.loginToken = null
        }
      })
    },
    async getConversation({ dispatch,commit,state }, mid) {
      state.conversations = []
      await axios({
        method: 'get',
        url: process.env.serviceUrl+'/emailConversation?mid='+mid+'&sid='+state.selectedEmailId,
        headers: {
          'authorization' : localStorage.getItem("token")
        }
      })
      .then(async response => {
        state.conversations = response.data
      })
      .catch(function(e){
        if(e.response.status === 401){
          localStorage.removeItem("token")
          state.loginToken = null
        }
      })
    },
    async getEmailDetail({ dispatch,commit,state }, s3Key) {
      state.emailDetail = ''
      await axios({
        method: 'get',
        url: process.env.serviceUrl+'/emailDetail?s3Key='+s3Key,
        headers: {
          'authorization' : localStorage.getItem("token")
        }
      })
      .then(async response => {
        response.data['received'] = true 
        state.emailDetail = response.data
      })
      .catch(function(e){
        if(e.response.status === 401){
          localStorage.removeItem("token")
          state.loginToken = null
        }
      })
    },
    async parseEmail(email) {
      return new Promise((resolve, reject) => {
        const simpleParser = require('mailparser').simpleParser;
        simpleParser(email, (err, mail) => {
          resolve(mail);
        })
      })
    }
  }
})