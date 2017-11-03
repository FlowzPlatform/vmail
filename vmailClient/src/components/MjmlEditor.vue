<style>
.gjs-editor {
  height: 100%;
  width: 100%;
  position: absolute;
}
.gjs-field select{
  height: 23px;
}
.gjs-pn-panel{
  height: 40px;
}
#gjs-htmlmixed{
  position: relative;
}
.mjmlContainer{
  width: 78%;
  margin-left: 21%;
}
.mjmlMiddle{
  border: 1px solid #dddddd;
  padding: 20px;
}
.backMjmlBtn{
  margin-bottom: 15px;
}
.mjmlActiveToggle{
  margin-left: 2%;
  width: 96%;
}
.templateEditor{
  position: relative;
  height: 600px;
}
</style>


<template>
  <div class="container" v-bind:class="{mjmlContainer:$store.state.sidebarOpen,mjmlActiveToggle:!$store.state.sidebarOpen}">
    <button class="btn btn-default backMjmlBtn" v-on:click="backMjmlBtnClick">Back</button>
    <div class="mjmlMiddle">
      <div class="templateEditor">
        <div id="gjs">
          <mj-container min-height="100px"></mj-container>
        </div>
      </div>
    </div> 
  </div>
</template>


<script>
let editor = null
export default {
  name: 'templateEditor',
  methods: {
    backMjmlBtnClick(){
      this.$store.state.replyDetails.to = []
      this.$store.state.replyDetails.cc = []
      this.$store.state.replyDetails.from = ''
      this.$store.state.replyDetails.parentId = ''
      this.$store.state.replyDetails.subject = ''
      this.$store.state.composeOpen = true
      this.$store.state.settingOpen = false
      this.$store.state.displayReply = false
      this.$store.state.calenderOpen = false
      this.$store.state.mjmlOpen = false
    }
  },
  mounted () {
    var editor = grapesjs.init({
      height: '100%',
      noticeOnUnload: 0,
      storageManager: {autoload: 0},
      container: '#gjs',
      fromElement: true,
      undoManager: true,
      plugins: ['gjs-mjml'],
      pluginsOpts: {
        'gjs-mjml': {}
      }
    })
    window.editor = editor
  }
}
</script>