<style scoped>
 .addCcBcc{
	position: absolute;
  right: 35px;
  top: 30px;
  color: #3d4957;
}
.addCcBcc:hover{
	text-decoration: underline;
	cursor: pointer;
}
.subjectContent{
	border: none;
  border-bottom: 1px solid #dddddd;
  padding: 10px 15px;
  width: 100%;
}
.subjectContent:focus{
	outline: none;
}
.errMsg{
	text-align:center;
	font-size:20px;
}
#errMsg{
	color:#fff;
	background-color:#d65252;
	padding:4px 10px;
}
#successMsg{
  color: #9df23a;
  background-color: #00000070;
  padding: 4px 10px;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}
.col-md-12{
	margin-top: 20px;
	width: 98%;
	padding: 20px;
	margin-left: 1%;
	border: 1px solid #e7ecf1;
	background-color: #ffffff;
}
.composeBtn{
	border-radius: 5px;
}
.composeView{
	margin-left: 22%;
	width: 76%;
	/*height: 100%;*/
}
.composeActiveToggle{
	margin-left: 2%;
	width: 96%;
	height: 100%;
}
.tags-input{
	padding: 4px !important;
	font-size: 15px !important;
	box-shadow: none !important;
	border-bottom: 1px solid #cccccc !important;
}
.ql-toolbar.ql-snow{
	border: none !important;
	border-bottom: 1px solid #cccccc !important;
}
.ql-editor{
	border-top: 1px solid #cccccc !important;
	border-bottom: 1px solid #cccccc !important;
}
.contentArea{
	display: block;
	width: 100%;
	max-width: 100%;
	max-height: 450px;
	border: 1px solid #dddddd;
	overflow: auto;
}
</style>

<style type="text/css">
	.ql-container.ql-snow {
		height: 150px !important;
		overflow: auto;
	}
</style>


<template>
	<div v-bind:class="{composeView:$store.state.sidebarOpen,composeActiveToggle:!$store.state.sidebarOpen}">
		<div class="row">
			<div class="col-md-12">
				<div class="errMsg">
					<p id="errMsg" v-if="errMsg!=''">{{errMsg}}</p>
					<p id="successMsg" v-if="successMsg!=''">{{successMsg}}</p>
				</div>
				<p class="addCcBcc" title="add cc and bcc" v-on:click="addCcBcc">Cc/Bcc</p>
				<InputTag placeholder="To" :tags='tos' @tags-change="addtos"></InputTag>
				<InputTag placeholder="Cc" :tags='ccs' @tags-change="addccs" v-if="this.showCcBcc"></InputTag>
				<InputTag placeholder="Bcc" :tags='bccs' @tags-change="addbccs" v-if="this.showCcBcc"></InputTag>
				<input type='text' class="subjectContent" placeholder="Subject" v-model='subject' />
				<VueEditor v-model='content'></VueEditor>
				<div v-html='mjml' v-if="this.$store.state.mjmlTheme != ''" class="contentArea"></div>
				<div v-if="this.ical" style="padding-top: 5px;padding-bottom: 5px;display: flex;">
					<DatePicker type="date" placeholder="Choose date" v-model="icalDate"></DatePicker>
          <TimePicker format="HH:mm" placeholder="Choose time" v-model="icalTime"></TimePicker>
          <Input v-model="icalSummary" placeholder="Summary" style="display: inline-block;width: 54%;"></Input>
      		<Button type="info" v-on:click="this.icalEventCancel">Cancel</Button>
				</div>
				<div style="display: flex;">
					<button type="button" class="btn btn-success composeBtn" v-on:click="sendEmail">Send</button>
					<button type="button" class="btn btn-primary composeBtn" v-on:click="icalEvent">Calender Invite</button>
					<button type="button" class="btn btn-primary composeBtn" v-on:click="mjmlEvent">Templates</button>
					<button type="button" class="btn btn-danger composeBtn" v-on:click="discard">Discard</button>
				</div>
			</div>
		</div>
	</div>
</template>


