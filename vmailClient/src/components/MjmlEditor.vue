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
  height: 85vh;
  width: auto;
  overflow-x: hidden;
  overflow-y: auto;
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
  height: 80vh;
}
.btnRight{
  float: right;
  margin-right: 5px;
}
.themeImage{
  height: 100px;
  margin-bottom: 20px;
}
.themeImage>img{
  position: relative;
  height: 100%;
  width: 100%;
}
.createdTheme{
  color: #337ab7;
  background-color: #f1f4f7;
  padding-top: 10px;
  padding-bottom: 10px;
  margin-bottom: 10px;
  margin-left: 10px;
}
.createdTheme>a{
  font-size: 14px;
}
.templateHeading{
  margin-bottom: 20px;
  color: #337ab7;
  font-weight: bold;
}
#text_mess{
  color:#fff;
  font-weight:bold;
  background-color: #4CAF50;
  width: 300px;
  padding:4px 10px;
}
.focus{
  border-left: 4px solid #ed6b75;
}
@media (min-width: 992px){
  .createdTheme{
    width: 32%;
  }
}
</style>


<template>
  <div class="container" v-bind:class="{mjmlContainer:$store.state.sidebarOpen,mjmlActiveToggle:!$store.state.sidebarOpen}">
    <div style="margin-left: 33%;"><p id="text_mess" v-if="successMsg">Template saved successfully...!</p></div>
    <div class="form-inline backMjmlBtn" action="/action_page.php">
      <button class="btn btn-default" v-on:click="backMjmlBtnClick">Back</button>
      <div class="btnRight">
        <div class="form-group" v-show="!templateList">
          <label for="themeName">Name:</label>
          <input type="text" class="form-control" id="themeName" placeholder="Enter theme name" v-model="name">
        </div>
        <button class="btn btn-default" v-on:click="getTemplate" v-show="!templateList">Save</button>
        <button class="btn btn-default" v-on:click="closeEditor" v-show="!templateList">closeEditor</button>
        <button class="btn btn-default" v-on:click="openEditor" v-show="templateList">Create New</button>
        <button class="btn btn-default" v-on:click="composeTheme" v-show="templateList">Use theme</button>
      </div>
    </div>

    <div class="mjmlMiddle">
      <div class="templateEditor" v-show="!templateList">
        <div id="gjs">
          <mj-container min-height="100px"></mj-container>
        </div>
      </div>
      <div v-show="templateList">
        <h4 class="templateHeading">Ready made templates</h4>
        <div class="row">
          <div class="col-md-2">
            <div class="themeImage">
              <img src="https://static.pexels.com/photos/248797/pexels-photo-248797.jpeg">
            </div>
          </div>
        </div>
        <h4 class="templateHeading">List Of created templates</h4>
        <div class="row">
          <div class="col-md-4 createdTheme" :id="'mjmllist'+key" v-for="(mjml,key) in listing" v-on:click="selectTheme(mjml.id,key)">
            <a>{{ mjml.name }}</a>
          </div>
        </div>
      </div>
    </div> 

  </div>
</template>


<script>
import axios from 'axios'
let editor = null
export default {
  name: 'templateEditor',
  data(){
    return{
      templateList : true,
      name : 'untitled',
      successMsg : false,
      listing : [],
      selectedTheme : ''
    }
  },
  methods: {
    backMjmlBtnClick(){
      this.$store.state.replyDetails.to = []
      this.$store.state.replyDetails.cc = []
      this.$store.state.replyDetails.from = ''
      this.$store.state.replyDetails.parentId = ''
      this.$store.state.replyDetails.subject = ''
      this.$store.state.mjmlTheme = ''
      this.$store.state.composeOpen = true
      this.$store.state.settingOpen = false
      this.$store.state.displayReply = false
      this.$store.state.calenderOpen = false
      this.$store.state.mjmlOpen = false
    },
    async getTemplate(){
      let theme = '<mjml><mj-body>'+editor.getHtml()+'</mj-body></mjml>'
      let myData = {
        'name' : this.name,
        'theme' : theme
      }
      
      await axios({
        method: 'post',
        url: process.env.serviceUrl+'/saveMjml',
        data: myData,
        headers: {
          'authorization': this.$cookie.get('auth_token') 
        }
      })
      .then(response => {
        let self = this
        self.successMsg = true
        setTimeout(function(option) {
          self.successMsg = false
        }, 3000)
      })
      .catch(function(e){
        let self = this
        if(e.response.status === 401){
          self.$cookie.delete('auth_token', {domain: location})
          self.$store.state.loginToken = null
        }
      })

      await this.mjmlList()
    },
    openEditor(){
      this.templateList = false
    },
    closeEditor(){
      this.templateList = true
    },
    mjmlList(){
      return axios({
        method: 'get',
        url: process.env.serviceUrl+'/mjmlList',
        headers: {
          'authorization': this.$cookie.get('auth_token')
        }
      })
      .then(response => {
        this.listing = response.data
      })
      .catch(function(e){
        let self = this
        if(e.response.status === 401){
          self.$cookie.delete('auth_token', {domain: location})
          self.$store.state.loginToken = null
        }
      })
    },
    selectTheme(id,key){
      $(".createdTheme").removeClass("focus")
      $("#mjmllist"+key).addClass("focus")

      axios({
        method: 'get',
        url: process.env.serviceUrl+'/getTheme/'+id,
        headers: {
          'authorization': this.$cookie.get('auth_token')
        }
      })
      .then(response => {
        this.selectedTheme = response.data[0]
      })
      .catch(function(e){
        let self = this
        if(e.response.status === 401){
          self.$cookie.delete('auth_token', {domain: location});
          self.$store.state.loginToken = null
        }
      })
    },
    composeTheme(){
      this.$store.state.composeOpen = true
      this.$store.state.settingOpen = false
      this.$store.state.displayReply = false
      this.$store.state.calenderOpen = false
      this.$store.state.mjmlOpen = false
      if(this.selectedTheme.theme != undefined)
        this.$store.state.mjmlTheme = this.selectedTheme.theme
    }
  },
  mounted () {
    this.mjmlList()

    editor = grapesjs.init({
      height: '100%',
      noticeOnUnload: 0,
      storageManager:{autoload: 0},
      container : '#gjs',
      fromElement: true,
      plugins: ['gjs-mjml'],
      pluginsOpts: {
        'gjs-mjml': {}
      }
    });
    window.editor = editor;
  }
}
</script>