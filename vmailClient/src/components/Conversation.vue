<style scoped>
.col-md-8 .chat .composeView {
  width: 96%; 
  margin-left: 2%;
  margin-bottom: 1%;
}
.chat {
  display: block;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  background: #eee;
}
.chat .message {
  display: flex;
  margin: 10px 0 0 10px;
  min-height: 30px;
  height: auto;
  text-align: left;
}
.chat .message.me img {
  order: 2;
  margin: 0 0 0 2px;
}
.chat .message.me div {
  order: 1;
  padding: 0 8px 0 0;
}
.chat .message.me div p {
  float: right;
}
.chat .message.me div:before {
  position: relative;
  float: right;
  content: '';
  margin: 7px -8px 0 0;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 8px 0 8px 8px;
  border-color: transparent transparent transparent #fff;
}
.chat .message img {
  /*display: block;*/
  order: 1;
  margin: 0 10px 0 0;
  height: 30px;
  width: 30px;
  border-radius: 50%;
  box-sizing: border-box;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
}

.chat .message span img {
  /*display: block;*/
  order: 1;
  margin: 0 2px 0 0;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  box-sizing: border-box;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
}

.chat .message div {
  display: block;
  flex: 1;
  order: 2;
  width: 95%;
}
.chat .message div p {
  display: inline-block;
  margin: 0;
  /*width: auto;*/
  max-width: 80%;
  padding: 8px 10px 8px 10px;
  background: #fff;
  word-wrap: break-word;
  /*font-family: Monospace;*/
  border-radius: 3px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}
.chat .message div:before {
  position: relative;
  float: left;
  content: '';
  margin: 7px 0 0 -8px;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 8px 8px 8px 0;
  border-color: transparent #fff transparent transparent;
}
.chat {
  border-radius: 5px;
}
#device {
  margin: -50px auto 0 auto;
  padding: 20px 20px 40px 20px;
  width: 350px;
  height: 100%;
  border-radius: 10px;
  border-bottom: 5px solid #222f3d;
  background: #34495e;
}
#device #size {
  -webkit-appearance: none;
  margin: 15px 0 0 0;
  width: 100%;
  height: 10px;
  vertical-align: middle;
  border-radius: 5px;
  background-color: #46627f;
  outline: none;
}
#device #size::-moz-range-track {
  margin: 15px 0 0 0;
  width: 100%;
  height: 10px;
  vertical-align: middle;
  border-radius: 5px;
  background-color: #46627f;
  outline: none;
}
#device #size::-webkit-slider-thumb {
  -webkit-appearance: none !important;
  height: 20px;
  width: 20px;
  background-color: #4f6f8f;
  border-radius: 50%;
}
#device #size::-moz-range-thumb {
  -moz-appearance: none;
  height: 20px;
  width: 20px;
  background-color: #4f6f8f;
  border-radius: 50%;
}
.track {
  margin: 15px 0 0 0;
  width: 100%;
  height: 10px;
  vertical-align: middle;
  border-radius: 5px;
  background-color: #46627f;
  outline: none;
}
.thumb {
  height: 20px;
  width: 20px;
  background-color: #4f6f8f;
  border-radius: 50%;
}
#drag {
  position: absolute;
  margin: 50px 0 0 -10px;
  padding: 5px 10px;
  line-height: 20px;
  text-align: center;
  font-size: 14px;
  /*font-family: arial, sans-serif;*/
  color: #fff;
  border-radius: 5px;
  border-bottom: 2px solid #217dbb;
  background: #3498db;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
}
#drag:after {
  content: '';
  position: absolute;
  top: -20px;
  left: 10px;
  width: 0;
  height: 0;
  border-width: 10px;
  border-style: solid;
  border-color: transparent transparent #3498db transparent;
}
#preview {
  display: none;
  margin: -100px auto 0 auto;
  padding: 0;
  width: 350px;
  height: 500px;
}
#preview .chat {
  background: transparent;
  overflow: hidden;
  overflow-y: hidden;
}
#preview .chat #text {
  color: #fff;
  /*font-family: arial, sans-serif;*/
  font-size: 12px;
}
@media (max-height: 400px) {
  #device {
    display: none;
  }
  #preview {
    display: block;
  }
}
.giveReply{
  position: relative;
  margin-top: 10px;
  border: 1px solid #36c6d3;
  height: 28px;
  margin-left: 5%;
  display: inline-block;
}
.giveReply:hover{
  cursor: pointer;
}
.sentDate{
  display: inline-block;
  float: right;
  width: 65%;
  text-align: right;
  margin-left: 86%;
}
.sentDate i{
  color: green;
}
.receivedDate{
  display: block;
  margin-left: 1%;
}
.modalCloseButton{
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 41px;
  text-align: center;
  background: white;
  border: none;
  border-top: 1px solid #eee;
}
.modalCloseButton:focus{
  outline: none;
}
.emailText:hover{
  cursor: pointer;
}
</style>


