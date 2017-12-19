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
.mjmlMiddle{
  height: 85vh;
  width: 100%;
  overflow-x: hidden;
  overflow-y: auto;
}
.templateEditor{
  position: relative;
  height: 75vh;
  width: auto;
}
#mjmlEditor input{
	color: #495060 !important;
}
.createdTheme{
  color: #337ab7;
  background-color: #3180a4;
  margin-bottom: 10px;
  margin-left: 10px;
}
.mjmlfocus{
  border-left: 4px solid #ed6b75;
}
</style>


<template>
  <v-layout row wrap style="display: block;" id="mjmlEditor">
    <v-snackbar
      	color="primary"
	      :timeout="3000"
	      :top="true"
	      v-model="successMsgEnable"
	    >
	    {{ successMsg }}
	    <v-btn flat @click.native="successMsgEnable = false">Close</v-btn>
	  </v-snackbar>

    <v-container fluid grid-list-md>
    	<v-layout row wrap>
	    	<v-flex xs12 sm4 md4 lg4>
	    		<v-btn color="primary" style="margin-left: 0px;" @click="backtoPrevious">Back</v-btn>
	    	</v-flex>
	      <v-flex xs12 sm5 md5 lg5>
	        <v-text-field
              class="input-group--focused"
              dark
              single-line
	        		v-show="!templateList"
              v-model="name"></v-text-field>
	      </v-flex>
	      <v-flex xs12 sm3 md3 lg3 style="display: inline-flex;">
	    		<v-btn color="success" style="margin-left: 0px;" v-show="!templateList" @click="getTemplate">Save</v-btn>
	    		<v-btn color="primary" style="margin-left: 0px;" v-show="!templateList" @click="closeEditor">Close Editor</v-btn>
	    		<v-btn color="success" style="margin-left: 0px;" v-show="templateList" @click="openEditor">Create New</v-btn>
	    		<v-btn color="primary" style="margin-left: 0px;" v-show="templateList" @click="composeTheme">Use theme</v-btn>
	    	</v-flex>
      </v-layout>
     </v-container>


    <v-card class="mjmlMiddle">
      <div class="templateEditor" v-show="!templateList">
	      <div id="gjs">
	        <mj-container min-height="100px"></mj-container>
	      </div>
	    </div>

	    <v-container fluid  v-show="templateList"> 
        <v-layout row wrap>
          <v-flex xs4>
            <v-list>
		          <template v-for="(mjml,key) in listing">
		            <v-list-tile @click="selectTheme(mjml.id,key)" :id="'mjmllist'+key" class="createdTheme">
		              <v-list-tile-content>
		                <v-list-tile-title>{{ mjml.name }}</v-list-tile-title>
		              </v-list-tile-content>
		            </v-list-tile>
		          </template>
		        </v-list>
          </v-flex>
        </v-layout>
      </v-container>

    </v-card>
  </v-layout>
</template>


<script>
	import microservices from '@/api/microservices'
	let editor = null

export default {
	data(){
		return {
			templateList : true,
			name : 'Untitled',
			successMsgEnable : false,
			successMsg : null,
			listing : [],
			selectedTheme : null
		}
	},
	methods : {
		backtoPrevious(){
      this.$router.go(-1)
    },
    openEditor(){
      this.templateList = false
    },
    closeEditor(){
      this.templateList = true
    },
    async getTemplate(){
      let theme = '<mjml><mj-body>'+editor.getHtml()+'</mj-body></mjml>'
      let myData = {
        'name' : this.name,
        'theme' : theme
      }
      
      let saveMjml = await microservices.saveMjml(myData)
      if(saveMjml === 401){
        this.$router.push({ path: '/login' })
      }
      else{					
      	this.successMsg = saveMjml.data.success
				this.successMsgEnable = true
				this.templateList = true
      }

      await this.mjmlList()
    },
    composeTheme(){
      if(this.selectedTheme.theme != undefined){
        this.$store.state.mjmlTheme = this.selectedTheme.theme
        this.$router.go(-1)
      }
    },
    async mjmlList(){
      console.log('calling')
      let mjmlList = await microservices.mjmlList()
      if(mjmlList === 401){
        this.$router.push({ path: '/login' })
      }
      else{					
      	this.listing = mjmlList.data
      }
    },
    async selectTheme(id,key){
      $(".list__tile").removeClass("mjmlfocus")
      $("#mjmllist"+key).addClass("mjmlfocus")

      let getTheme = await microservices.getTheme(id)
      if(getTheme === 401){
        this.$router.push({ path: '/login' })
      }
      else{
      	this.selectedTheme = getTheme.data[0]
      }
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