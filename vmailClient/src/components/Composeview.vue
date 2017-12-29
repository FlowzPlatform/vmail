<template>
	<div id="Composeview">
    <v-flex style="position: relative;">
    	<div id="successMsg" v-if="emailMsg != null">
    		<v-alert outline color="success" :value="emailMsg" style="margin-top: 50px;">
		      {{ emailMsg }}
		    </v-alert>
    	</div>
      <v-card id="tos" style="background-color: #353741">
      	
      	<v-layout row wrap>
	    		<v-flex xs9 sm10 md10 lg10>
	    			<template>
						  <v-select
						    label="To"
						    chips
						    tags
						    solo
						    clearable
						    v-model="toEmails">
						    <template slot="selection" slot-scope="data">
						      <v-chip close @input="removeTos(data.item)" :selected="data.selected">
						        <strong>{{ data.item }}</strong>
						      </v-chip>
						    </template>
						  </v-select>
						</template>
	    		</v-flex>
	    		<v-flex xs3 sm2 md2 lg2>
	    			<p class="text-xs-right ccbcc" @click="showCc=!showCc">
	    				Cc/Bcc
	    				<i class="fa fa-caret-down" v-if="!showCc"></i>
	    				<i class="fa fa-caret-up" v-if="showCc"></i>
	    			</p>
	    		</v-flex>
	    	</v-layout>
      </v-card>
      
      <v-card id="ccs" v-if="showCc">
      	<v-divider></v-divider>
        <template>
				  <v-select
				    label="Cc"
				    chips
				    tags
				    solo
				    clearable
				    v-model="ccsEmails">
				    <template slot="selection" slot-scope="data">
				      <v-chip close @input="removeCcs(data.item)" :selected="data.selected">
				        <strong>{{ data.item }}</strong>
				      </v-chip>
				    </template>
				  </v-select>
				</template>
      </v-card>
      
      <v-card id="bccs" v-if="showCc">
      	<v-divider></v-divider>
        <template>
				  <v-select
				    label="Bcc"
				    chips
				    tags
				    solo
				    clearable
				    v-model="bccsEmails">
				    <template slot="selection" slot-scope="data">
				      <v-chip close @input="removeBccs(data.item)" :selected="data.selected">
				        <strong>{{ data.item }}</strong>
				      </v-chip>
				    </template>
				  </v-select>
				</template>
      </v-card>
      
      <v-card>
      	<v-divider></v-divider>
        <v-text-field
          label="Subject"
          single-line
          full-width
          hide-details
          v-model="subject"
        ></v-text-field>
      </v-card>
      
      <v-divider></v-divider>
      <v-card id="emailEditor">
        <tinymce id="d1" v-model="body"></tinymce>
        <div v-html='mjml' v-if="this.$store.state.mjmlTheme != ''" class="contentArea"></div>

        <template v-if="showCal">
          <v-layout row wrap>
            <v-flex xs12 sm6 md6 lg6>
              <v-menu
                lazy
                :close-on-content-click="false"
                transition="scale-transition"
                offset-y
                full-width
                :nudge-right="40"
                max-width="290px"
                min-width="290px"
              >
                <v-text-field
                  slot="activator"
                  label="Date in M/D/Y format"
                  v-model="dateFormatted"
                  prepend-icon="event"
                  @blur="date = parseDate(dateFormatted)"
                ></v-text-field>
                <v-date-picker v-model="calDetail.date" @input="dateFormatted = formatDate($event)" no-title scrollable actions>
                  <template slot-scope="{ save, cancel }">
                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn flat color="primary" @click="cancel">Cancel</v-btn>
                      <v-btn flat color="primary" @click="save">OK</v-btn>
                    </v-card-actions>
                  </template>
                </v-date-picker>
              </v-menu>
            </v-flex>

            <v-flex xs12 sm5 md5 lg5 offset-sm1 offset-md1 offset-lg1>
              <v-menu
                lazy
                :close-on-content-click="false"
                transition="scale-transition"
                offset-y
                full-width
                :nudge-right="40"
                max-width="290px"
                min-width="290px"
                id="timePicker"
              >
                <v-text-field
                  slot="activator"
                  label="Picker in menu"
                  v-model="calDetail.time"
                  prepend-icon="access_time"
                ></v-text-field>
                <v-time-picker v-model="calDetail.time" autosave></v-time-picker>
              </v-menu>
            </v-flex>
          </v-layout>
          <v-layout row wrap>
            <v-flex xs12 sm10 md10 lg10>
              <v-text-field
                label="Summary"
                v-model="calDetail.summary"
              ></v-text-field>
            </v-flex>
            <v-flex xs12 sm2 md2 lg2>
              <v-btn color="primary" @click="closeCalendar">Close</v-btn>
            </v-flex>
          </v-layout>
        </template>

        <v-btn color="success" style="margin-left: 0px;" @click="sendEmail">Send</v-btn>
        <v-btn color="primary" style="margin-left: 0px;" @click="showCal = true" v-if="!showCal">Calendar</v-btn>
        <v-btn color="primary" style="margin-left: 0px;" @click="openMjml">Templates</v-btn>
      </v-card>

      <v-snackbar
      	color="red"
	      :timeout="4000"
	      :top="true"
	      v-model="validationDiv"
	    >
	    {{ validationMsg }}
	    <v-btn flat @click.native="validationDiv = false">Close</v-btn>
	  </v-snackbar>
    </v-flex>
  </div>
