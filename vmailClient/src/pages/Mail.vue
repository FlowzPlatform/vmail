<template>
  <v-layout row wrap>
    <v-flex xs12 sm12 md4 lg4>
      <ksubject></ksubject>
    </v-flex>
    <v-flex xs12 sm12 md8 lg8>
      <kconversation></kconversation>
    </v-flex>
  </v-layout>
</template>

<script>
  import Subject from '../components/Subject'
  import Conversation from '../components/Conversation'
  export default {
    data: () => ({
      
    }),
    components: {
      'ksubject': Subject,
      'kconversation' : Conversation      
    }
  }
</script>