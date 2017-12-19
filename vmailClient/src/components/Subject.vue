<template>
  <v-list two-line subheader id="subjects">
    <div class="text-xs-center">
      <v-btn @click="composeMail" style="background-color: #e7505a;width: 44%;">Compose</v-btn>
      <v-btn color="info" @click="openCalendar" style="width: 44%;">Calendar</v-btn>
    </div>
    <template v-for="(subject,key) in subjects">
      <v-list-tile @click="getConversation(subject.messageId,key)" :id="'emailSubject'+key">
        <v-list-tile-content>
          <v-tooltip bottom>
            <v-list-tile-title class="subjtitle" slot="activator">
              {{ subject.subject }}
            </v-list-tile-title>
            <span>{{ subject.subject }}</span>
          </v-tooltip>
          <v-list-tile-sub-title class="subDate">{{ subject.modified | moment("from", "now") }}</v-list-tile-sub-title>
        </v-list-tile-content>
      </v-list-tile>
      <v-divider style="background-color: #dddddd"></v-divider>
    </template>
  </v-list>
</template>


<script>
  import microservices from '@/api/microservices'
  import { mapGetters } from 'vuex'
  import $ from 'jquery'

  export default {
    name: 'Subject',
    data: () => ({
      subjectList : []
    }),
    methods : {
      composeMail () {
        this.$router.push({ path: 'Compose' })

        //------- by default close replyModal
        this.$store.state.showReply = false

        this.$store.state.replyDetails.to = []
        this.$store.state.replyDetails.cc = []
        this.$store.state.replyDetails.from = ''
        this.$store.state.replyDetails.subject = ''
        this.$store.state.replyDetails.content = ''
        this.$store.state.replyDetails.parentId = ''
      },
      openCalendar () {
        this.$router.push({ path: 'Calendar' })

        //------- by default close replyModal
        this.$store.state.showReply = false

        this.$store.state.replyDetails.to = []
        this.$store.state.replyDetails.cc = []
        this.$store.state.replyDetails.from = ''
        this.$store.state.replyDetails.subject = ''
        this.$store.state.replyDetails.content = ''
        this.$store.state.replyDetails.parentId = ''
      },
      async getConversation (mId,subjectKey) {
        let sId = this.$store.state.selectedEmail
        localStorage.setItem(sId,subjectKey)
        $(".list__tile").removeClass("subFocus")
        $("#emailSubject"+subjectKey).addClass("subFocus")
        $(".list__tile").css({ cursor:"wait" })

        //------- by default close replyModal
        this.$store.state.showReply = false

        this.$store.state.replyDetails.to = []
        this.$store.state.replyDetails.cc = []
        this.$store.state.replyDetails.from = ''
        this.$store.state.replyDetails.subject = ''
        this.$store.state.replyDetails.content = ''
        this.$store.state.replyDetails.parentId = ''
        
        let conversation = await microservices.getConversation(mId,sId)
        $(".list__tile").css({ cursor:"pointer" })
        
        if(conversation === 401){
          this.$router.push({ path: '/login' })
        }
        else{
          this.$store.commit('SET_CONVERSATION', conversation.data)
        }  
      }
    },
    computed: {
      ...mapGetters({
        subjects : 'subjectList'
      })
    },
    mounted(){
      let selEm = this.$store.state.selectedEmail
      $(".list__tile").removeClass("subFocus")
      $("#emailSubject"+localStorage.getItem(selEm)).addClass("subFocus")
    }
  }
</script>


<style>
  #subjects{
    background-color: #ffffff;
    box-shadow: 0 2px 4px -1px rgba(0,0,0,.2), 0 4px 5px 0 rgba(0,0,0,.14), 0 1px 10px 0 rgba(0,0,0,.12);
    max-height: 856px;
    overflow-y: auto;
  }
  .subDate{
    color: #34495e !important;
  }
  .subjtitle{
    color: #34495e !important; 
  }
  .subFocus{
    background-color: rgba(0,0,0,.12);
  }
</style>