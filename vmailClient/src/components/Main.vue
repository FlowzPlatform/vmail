<template>
	<div>
	  <login v-if="$store.state.loginToken==null"></login>
    <div v-if="$store.state.loginToken!=null">
      <topview></topview>
      <sidebar></sidebar>
      <middle v-if="!$store.state.composeOpen && !$store.state.settingOpen && !$store.state.calenderOpen && !$store.state.mjmlOpen"></middle>
      <compose v-if="$store.state.composeOpen"></compose>
      <setting v-if="$store.state.settingOpen"></setting>
      <calender v-if="$store.state.calenderOpen"></calender>
      <mjmlEditor v-if="$store.state.mjmlOpen"></mjmlEditor>
    </div>
	</div>
</template>


<script>
import login from './Login.vue'
import sidebar from './Sidebar.vue'
import topview from './Header.vue'
import middle from './Middle.vue'
import compose from './Compose.vue'
import setting from './Setting.vue'
import calender from './Calender.vue'
import mjmlEditor from './MjmlEditor.vue'

  export default {
    name: 'main',
    components:{
      login,
      sidebar,
      topview,
      middle,
      compose,
      setting,
      calender,
      mjmlEditor
    }
  }
</script>