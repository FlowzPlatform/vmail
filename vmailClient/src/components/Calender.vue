<style>
@import '~fullcalendar/dist/fullcalendar.css';

.calendarContainer{
  width: 78%;
  margin-left: 21%;
}
.calendarMiddle{
  border: 1px solid #dddddd;
  padding: 20px;
}
.backCalendarBtn{
  margin-bottom: 15px;
}
.calenderActiveToggle{
  margin-left: 2%;
  width: 96%;
}
</style>


<template>
  <div class="container" v-bind:class="{calendarContainer:$store.state.sidebarOpen,calenderActiveToggle:!$store.state.sidebarOpen}">
    <button class="btn btn-default backCalendarBtn" v-on:click="backToMailDetail">Back</button>
    <div class="calendarMiddle">
      <full-calendar :events="events" defaultView="month"></full-calendar>  
    </div> 
  </div>
</template>


<script>
import axios from 'axios'
import Vue from 'vue'
import FullCalendar from 'vue-full-calendar'
Vue.use(FullCalendar)
window.jQuery = window.$ = require('jquery')
var moment = require('moment')

  export default {
    name: 'calender',
    data() {
      return {
        events: []
      }
    },
    methods:{
      requestIcalEvents: function(start,end) {
        return axios({
          method: 'get',
          url: process.env.serviceUrl+'/requestIcalEvents?start='+start+'&end='+end+'&email='+this.$store.state.selectedEmailId,
          headers: {
            'authorization' : this.$cookie.get('auth_token')
          }
        })
        .then(async response => {
          this.events = response.data
        })
        .catch(function(e){
          let self = this
          if(e.response.status === 401){
            self.$cookie.delete('auth_token', {domain: location});
            self.$store.state.loginToken = null
          }
        })
      },
      backToMailDetail(){
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
      },
      getViewType(){
        let start = $('#calendar').fullCalendar('getDate').format('YYYY,MM,DD')
        let end = ''

        if($('#calendar').fullCalendar('getView').type == 'month'){
          start = moment(start).startOf('month').format('YYYY,MM,DD')
          end = moment(start).add(1,'month').format('YYYY,MM,DD')
        }
        if($('#calendar').fullCalendar('getView').type == 'agendaWeek'){
          start = moment(start).startOf('week').format('YYYY,MM,DD')
          end = moment(start).add(1,'week').format('YYYY,MM,DD')
        }
        if($('#calendar').fullCalendar('getView').type == 'agendaDay'){
          start = moment(start).startOf('day').format('YYYY,MM,DD')
          end = moment(start).add(1,'day').format('YYYY,MM,DD')
        }
        this.requestIcalEvents(start,end)
      }
    },
    mounted() {
      /*-------------------------------------- call calender event on page load ---------------------------------------------*/
      this.getViewType()
      /*-------------------------------------- call calender event click ----------------------------------------------------*/
      let self = this
      $('.fc-today-button').click(function() {self.getViewType()})
      $('.fc-next-button').click(function() {self.getViewType()})
      $('.fc-prev-button').click(function() {self.getViewType()})
      $('.fc-month-button').click(function() {self.getViewType()})
      $('.fc-agendaWeek-button').click(function() {self.getViewType()})
      $('.fc-agendaDay-button').click(function() {self.getViewType()})
    }
  }
</script>