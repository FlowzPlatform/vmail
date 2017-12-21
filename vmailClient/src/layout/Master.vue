<template>
  <v-app id="layout" dark style="background-color: #eeeeef">



<!-- - - - - - - - - - - - - - - - - - - - - -  - - - HEADER - - - - - -  - - - - - - - - - - - - - - - - - - - -->
    <v-toolbar app fixed clipped-left style="background-color: #0f1118">
      <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
      <v-toolbar-title>
        <img src="../assets/Flowz-logo.png"  style="vertical-align: middle;height:30px !important">
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-title style="font-size: 16px;">{{ $store.state.user.email }}</v-toolbar-title>
      <kheader></kheader>
    </v-toolbar>



<!-- - - - - - - - - - - - - - - - - - - - - -  - - - SIDEBAR - - - - - -  - - - - - - - - - - - - - - - - - - - -->
    <v-navigation-drawer clipped fixed v-model="drawer" app style="background-color: #222636">
      <ksidebar></ksidebar>
    </v-navigation-drawer>



<!-- - - - - - - - - - - - - - - - - - - - - -  - - - MIDDLE - - - - - -  - - - - - - - - - - - - - - - - - - - -->
    <v-content>
      <v-container fluid fill-height>
        <v-layout justify-align align-center>
         <!-- - - - - - - - - - - - middle part comes here - - - - - - - - -->
         <router-view></router-view>
        </v-layout>
      </v-container>
    </v-content>


<!-- - - - - - - - - - - - - - - - - - - - - -  - - - FOOTER - - - - - -  - - - - - - - - - - - - - - - - - - - -->
    <kfooter></kfooter>
  </v-app>
</template>


<script>
  import Sidebar from './Sidebar'
  import Footer from './Footer'
  import Header from './Header'
  export default {
    components: {
      'ksidebar': Sidebar,
      'kfooter' : Footer,
      'kheader' : Header
    },
    data: () => ({
      drawer: null
    })
  }
</script>

