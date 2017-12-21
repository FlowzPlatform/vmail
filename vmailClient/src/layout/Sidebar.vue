<style>
  .navigation-drawer--is-mobile, .navigation-drawer--temporary {
    max-height: calc(100% - 90px) !important;
  }
  .active{
    background-color: rgba(0,0,0,.12);
    border-bottom: 1px solid #03A9F4 ;
    border-right: 5px solid #03A9F4 ;
  }
</style>


<template>
	<v-list two-line subheader>
    <template v-for="emailData in formatedEmails">
      <v-list-tile @click="subjectList(emailData.emailid)" :class="getActiveMail(emailData)">
        <v-list-tile-content>
          <v-list-tile-title>{{ emailData.emailid }}</v-list-tile-title>
          <v-list-tile-sub-title>{{ emailData.created | moment("from", "now") }}</v-list-tile-sub-title>
        </v-list-tile-content>
        <v-tooltip bottom>
          <v-chip slot="activator" label>{{ emailData.unreadCount }}/{{ emailData.totalCount }}</v-chip>
          <span>unread:{{ emailData.unreadCount }}</span>&nbsp;&nbsp;&nbsp;&nbsp;
          <span>total:{{ emailData.totalCount }}</span>
        </v-tooltip>
      </v-list-tile>
      <v-divider></v-divider>
    </template>
  </v-list>
</template>


<script>
  import microservices from '@/api/microservices'
  import { mapGetters } from 'vuex'
  import $ from 'jquery'
  import feathers from 'feathers/client';
  import socketio from 'feathers-socketio/client';
  import io from 'socket.io-client';

  let baseUrl = process.env.socketUrl;

  // const socket = io(baseUrl, {
  //   path: '/vservice'
  // });

  const socket = io(baseUrl);
  const app = feathers().configure(socketio(socket))
  
  export default {
    data: () => ({
      
    }),
    methods : {
      getActiveMail(emailData) {
        return emailData.emailid === this.$store.state.selectedEmail ? 'active' : ''
      },
      async subjectList (emailId) {
        $(".list__tile").css({ cursor:"wait" })
        this.$store.commit('SET_SELEMAIL', emailId)
        let subjectList = await microservices.subjectList(emailId)
        if(subjectList === 401){
          this.$router.push({ path: '/login' }) 
        }
        else{
          //-------set subjectList
          this.$store.commit('SET_SUBJECTLIST', subjectList.data.reverse())
          // -------call automatic first conversation
          let obj = this.$store.state.selectedSubjects.find(function (obj) { return obj.emailId === emailId; })
          if(obj != undefined){
            let subObj = subjectList.data.find(function (sub) { return sub.id === obj.subId; })
            let index = subjectList.data.indexOf(subObj)

            let mId = subjectList.data[index].messageId
            this.getConversation(mId)
          }
          else{
            console.log('in else')
            this.$store.state.selectedSubjects.push({'emailId':emailId ,'subId':subjectList.data[0].id})
            let mId = subjectList.data[0].messageId
            this.getConversation(mId)
          }
        }
      },
      async getConversation (mId) {
        let sId = this.$store.state.selectedEmail

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
        emailList : 'emailgroup'
      }),
      formatedEmails(){
        let emails = this.emailList.slice()
        return emails.reverse()
      }
    },
    async mounted () {
      let emailList = await microservices.emailList()
      if(emailList === 401){
        this.$router.push({ path: '/login' }) 
      }
      else{
        this.$store.commit('SET_EMAILGROUP', emailList.data)
      }

      
      let arr = this.emailList
      let selEm = this.$store.state.selectedEmail
      let ind = arr.map(a => a.emailid).indexOf(selEm)

      app.service("mailservice").on("created", (message) => {
        this.$store.state.emailgroup.push(message)
      })
      app.service("mailservice").on("updated", (message) => {
        this.$store.state.emailgroup[ind].totalCount = message.totalCount
        this.$store.state.emailgroup[ind].unreadCount = message.unreadCount

        if(message.emailid == selEm){
          this.subjectList(selEm)
        }
      })
    }
  }
</script>