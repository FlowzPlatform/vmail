<style>
  @import '../../node_modules/fullcalendar/dist/fullcalendar.css';

  .calendarMiddle{
    border: 1px solid #dddddd;
    padding: 20px;
    background-color: #ffffff !important;
    color: #495060 !important;
  }
</style>


<template>
  <v-layout row wrap style="display: block;">
    <v-btn color="primary" style="margin-left: 0px;" @click="backtoPrevious">Back</v-btn>
    <v-card class="calendarMiddle">
      <full-calendar :events="events" defaultView="month"></full-calendar>  
    </v-card>
  </v-layout>
</template>


<script>
window.jQuery = window.$ = require('jquery')
var moment = require('moment')
import microservices from '@/api/microservices'

  export default {
    name: 'calender',
    data() {
      return {
        events: []
      }
    },
    methods:{
      backtoPrevious(){
        this.$router.go(-1)
      },
      async requestIcalEvents(start,end) {
        let requestIcalEvents = await microservices.requestIcalEvents(start,end,this.$store.state.selectedEmail)
        if(requestIcalEvents === 401){
          this.$router.push({ path: '/login' })
        }
        else{
          this.events = requestIcalEvents.data
        }
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
      /*-------------------------------------- call calender event on page load-------------------------------*/
      this.getViewType()
      /*-------------------------------------- call calender event click -------------------------------------*/
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