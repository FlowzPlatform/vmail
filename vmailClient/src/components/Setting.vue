<template>
  <div class="container settingContainer" v-bind:class="{activeToggle:!$store.state.sidebarOpen}">
  <button class="btn btn-default backBtn" v-on:click="backToMailDetail">Back</button>
  <div class="panel-group" id="accordion">
    <div class="panel panel-default">
      <div class="panel-heading">
        <h4 class="panel-title">
          <a data-toggle="collapse" data-parent="#accordion" href="#collapse1">Profile Settings</a>
        </h4>
      </div>
      <div id="collapse1" class="panel-collapse collapse in">
        <div class="panel-body row formContent">
          <div class="form-horizontal col-sm-10">
            <div class="form-group">
              <label class="control-label col-sm-2" for="name">Name:</label>
              <div class="col-sm-10">
                <input type="text" class="form-control" id="name" placeholder="Enter username" v-model="fullname">
              </div>
            </div>
            <div class="form-group">
              <label class="control-label col-sm-2" for="email">Email:</label>
              <div class="col-sm-10">
                <input type="email" class="form-control" id="email" placeholder="Enter email" v-model="email" title="You can not change email-id..!" readonly>
              </div>
            </div>
            <!-- <div class="form-group">
              <label class="control-label col-sm-2" for="pwd">Password:</label>
              <div class="col-sm-10"> 
                <input type="password" class="form-control" id="pwd" placeholder="Change password" v-model="password"
                required> 
              </div>
            </div> -->
            <div class="form-group"> 
              <div class="col-sm-offset-2 col-sm-10">
                <button class="btn btn-default saveProfile" v-on:click="updateUserdetails">Save</button>
              </div>
            </div>
          </div>
          <div class="col-sm-1 photo">
            <img src="http://mangalayatan.in/wp-content/uploads/2016/01/member1.jpg" v-if="this.$store.state.userDetails.image_url==undefined">
            <img :src="this.$store.state.userDetails.image_url" v-if="this.$store.state.userDetails.image_url!=undefined">
            <input type="file"  ref="fileInput" id="imgupload" style="display: none;" v-on:change="uploadToAws">
            <button class="btn btn-default uploadbtn" v-on:click="triggerFileUpload">Upload Photo</button>
          </div>
        </div>
      </div>
    </div>
    <div class="panel panel-default">
      <div class="panel-heading">
        <h4 class="panel-title">
          <a data-toggle="collapse" data-parent="#accordion" href="#collapse2">Date Configuration</a>
        </h4>
      </div>
      <div id="collapse2" class="panel-collapse collapse">
        <div class="panel-body">
          <div class="panel-body row formContent">
            <div class="form-horizontal col-sm-10">
              <div class="form-group">
                <label class="control-label col-sm-2">Date Type:</label>
                <div class="col-sm-10">
                  <label class="radio-inline" title="Ex:-DD/MM/YY">
                    <input type="radio" name="optradio" value="formated" v-model="$store.state.dateType">Formated
                  </label>
                  <label class="radio-inline" title="Ex:-few time ago">
                    <input type="radio" name="optradio" value="relative" v-model="$store.state.dateType">Relative
                  </label>
                </div>
              </div>
              <div class="form-group" v-if="$store.state.dateType=='formated'">
                <label class="control-label col-sm-2" for="dateFormat">Date Format:</label>
                <div class="col-sm-10">
                  <input type="text" class="form-control" id="dateFormat" v-model="$store.state.dateFormat">
                </div>
              </div>
              <div class="form-group" v-if="$store.state.dateType=='formated'">
                <div class="col-sm-offset-2 col-sm-10">
                  <input type="text" class="form-control" value="Write your own date formate for example HH:mm a DD/MM/YYYY" readonly>
                </div>
              </div>
              <div class="form-group" v-if="$store.state.dateType=='formated'">
                <div class="col-sm-offset-2 col-sm-10">
                  <button class="btn btn-default" v-on:click="setDateFormat">Set</button>
                </div>
              </div>
              <div class="form-group" v-if="$store.state.dateType=='formated'">
                <label class="control-label col-sm-2" for="datePreview">Preview:</label>
                <div class="col-sm-10">
                  <input type="text" class="form-control" id="datePreview" v-model="formatedDate" readonly>
                </div>
              </div>
              <div class="form-group" v-if="$store.state.dateType!='formated'">
                <div class="col-sm-offset-2 col-sm-10">
                  <input type="text" class="form-control" value="Relative Date will be appeared as 'few minutes ago'" readonly>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="panel panel-default">
      <div class="panel-heading">
        <h4 class="panel-title">
          <a data-toggle="collapse" data-parent="#accordion" href="#collapse3">Extra</a>
        </h4>
      </div>
      <div id="collapse3" class="panel-collapse collapse">
        <div class="panel-body">Lorem ipsum dolor sit amet, consectetur adipisicing elit</div>
      </div>
    </div>
  </div> 
