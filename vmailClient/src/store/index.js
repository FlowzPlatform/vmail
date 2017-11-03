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
    userDetails: ''
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
    async getEmailDetail({ dispatch,commit,state }, rId) {
      state.emailDetail = ''
      await axios({
        method: 'get',
        url: process.env.serviceUrl+'/emailDetail/'+rId,
        headers: {
          'authorization' : localStorage.getItem("token")
        }
      })
      .then(async response => {
        state.emailDetail = response.data
      })
      .catch(function(e){
        if(e.response.status === 401){
          localStorage.removeItem("token")
          state.loginToken = null
        }
      })
    }
  }
})