<template>
  <div class="chat">
  	<div style="margin-bottom: 10px;margin-right: 10px;" v-for="conversation in $store.state.conversations">
	    <div class="message" v-if="conversation.received">
        <img src="http://mangalayatan.in/wp-content/uploads/2016/01/member1.jpg" :title="conversation.data.from"/>
	      
	      <div>
	      	<p v-if="conversation.data.body.html != ''" v-html="conversation.data.body.html" v-on:click="openEmailDetail(conversation.s3Key)" class="emailText"></p>
          <p v-if="conversation.data.body.html == ''" v-on:click="openEmailDetail(conversation.s3Key)" class="emailText">{{ conversation.data.body.text }}</p>
          <span class="receivedDate">
            <span>{{ conversation.created | dateFormat(dateType,dateFormat) }}</span>
            <span v-if="conversation.data.cc.length>0" v-for="cc in conversation.data.cc">
              <img :title="'cc:-'+cc" src="http://mangalayatan.in/wp-content/uploads/2016/01/member1.jpg" />
            </span>
          </span>
	      </div>
	    </div>
	    <div class="message me" v-if="!conversation.received">
        <!-- <img :title="conversation.from" :src="conversation.image_url"></img> -->
        <img src="http://mangalayatan.in/wp-content/uploads/2016/01/member1.jpg" :title="conversation.data.from"/>

	      <div>
	      	<p v-html="conversation.data.body" class="emailText"></p>
          <span class="sentDate">
            <span v-if="conversation.data.cc.length>0" v-for="cc in conversation.cc">
              <img :title="'cc:-'+cc" src="http://mangalayatan.in/wp-content/uploads/2016/01/member1.jpg" />
            </span>
            <span>{{ conversation.created | dateFormat(dateType,dateFormat) }}</span>
            <!-- <span v-if="conversation.read!=undefined"><i class="fa fa-check"></i></span> -->
          </span>
	      </div>
	    </div>
    </div>

    <div class="giveReply" title="Reply" v-if="!$store.state.displayReply" v-on:click="openReply">
      <i class="fa fa-ellipsis-h fa-2x" style="padding: 0px 10px;"></i>
    </div>

    <compose v-if="$store.state.displayReply"></compose>

<!-- - - - - - - - - - - - - - EMAIL-DETAIL MODAL START - - - - - - - - - - - - - -->
    <modal name="dialog" :scrollable="true" :pivotX="0.5" :pivotY="0.5" :width="1200" :height="650">
      <emailDetail></emailDetail>
      <button v-on:click="$modal.hide('dialog')" class="modalCloseButton">CLOSE</button>
    </modal>
<!-- - - - - - - - - - - - - - EMAIL-DETAIL MODAL END - - - - - - - - - - - - - - -->
  </div>
</template>


<script>
import compose from './Compose.vue'
import emailDetail from './EmailDetail.vue'
var moment = require('moment')
import _ from 'lodash'

  export default {
    name: 'conversation',
    components:{
      compose,
      emailDetail
    },
    data(){
      return {
        dateType: this.$store.state.dateType,
        dateFormat: this.$store.state.dateFormat
      }
    },
    methods:{
      openReply(){
        this.$store.state.displayReply = true
        let conversations = this.$store.state.conversations
        let arrKey = conversations.length-1

        this.$store.state.replyDetails.from = this.$store.state.selectedEmailId
        this.$store.state.replyDetails.cc = conversations[arrKey].data.cc
        this.$store.state.replyDetails.subject = conversations[arrKey].data.subject
        this.$store.state.replyDetails.parentId = conversations[arrKey].id  
        if((conversations[arrKey]).received)
          this.$store.state.replyDetails.to.push(conversations[arrKey].data.from)
        else
          this.$store.state.replyDetails.to = conversations[arrKey].data.to
        
        $('#conversation').animate({scrollTop: $('#conversation').outerHeight()})
      },
      openEmailDetail(s3Key) {
        this.$modal.show('dialog')
        this.$store.dispatch('getEmailDetail',s3Key)
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

