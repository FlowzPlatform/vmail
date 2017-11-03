<template>
  <div id="wrapper">
    <div id="sidebar-wrapper">
      <nav id="spy">
        <ul class="sidebar-nav nav">
          <li class="sidebar-brand" :id="'emailGroup'+key" v-for="(emailData,key) in emailGroups"> 
            <a v-on:click="getEmailSubjects(key,emailData.emailid)">
              {{emailData.emailid}}
              <span class="btn__badge" v-if="emailData.unreadCount>0">{{emailData.unreadCount}}</span>
            </a>
          </li>
        </ul>
      </nav>
    </div>
    <a id="menu-toggle" class="btn btn-menu btn-lg toggle" v-on:click="sidebarActivity">
      <i class="fa fa-bars fa-lg" v-if="!this.$store.state.sidebarOpen"></i>
      <i class="fa fa-times fa-lg" v-if="this.$store.state.sidebarOpen"></i>
    </a>
  </div>
</template>


<style scoped>
.btn__badge {
  height: 20px;
  width: 20px;
  color: #ffffff;
  float: right;
  position: absolute;
  background-color: #36c6d3;
  border-radius: 50%;
  text-indent: 0px;
  text-align: center;
  line-height: 20px;
  right: 7px;
  top: 10px;
}
.btn{
  padding: 0px;
  margin-top: 0px;
  position: relative;
  margin-left: -25px;
  color: #fff;
}
#wrapper {
  padding-top: 40px;
  padding-left: 20%;
  transition: all 0.4s ease 0s;
}
#sidebar-wrapper {
  margin-left: -20%;
  left: 20%;
  width: 20%;
  background-color: #364150;
  position: fixed;
  height: 100%;
  transition: all 0.4s ease 0s;
}
#wrapper.active {
  padding-left: 0;
}
#wrapper.active #sidebar-wrapper {
  left: 0;
}
#wrapper.active #menu-toggle{
  margin-left: 3px;
  color: #364150;
}
.sidebar-nav {
  top: 0;
  width: 100%;
  height: 920px;
  overflow-y: auto;
  list-style: none;
  margin-top: 27px;
  padding: 0;
  background-color: #364150;
}
.sidebar-nav li {
  line-height: 40px;
  text-indent: 20px;
  border-bottom: 1px solid #3d4957;
}
.sidebar-nav li a {
  color: #b4bcc8;
  display: block;
  text-decoration: none;
}
.sidebar-nav li:hover{
  background-color: #2c3542;
}
.sidebar-nav li a:hover,
.sidebar-nav li.active {
  text-decoration: none;
  cursor: pointer;
  background-color: #2c3542;
}
.sidebar-nav li a:active,
.sidebar-nav li a:focus {
  text-decoration: none;
}
.sidebar-nav > .sidebar-brand {
  height: 40px;
  line-height: 23px;
  font-size: 18px;
}
.sidebar-nav > .sidebar-brand a {
  font-size: 14px;
  font-weight: 300;
  color: #b4bcc8;
  /*font-family: sans-serif;*/
  white-space: nowrap;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
}
.sidebar-nav > .sidebar-brand a:hover {
  background: none;
}
</style>


<script>
import axios from 'axios'
import feathers from 'feathers/client';
import socketio from 'feathers-socketio/client';
import io from 'socket.io-client';
let baseUrl = process.env.serverUrl;
const app = feathers().configure(socketio(io(baseUrl)))

  export default {
    name: 'sidebar',
    data(){
      return{
        emailGroups:[]
      }
    },
    methods:{
      sidebarActivity(){
        this.$store.state.sidebarOpen = !this.$store.state.sidebarOpen
      },
      emailGroupService: function() {
        let self = this
        return axios({
          method: 'get',
          url: process.env.serviceUrl+'/emailGroups',
          headers: {
            'authorization': localStorage.getItem("token")
          }
        })
        .then(response => {
          self.emailGroups = response.data
        })
        .catch(function(e){
          if(e.response.status === 401){
            localStorage.removeItem("token")
            self.$store.state.loginToken = null
          }
        })
      },
      async getEmailSubjects(groupkey,emailId){
        let subKey = localStorage.getItem(emailId)
        $(".sidebar-brand").removeClass("active")
        $("#emailGroup"+groupkey).addClass("active")
        $(".subject-brand").removeClass("active")
        this.$store.state.composeOpen = false
        this.$store.state.settingOpen = false
        this.$store.state.displayReply = false
        this.$store.state.calenderOpen = false
        this.$store.state.mjmlOpen = false
        this.$store.state.conversations = []
        this.$store.state.selectedSubjectId = ''
        this.$store.state.selectedEmailId = emailId
        await this.$store.dispatch('getSubjects',emailId)
        if(subKey == null){
          await this.getEmailConversion(0,this.$store.state.subjects[0].messageId)
        }
        else{
          $("#emailSubject"+subKey).addClass("active")
          await this.getEmailConversion(subKey,this.$store.state.subjects[subKey].messageId)
        }
      },
      async getEmailConversion(subjectKey,rId){
        localStorage.setItem(this.$store.state.selectedEmailId,subjectKey)
        $(".subject-brand").removeClass("active")
        $("#emailSubject"+subjectKey).addClass("active")
        this.$store.state.replyDetails.to = []
        this.$store.state.replyDetails.cc = []
        this.$store.state.replyDetails.from = ''
        this.$store.state.replyDetails.parentId = ''
        this.$store.state.replyDetails.subject = ''
        this.$store.state.composeOpen = false
        this.$store.state.settingOpen = false
        this.$store.state.displayReply = false
        this.$store.state.calenderOpen = false
        this.$store.state.mjmlOpen = false
        this.$store.state.selectedSubjectId = rId
        this.$store.dispatch('getConversation',rId)
      }
    },
    async mounted() {
      await this.emailGroupService()
      if(this.emailGroups.length>0)
        await this.getEmailSubjects(0,this.emailGroups[0].emailid)

      app.service("mailservice").on("created", (message) => {
        this.emailGroupService()
        if(this.$store.state.selectedEmailId!='')
          this.$store.dispatch('getSubjects',this.$store.state.selectedEmailId)
        if(this.$store.state.selectedSubjectId!='')
          this.$store.dispatch('getConversation',this.$store.state.selectedSubjectId)
      })
      app.service("mailservice").on("updated", (message) => {
        this.emailGroupService()
        if(this.$store.state.selectedEmailId!='')
          this.$store.dispatch('getSubjects',this.$store.state.selectedEmailId)
        if(this.$store.state.selectedSubjectId!='')
          this.$store.dispatch('getConversation',this.$store.state.selectedSubjectId)
      })

      $(document).ready(function() {
        $("#menu-toggle").click(function(e) {
          e.preventDefault();
          $("#wrapper").toggleClass("active");
        });
      });
    }
  }
</script>