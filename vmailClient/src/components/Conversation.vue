<template>
  <v-list two-line id="conversation">
    <div id="autoScrollConversation">
      <template v-for="conv in conversations">
        <v-layout row wrap v-if="conv.received">
          <v-flex xs2 sm1 md1 lg1 style="text-align: center;">
            <v-tooltip bottom>
              <v-avatar slot="activator">
                <img src="../assets/man.png">
              </v-avatar>
              <span>{{ conv.data.from }}</span>
            </v-tooltip>
          </v-flex>
          <v-flex xs7 sm8 md8 lg8>
            <v-list-tile @click="" class="you">
              <v-list-tile-content>
                <v-list-tile-title class="message" v-if="conv.data.body.html!=''" v-html="conv.data.body.html">
                </v-list-tile-title>
                <v-list-tile-title class="message" v-if="conv.data.body.html==''">
                  {{ conv.data.body.text }}
                </v-list-tile-title>
                <v-tooltip bottom class="showEmDetail">
                  <v-btn icon slot="activator" @click="emailDetail(conv.s3Key)">
                    <v-icon style="color:#53b9a1;font-size: 30px">info</v-icon>
                  </v-btn>
                  <span>Email Detail</span>
                </v-tooltip>
                <v-list-tile-sub-title class="conDate">
                  {{ conv.created | moment("from", "now") }}
                  <v-tooltip bottom v-for="cc in conv.data.cc" :key="cc">
                    <v-avatar slot="activator">
                      <img src="../assets/man.png" style="height: 25px;width: 25px;">
                    </v-avatar>
                    <span>Cc:- {{ cc }}</span>
                  </v-tooltip>
                </v-list-tile-sub-title>
              </v-list-tile-content>
            </v-list-tile>
          </v-flex>
        </v-layout>


        <v-layout row wrap v-if="!conv.received">
          <v-flex xs7 sm8 md8 lg8 offset-xs3 offset-sm3 offset-md3 offset-lg3>
            <v-list-tile @click="" class="me">
              <v-list-tile-content>
                <v-list-tile-title class="message" v-html="conv.data.body">
                </v-list-tile-title>
                <v-list-tile-sub-title class="conDate">
                  {{ conv.created | moment("from", "now") }}
                  <v-tooltip bottom v-for="cc in conv.data.cc" :key="cc">
                    <v-avatar slot="activator">
                      <img src="../assets/man.png" style="height: 25px;width: 25px;">
                    </v-avatar>
                    <span>Cc:- {{ cc }}</span>
                  </v-tooltip>
                </v-list-tile-sub-title>
              </v-list-tile-content>
            </v-list-tile>
          </v-flex>
          <v-flex xs2 sm1 md1 lg1 style="text-align: center;">
            <v-tooltip bottom>
              <v-avatar slot="activator">
                <img src="../assets/man.png">
              </v-avatar>
              <span>{{ conv.data.from }}</span>
            </v-tooltip>
          </v-flex>
        </v-layout>
      </template>
    </div>
    <v-dialog v-model="dialog" max-width="80%" lazy v-if="detailEmail!=null">
      <v-card style="background-color: #eff4f5;color: #34495e;">
        <v-card-title>
          <v-layout align-center row spacer slot="header">
            <v-flex xs1>
              <v-avatar size="36px" slot="activator">
                <img src="https://avatars0.githubusercontent.com/u/9064066?v=4&s=460">
              </v-avatar>
            </v-flex>
            <v-flex xs3>
              <v-list-tile-content>{{ detailEmail.from.text }}</v-list-tile-content>
              <v-list-tile-sub-title>{{ detailEmail.date | moment("from", "now") }}</v-list-tile-sub-title>
            </v-flex>
          </v-layout>
        </v-card-title>

        <v-spacer></v-spacer>

        <v-card-text v-html="detailEmail.html"></v-card-text>
        
        <v-card-actions>
          <v-btn color="primary" style=" position: absolute;top: 4px;right: 0;" @click="closeModal">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-chip outline color="primary" id="replyButton" @click="openReply" v-if="!$store.state.showReply">reply</v-chip>
    <v-chip outline color="primary" id="replyButton" @click="cancelReply" v-if="$store.state.showReply">cancel</v-chip>
    <kcomposeview v-if="$store.state.showReply"></kcomposeview>
  </v-list>