</template>


<script>
import microservices from '@/api/microservices'
import { mapGetters } from 'vuex'
var moment = require('moment')
import { mjml2html } from 'mjml'

export default{
	name: 'Composeview',
	data(){
    return {
    	showCc: false,
    	body: '',
      toEmails: this.$store.state.replyDetails.to.slice(),
      ccsEmails: this.$store.state.replyDetails.cc.slice(),
      bccsEmails: [],
      subject: this.$store.state.replyDetails.subject,
      validationDiv: false,
      validationMsg: '',
      emailMsg: null,
      dateFormatted: null,
      showCal:false,
      calDetail:{
        summary: '',
        date: '',
        time: ''
      },
      mjml: ''
    };
  },
  methods: {
    openMjml () {
      this.$router.push({ path: 'Emailtemplate' })
      this.$store.state.replyDetails.subject = this.subject
      this.$store.state.replyDetails.to = this.toEmails
      this.$store.state.replyDetails.cc = this.ccsEmails
    },
    formatDate (date) {
      if (!date) {
        return null
      }

      const [year, month, day] = date.split('-')
      return `${month}/${day}/${year}`
    },
    parseDate (date) {
      if (!date) {
        return null
      }

      const [month, day, year] = date.split('/')
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
    },
    removeTos(item) {
      this.toEmails.splice(this.toEmails.indexOf(item), 1)
      this.toEmails = [...this.toEmails]
    },
    removeCcs(item) {
      this.ccsEmails.splice(this.ccsEmails.indexOf(item), 1)
      this.ccsEmails = [...this.ccsEmails]
    },
    removeBccs(item) {
      this.bccsEmails.splice(this.bccsEmails.indexOf(item), 1)
      this.bccsEmails = [...this.bccsEmails]
    },
    validate(){
    	let emailIds = this.toEmails.concat(this.ccsEmails).concat(this.bccsEmails)
    	let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	      
      let len = emailIds.length
      if(this.toEmails.length>0){
      	for (let i = 0; i < len; i++) {
				  if(!re.test(emailIds[i])){
				  	this.validationMsg = "Please enter valid email addresses.."
				  	this.validationDiv = true
				  	return false 
				  }
				}
				return true	
      }
      else{	
      	this.validationMsg = "Atleast one recipient is required.."
				this.validationDiv = true
      	return false
      }
    },
    async sendEmail(){
    	let validate = await this.validate()
    	if(validate){

    		let from = ''
    		if (this.$store.state.replyDetails.from){
          from = this.$store.state.replyDetails.from;
    		}
        else{
          from = 'info@flowz.com';
        }

        let body = this.body+'<br><p>----- Original Message -----</p><br><p>From:'+this.$store.state.replyDetails.to.toString()+'</p><p>To:'+this.$store.state.replyDetails.from+'</p><p>Cc:'+this.$store.state.replyDetails.cc.toString()+'</p><p>Subject:'+this.$store.state.replyDetails.subject+'</p>'+this.$store.state.replyDetails.content

    		let myData = {
          "to": this.toEmails,
          "cc": this.ccsEmails,
          "bcc": this.bccsEmails,
          "from": from,
          "subject": this.subject,
          "body": body,
          "replyTo": from,
          "parentId": this.$store.state.replyDetails.parentId,
          "icalStartTime": moment(this.calDetail.time,"h:mm A").format('HH:mm:ss'),
          "icalStartDate": moment(this.calDetail.date).format('YYYY-MM-DD'),
          "icalSummary": this.calDetail.summary
        }

        myData = JSON.stringify(myData)

        this.emailMsg = 'Email is sending...'

        let emailRes = await microservices.sendEmail(myData)
        if(emailRes === 401){
          this.$router.push({ path: '/login' })
        }
        else if (emailRes === 500){					
        	let self = this
					this.emailMsg = "Email can't be sent"
            setTimeout(function(option) {
              self.emailMsg = null
            },3000)
        }
        else{
        	let self = this
        	this.emailMsg = "Email sent successfully ..!"
            setTimeout(function(option) {
              self.emailMsg = null
              self.$store.state.showReply = false
            },2000)  

          this.toEmails = []
          this.ccsEmails = []
          this.bccsEmails = []
          this.subject = ''
          this.body = ''
          this.$store.state.mjmlTheme = ''

          $(".list__tile").css({ cursor:"wait" })
          let sId = this.$store.state.selectedEmail
          let obj = this.$store.state.selectedSubjects.find(function (obj) { return obj.emailId === sId; })
          let subId = obj.subId
          let subObj = this.$store.state.subjectList.find(function (obj) { return obj.id === subId; })
          let conversation = await microservices.getConversation(subObj.messageId,sId)
          $(".list__tile").css({ cursor:"pointer" })
          if(conversation === 401){
          this.$router.push({ path: '/login' })
          }
          else{
            this.$store.commit('SET_CONVERSATION', conversation.data)
          }
        }
    	}
    },
    closeCalendar(){
      this.showCal = false
      this.calDetail.summary = ''
      this.calDetail.time = ''
      this.calDetail.date = ''
    }
  },
  mounted(){
    if(this.$store.state.mjmlTheme != ''){
      let opt = mjml2html(this.$store.state.mjmlTheme)
      this.mjml = opt.html
      this.body = this.body + this.mjml
    }
  }
}
</script>