<script>
import { VueEditor } from 'vue2-editor'
import InputTag from 'vue-tagsinput'
import axios from 'axios'
import _ from 'lodash'
var moment = require('moment')
import { mjml2html } from 'mjml'

  export default {
    name: 'compose',
    components:{
    	VueEditor,
    	InputTag
    },
    data(){
			return {
				tos: this.$store.state.replyDetails.to,
				ccs: _.clone(this.$store.state.replyDetails.cc),
				bccs:[],
				subject: this.$store.state.replyDetails.subject,
				content: '',
				errMsg: '',
				successMsg:'',
				showCcBcc: false,
				icalTime: '',
				icalDate: '',
				icalSummary: '',
				ical: false,
				mjml: ''
			}
    },
    methods:{
    	addtos: function(index, text) {
	      var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

	      if (re.test(text)) {
	        this.tos.splice(index,0, text)
	      } else {
	        this.tos.splice(index, 1)
	      }
	    },
	    addccs: function(index, text) {
	      var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

	      if (re.test(text)) {
	        this.ccs.splice(index,0, text)
	      } else {
	        this.ccs.splice(index, 1)
	      }
	    },
	    addbccs: function(index, text) {
	      var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

	      if (re.test(text)) {
	        this.bccs.splice(index,0, text)
	      } else {
	        this.bccs.splice(index, 1)
	      }
	    },
	    discard(){
	    	this.tos = []
	    	this.ccs = []
	    	this.bccs = []
	    	this.showCcBcc = false
				this.$store.state.replyDetails.to = []
				this.$store.state.replyDetails.cc = []
        this.$store.state.replyDetails.from = ''
        this.$store.state.replyDetails.parentId = ''
        this.$store.state.replyDetails.subject = ''
        this.$store.state.mjmlTheme = ''
        this.$store.state.mjmlTheme = ''
    		this.$store.state.composeOpen = false
    		this.$store.state.settingOpen = false
    		this.$store.state.displayReply = false
    		this.$store.state.calenderOpen = false
    		this.$store.state.mjmlOpen = false
    	},
    	addCcBcc(){
    		this.showCcBcc = !this.showCcBcc
    	},
    	sendEmail: function() {
	      if(this.tos.length>0){
		      let to = this.tos;
	        let cc = this.ccs;
	        let bcc = this.bccs;
	        let from = '';
	        let body = this.content + this.mjml

	        if (this.$store.state.replyDetails.from)
	          from = this.$store.state.replyDetails.from;
	        else
	          from = 'info@vmail.officebrain.com';

	        let myData = {
	          "to": to,
	          "cc": cc,
	          "bcc": bcc,
	          "from": from,
	          "subject": this.subject,
	          "body": body,
	          "replyTo": from,
	          "parentId": this.$store.state.replyDetails.parentId,
	          "icalStartTime": moment(this.icalTime).format('HH:mm:ss'),
	          "icalStartDate": moment(this.icalDate).format('YYYY-MM-DD'),
	          "icalSummary": this.icalSummary
	        }

	        myData = JSON.stringify(myData)
	        self.successMsg = 'Email is sending ...'
	        axios({
	          method: 'post',
	          url: process.env.serviceUrl+'/sendEmail',
	          data: myData,
	          headers: {
	            'authorization': this.$cookie.get('auth_token')
	          }
	        })
	        .then(response => {
	          let self = this
	          if (response) {
	            self.successMsg = 'Email sent successfully ..!'
            	self.tos = []
				    	self.ccs = []
				    	self.bccs = []
				    	self.showCcBcc = false
            	self.$store.state.replyDetails.to = []
            	self.$store.state.replyDetails.cc = []
			        self.$store.state.replyDetails.from = ''
			        self.$store.state.replyDetails.parentId = ''
			        self.$store.state.replyDetails.subject = ''
			        self.$store.state.mjmlTheme = ''
			        self.icalTime = ''
			        self.icalDate = ''
			        self.icalSummary = ''
	            setTimeout(function(option) {
	            	self.successMsg = ''
				    		self.$store.state.composeOpen = false
				    		self.$store.state.settingOpen = false
				    		self.$store.state.displayReply = false
				    		self.$store.state.calenderOpen = false
				    		self.$store.state.mjmlOpen = false
	            }, 3000)
	          }
	        })
	        .catch(function(e){
	        	let self = this
	          if(e.response.status === 401){
	            self.$cookie.delete('auth_token', {domain: location})
	            self.$store.state.loginToken = null
	          }
	        })
	      }
	      else{
	        this.errMsg = 'At least one recipient is required'
	        let self = this
	        setTimeout(function(option) {
	          self.errMsg = ''
	        }, 3000)
	      }
	    },
	    icalEvent(){
	    	this.ical = true
	    },
	    icalEventCancel(){
	    	this.ical = false
	    	this.icalTime = ''
        this.icalDate = ''
        this.icalSummary = ''
	    },
	    mjmlEvent(){
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
	  		this.$store.state.mjmlOpen = true
	    }
    },
    mounted(){
    	if(this.$store.state.mjmlTheme != ''){
    		let opt = mjml2html(this.$store.state.mjmlTheme)
    		this.mjml = opt.html
    	}
    }
  }
</script>
