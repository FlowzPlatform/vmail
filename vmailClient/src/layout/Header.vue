<style scoped>
  .logoutMenu{
    margin-top: 50px;
  }
</style>


<template>
  <v-menu bottom left>
    <v-btn icon slot="activator" dark>
      <v-icon>more_vert</v-icon>
    </v-btn>
    <v-list class="logoutMenu">
      <v-list-tile @click="logout">
        <v-list-tile-title>Logout</v-list-tile-title>
      </v-list-tile>
      <v-list-tile @click="">
        <v-list-tile-title>Settings</v-list-tile-title>
      </v-list-tile>
    </v-list>
  </v-menu>
</template>


<script>
  import psl from 'psl'
  export default {
    data: () => ({
      
    }),
    methods : {
      logout(){
        let locat = psl.parse(window.location.hostname)
        locat = locat.domain === null ? locat.input : locat.domain
        this.$cookie.delete('auth_token', {domain: locat})
        this.$router.push({ path: '/login' })
      }
    }
  }
</script>