<style>
	#successMsg{
		text-align: center;
	  color: #9df23a;
	  background-color: #000000d4;
	  padding: 4px 10px;
	  position: absolute;
	  left: 0;
	  top: 0;
	  width: 100%;
	  height: 100%;
	  z-index: 2;
	}
	#Composeview{
    background-color: #ffffff;
    box-shadow: 0 2px 4px -1px rgba(0,0,0,.2), 0 4px 5px 0 rgba(0,0,0,.14), 0 1px 10px 0 rgba(0,0,0,.12);
  }
  #Composeview .application .theme--dark.card, .theme--dark .card{
  	background-color: #353741;
  }
	.mce-flow-layout-item.mce-last{
		display: none !important;
	}
	#tos .input-group.input-group--solo{
		background-color: #353741;
	}
	#tos .application .theme--dark.chip:not(.chip--outline) .chip__close, .theme--dark .chip:not(.chip--outline) .chip__close{
		color: #424242 !important;
	}
	#ccs .input-group.input-group--solo{
		background-color: #353741;
	}
	#ccs .application .theme--dark.chip:not(.chip--outline) .chip__close, .theme--dark .chip:not(.chip--outline) .chip__close{
		color: #424242 !important;
	}
	#bccs .input-group.input-group--solo{
		background-color: #353741;
	}
	#bccs .application .theme--dark.chip:not(.chip--outline) .chip__close, .theme--dark .chip:not(.chip--outline) .chip__close{
		color: #424242 !important;
	}
	#emailEditor{
		padding: 15px;
	}
	.ccbcc{
		font-size: 15px;margin: 10px;
	}
	.ccbcc:hover{
		cursor: pointer;
	}
  #timePicker .application .theme--dark.picker .picker__title, .theme--dark .picker .picker__title{
    background-color: rgb(24, 169, 244) !important;
  }
  .contentArea{
    display: block;
    width: 100%;
    max-width: 100%;
    max-height: 450px;
    border: 1px solid #dddddd;
  }
</style>