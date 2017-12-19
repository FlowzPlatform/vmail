<template>
	<v-layout row wrap style="display: block;">
		<v-btn color="primary" style="margin-left: 0px;" @click="backtoPrevious">Back</v-btn>
  	<kcomposeview></kcomposeview>
  </v-layout>
</template>


<script>
  import Composeview from '../components/Composeview'
  export default {
    data: () => ({
      
    }),
    methods : {
      backtoPrevious(){
        this.$router.go(-1)
        this.$store.state.mjmlTheme = ''
      }
    },
    components: {
      'kcomposeview': Composeview
    }
  }
</script>