</template>


<style>
@media screen and (min-width: 1024px){
  #conversation{
    margin-left: 15px;
    padding: 15px;
  }
}
#conversation a:hover{
  background-color: transparent !important;
}
#conversation{
  margin-top: 5px;
  background-color: #ffffff;
  box-shadow: 0 2px 4px -1px rgba(0,0,0,.2), 0 4px 5px 0 rgba(0,0,0,.14), 0 1px 10px 0 rgba(0,0,0,.12);
  max-height: 856px;
  overflow-y: auto;
}
#conversation a{
  height: auto !important;
  padding: 0 !important;
}
.message{
  padding: 0.657rem 1.375rem;
  color: #34495e;
  border-radius: 30px;
  font-size: 1rem;
  font-family: "Source Sans Pro", sans-serif;
  font-weight: 300;
  line-height: 1.5 !important;
  text-align: justify !important;
  height: auto !important;
  word-wrap: break-word !important;
  white-space: inherit !important;
}
.you .message{
  background-color: #eff4f5;
  border-top-left-radius: 0;
}
.me .message{
  background-color: #74e487;
  border-top-right-radius: 0;
}
.conDate{
  color: #34495e !important;
}
#replyButton{
  margin-top: 10px;
}
#replyButton .chip__content:hover{
  cursor: pointer;
}
.showEmDetail{
  position: absolute !important;
  top: 0;
  right: 0;
  display: none;
}
</style>


<script>
  import Composeview from './Composeview'
  import { mapGetters } from 'vuex'
  import microservices from '@/api/microservices'

  export default {
    name: 'Conversation',
    data: () => ({
      dialog : false,
      detailEmail : null
    }),
    components: {
      'kcomposeview': Composeview
    },
    methods:{
      closeModal(){
        this.detailEmail = null
        this.dialog = false
      },
      async emailDetail(key){
        this.dialog = true
        let emailDetail = await microservices.emailDetail(key)
        
        if(emailDetail === 401){
          this.$router.push({ path: '/login' })
        }
        else{
          this.detailEmail = emailDetail.data
        }
      },
      openReply(){
        this.$store.state.showReply = true
        let conversations = this.conversations
        let arrKey = conversations.length-1

        this.$store.state.replyDetails.from = this.$store.state.selectedEmail
        this.$store.state.replyDetails.cc = conversations[arrKey].data.cc
        this.$store.state.replyDetails.subject = conversations[arrKey].data.subject
        this.$store.state.replyDetails.parentId = conversations[arrKey].id  
        if((conversations[arrKey]).received){
          this.$store.state.replyDetails.to.push(conversations[arrKey].data.from)
          if(conversations[arrKey].data.body.html == ''){
            this.$store.state.replyDetails.content = conversations[arrKey].data.body.text
          }
          else{
            this.$store.state.replyDetails.content = conversations[arrKey].data.body.html 
          }
        }
        else{
          this.$store.state.replyDetails.to = conversations[arrKey].data.to
          this.$store.state.replyDetails.content = conversations[arrKey].data.body
        }
      },
      cancelReply(){
        this.$store.state.showReply = false

        this.$store.state.replyDetails.to = []
        this.$store.state.replyDetails.cc = []
        this.$store.state.replyDetails.from = ''
        this.$store.state.replyDetails.subject = ''
        this.$store.state.replyDetails.content = ''
        this.$store.state.replyDetails.parentId = ''
      }
    },
    computed: {
      ...mapGetters({
        conversations : 'conversation'
      })
    },
    mounted(){
      $( ".message" ).mouseover(
        function() {
          $( ".showEmDetail" ).css('display','block')
        }
      )
      $( ".message" ).mouseout(
        function() {
          $( ".showEmDetail" ).css('display','none')
        }
      )
    }
  }
</script>