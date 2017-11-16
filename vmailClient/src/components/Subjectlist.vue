<template>
	<div>
    <div class="buttons">
      <a class="composeBtn" v-on:click="openCompose">
        <i class="fa fa-edit"></i> Compose
      </a>
      <a class="composeBtn" v-on:click="openCalender" style="background: #51c7d3" v-if="$store.state.selectedEmailId.length>0">
        <i class="fa fa-calendar"></i> Calender
      </a>
    </div>
		<nav id="spy">
      <ul class="subject-nav nav">
        <li class="subject-brand" :id="'emailSubject'+key" v-for="(emailSubject,key) in $store.state.subjects" v-bind:class="{ unreadAlert : emailSubject.unread }"> 
          <a v-on:click="getEmailConversion(key,emailSubject.messageId)" class="row">
          	<span class="subDiv col-md-8" :title="emailSubject.subject">{{emailSubject.subject}}</span>
          	<span class="subjectDate col-md-4">{{emailSubject.created | dateFormat(dateType,dateFormat) }}</span>
          </a>
        </li>
      </ul>
    </nav>
	</div>
</template>


<script>
var moment = require('moment')
  export default {
    name: 'subjectlist',
    data(){
      return {
        dateType: this.$store.state.dateType,
        dateFormat: this.$store.state.dateFormat
      }
    },
    methods:{
    	getEmailConversion(subjectKey,rId){
        localStorage.setItem(this.$store.state.selectedEmailId,subjectKey)
    		$(".subject-brand").removeClass("active")
        $("#emailSubject"+subjectKey).addClass("active")
        $("#emailSubject"+subjectKey).removeClass("unreadAlert")
        this.$store.state.replyDetails.to = []
				this.$store.state.replyDetails.cc = []
        this.$store.state.replyDetails.from = ''
        this.$store.state.replyDetails.parentId = ''
        this.$store.state.replyDetails.subject = ''
        this.$store.state.mjmlTheme = ''
    		this.$store.state.composeOpen = false
    		this.$store.state.settingOpen = false
    		this.$store.state.displayReply = false
    		this.$store.state.calenderOpen = false
        this.$store.state.mjmlOpen = false
        this.$store.state.selectedSubjectId = rId
        this.$store.dispatch('getConversation',rId)
    	},
    	openCompose(){
    		this.$store.state.replyDetails.to = []
				this.$store.state.replyDetails.cc = []
        this.$store.state.replyDetails.from = ''
        this.$store.state.replyDetails.parentId = ''
        this.$store.state.replyDetails.subject = ''
        this.$store.state.mjmlTheme = ''
    		this.$store.state.composeOpen = true
    		this.$store.state.settingOpen = false
    		this.$store.state.displayReply = false
    		this.$store.state.calenderOpen = false
        this.$store.state.mjmlOpen = false
    	},
    	openCalender(){
    		this.$store.state.replyDetails.to = []
				this.$store.state.replyDetails.cc = []
        this.$store.state.replyDetails.from = ''
        this.$store.state.replyDetails.parentId = ''
        this.$store.state.replyDetails.subject = ''
        this.$store.state.mjmlTheme = ''
    		this.$store.state.composeOpen = false
    		this.$store.state.settingOpen = false
    		this.$store.state.displayReply = false
    		this.$store.state.calenderOpen = true
        this.$store.state.mjmlOpen = false
    	}
    },
    filters: {
      dateFormat(date,dateType,dateFormat){
        let myDate;
        if(dateType!='relative')
        	myDate = moment(date).format(dateFormat)
        else
        	myDate = moment(date).fromNow()
        return myDate
      }
    }
  }
</script>


<style scoped>
  .composeBtn{
    border-color: #e7505a;
    background-color: #e7505a;
    color: #fff;
    padding: 8px 0px;
    /*padding-left: 35px;*/
    text-align: center;
    display: inline-block;
    /*width: 49%;*/
  }
  .composeBtn:hover{
    cursor: pointer;
    text-decoration: none;
  }
  .subject-nav {
    width: 100%;
    list-style: none;
    margin-top: 27px;
    height: 78vh;
    overflow-y: auto;
    overflow-x: hidden;
  }
  .subject-nav li {
    line-height: 40px;
    text-indent: 20px;
  }
  .subject-nav li a {
    color: #337ab7;
    display: block;
    padding-left: 0px;
    width: 100%;
    text-decoration: none;
  }
  .subject-nav li:hover{
    background-color: #f1f4f7;
  }
  .subject-nav li a:hover{
    cursor: pointer;
    background-color: #f1f4f7;
  }
  .subject-nav li.active {
    cursor: pointer;
    background-color: #f1f4f7;
  }
  .subject-nav > .subject-brand {
    height: 40px;
    line-height: 23px;
    font-size: 18px;
  }
  .subject-nav > .subject-brand a {
    padding-left: 0px;
    font-size: 14px;
    font-weight: 300;
    color: #337ab7;
    /*font-family: sans-serif;*/
  }
  .subject-nav > .subject-brand a:hover {
    background: none;
  }
  .subjectDate{
    float: right;
    font-size: 14px;
    font-weight: 300;
    color: #337ab7;
    overflow : hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    /*font-family: sans-serif;*/
  }
  .buttons{
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    flex-wrap: wrap;
    width: 100%;
  }
  .buttons a{
    flex-grow: 1;
    margin-left: 4px;
  }
  .unreadAlert{
    border-left: 4px solid #ed6b75;
  }
  .subDiv{
    overflow: hidden;
    text-align: left;
    display: block;
    float: left;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>