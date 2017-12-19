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
    <template v-for="(emailData,key) in emailList">
      <v-list-tile @click="subjectList(emailData.emailid,key)" :id="'emailGroup'+key">
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
      async subjectList (emailId,groupkey) {
        $(".list__tile").removeClass("active")
        $("#emailGroup"+groupkey).addClass("active")
        $(".list__tile").css({ cursor:"wait" })

        this.$store.commit('SET_SELEMAIL', emailId)

        let subjectList = await microservices.subjectList(emailId)

        if(subjectList === 401){
          this.$router.push({ path: '/login' }) 
        }
        else{
          //-------set subjectList
          this.$store.commit('SET_SUBJECTLIST', subjectList.data)

          // -------call automatic first conversation
          let subjectKey = localStorage.getItem(emailId)

          if(subjectKey == null){
            subjectKey = 0
          }

          let mId = subjectList.data[subjectKey].messageId
          $("#emailSubject"+subjectKey).addClass("subFocus")
          this.getConversation(mId,subjectKey)
          
        }
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
        emailList : 'emailgroup'
      })
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
      $(".list__tile").removeClass("active")
      $("#emailGroup"+ind).addClass("active")

      $(".list__tile").removeClass("subFocus")
      $("#emailSubject"+localStorage.getItem(selEm)).addClass("subFocus")


      app.service("mailservice").on("created", (message) => {
        this.$store.state.emailgroup.push(message)
      })
      app.service("mailservice").on("updated", (message) => {
        this.$store.state.emailgroup[ind].totalCount = message.totalCount
        this.$store.state.emailgroup[ind].unreadCount = message.unreadCount

        if(message.emailid == selEm){
          this.subjectList(selEm,ind)
        }
      })
    }
  }
</script>