<template>
	<div class="menu">
	  <div class="container-fluid">
			<div class="navbar-header">
				<img src="../assets/image/Flowz-logo.png" class="logo">
			</div>
			<div>
				<ul class="nav navbar-nav navbar-right">
					<li>
						<img src="http://mangalayatan.in/wp-content/uploads/2016/01/member1.jpg" v-if="this.$store.state.userDetails.image_url==undefined"></img>
						<img :src="this.$store.state.userDetails.image_url" v-if="this.$store.state.userDetails.image_url!=undefined"></img>
						<a v-if='this.$store.state.userDetails.fullname!=""'>{{$store.state.userDetails.fullname}}</a>
						<a v-if="this.$store.state.userDetails.fullname==''">User</a>
						<a v-if="logoutMenu" v-on:click="logoutMenu=!logoutMenu">
							<span class="glyphicon glyphicon-menu-right"></span>
						</a>
						<a v-if="!logoutMenu" v-on:click="logoutMenu=!logoutMenu">
							<span class="glyphicon glyphicon-menu-left"></span>
						</a>
					</li>
					<li v-if="logoutMenu" class="logoutMenu">
						<a v-on:click="logout">Logout</a>
						<a v-on:click="openSetting">Settings</a>
					</li>
				</ul>
			</div>
		</div>
	</div>
</template>


<script>
import axios from 'axios'

export default {
  name: 'header',
  data(){
  	return{
  		logoutMenu:false
  	}
  },
  methods:{
  	logout: function() {
      localStorage.removeItem("token")
      location.reload()
    },
    openSetting(){
    	this.$store.state.replyDetails.to = []
			this.$store.state.replyDetails.cc = []
      this.$store.state.replyDetails.from = ''
      this.$store.state.replyDetails.parentId = ''
      this.$store.state.replyDetails.subject = ''
  		this.$store.state.composeOpen = false
  		this.$store.state.settingOpen = true
  		this.$store.state.displayReply = false
  		this.$store.state.calenderOpen = false
  		this.$store.state.mjmlOpen = false
    }
  },
  mounted(){
    axios({
      method: 'post',
      url: process.env.authUrl+'/userdetails',
      headers: {
        'authorization': localStorage.getItem("token")
      }
    })
    .then(response => {
      this.$store.state.userDetails = response.data.data
    })
  }
}
</script>


<style scoped>
.logo{
  height: 25px;
  margin: 6px;
}
.menu{
  position: fixed;
  top:0; 
  left:0;
  background-color: #2b3643;
  width:100%;
  height: auto;
}
.menu .navbar-nav > .active > a{
  background-color : #04A3ED;
  color: white;
  font-weight: bold;
}
.menu .navbar-nav >li>img {
  height: 20px;
  border-radius: 40px;  
}
.menu .navbar-nav >li>a{
  display: inline-block;
  font-size: 15px;
  color: #c6cfda;
  padding: 10px 10px;
  font-weight: normal;
}
.menu .navbar-nav >li>a:hover{
  background-color: #364150;
  cursor: pointer;
}
.menu .navbar-nav > li > a > span:hover{
  cursor: pointer;
}
.navbar-header >a{
  /*font-family: 'Ubuntu Condensed', sans-serif;*/
  text-decoration: none;
  color: white;
  font-size: 25px;
}
</style>