</div>
</template>


<script>
var moment = require('moment')
import axios from 'axios'

  export default {
    name: 'setting',
    data(){
      return{
        formatedDate:'',
        fullname: this.$store.state.userDetails.fullname,
        email: this.$store.state.userDetails.email
      }
    },
    methods:{
      triggerFileUpload(){
        this.$refs.fileInput.click()
      },
      backToMailDetail(){
        this.$store.state.replyDetails.to = []
        this.$store.state.replyDetails.cc = []
        this.$store.state.replyDetails.from = ''
        this.$store.state.replyDetails.parentId = ''
        this.$store.state.replyDetails.subject = ''
        this.$store.state.mjmlTheme = ''
        this.$store.state.composeOpen = false
        this.$store.state.settingOpen = false
        this.$store.state.displayReply = false
        this.$store.state.calenderOpen = false
        this.$store.state.mjmlOpen = false
      },
      setDateFormat(){
        let date = new Date()
        if(this.$store.state.dateType!='relative')
          this.formatedDate = moment(date).format(this.$store.state.dateFormat)
        else
          this.formatedDate = moment(date).fromNow()
      },
      updateUserdetails(){
        axios({
          method: 'put',
          url: process.env.userUpdate+this.$store.state.userDetails._id,
          headers: {
            'authorization': this.$cookie.get('auth_token')
          },
          data:{
            fullname: this.fullname
          }
        })
        .then(response => {
          if(response){
            axios({
              method: 'post',
              url: process.env.authUrl+'/userdetails',
              headers: {
                'authorization': this.$cookie.get('auth_token')
              }
            })
            .then(response => {
              this.$store.state.userDetails = response.data.data ;
            })
          }
        })
      },
      uploadToAws(){
        let self = this
        let bucket = new AWS.S3({ params: { Bucket: 'airflowbucket1/obexpense/expenses'}})
        let filechooser = document.getElementById("imgupload");
        let file = filechooser.files[0];
        if(file){
          var params = { Key: file.name, ContentType: file.type, Body: file };
          bucket.upload(params).on('httpUploadProgress', function (evt) {            
          }).send(function (err, data) {
            axios({
              method: 'put',
              url: process.env.userUpdate+self.$store.state.userDetails._id,
              headers: {
                'Authorization': this.$cookie.get('auth_token')
              },
              data:{
                image_url: data.Location,
                image_name: file.name
              }
            })
            .then(response => {
              if(response){
                axios({
                  method: 'post',
                  url: process.env.authUrl+'/userdetails',
                  headers: {
                    'authorization': this.$cookie.get('auth_token')
                  }
                })
                .then(response => {
                  self.$store.state.userDetails = response.data.data ;
                })
              }
            })
          })
        }
      }
    }
  }
</script>


<style scoped>
.settingContainer{
  width: 78%;
  margin-left: 21%;
}
a:focus, a:hover{
  text-decoration: none;
}
.saveProfile:focus{
  outline: none;
}
.formSize{
  width: 75%;
  display: inline-block;
}
.formContent{
  width: 100%;
  margin: 0;
}
.photo{
  border: 1px solid #cccccc;
  border-radius: 2%;
  left: 3%;
  width: 10%;
  height: 115px;
  padding: 0;
}
.photo > img{
  height: 100%;
  width: 100%;
}
.uploadbtn{
  width: 100%;
}
.uploadbtn:focus{
  outline: none;
}
.panel-group .panel{
  margin-bottom: 15px;
}
.backBtn{
  margin-bottom: 15px;
}
.panel-default>.panel-heading+.panel-collapse>.panel-body{
  min-height: 200px;
}
.activeToggle{
  margin-left: 2%;
  width: 96%;
  height: 100%;
}
</style>