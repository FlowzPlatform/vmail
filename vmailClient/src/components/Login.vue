<style scoped>
  @import '../assets/css/Login.css';
</style>


<template>
  <div class="mainBody">
    <div class="loginContainer">
      <div class="success"><p id="text_mess" v-if="errmsg!=''">{{errmsg}}</p></div>
      <div class="backbox">
        <div class="loginMsg">
          <div class="textcontent">
            <p class="title">Don't have an account?</p>
            <p>Sign up to save all your graph.</p>
            <button id="switch1">Sign Up</button>
          </div>
        </div>
        <div class="signupMsg visibility">
          <div class="textcontent">
            <p class="title">Have an account?</p>
            <p>Log in to see all your collection.</p>
            <button id="switch2">LOG IN</button>
          </div>
        </div>
      </div>

      <form id="form-facebook" name="form-facebook" :action=loginWithFacebookUrl method="post">
        <input type="hidden" name="success_url" :value=callbackUrl>
      </form>

      <form id="form-google" name="form-google" :action = loginWithGoogleUrl method="post">
        <input type="hidden" name="success_url" :value=callbackUrl>
      </form>
      
      <div class="frontbox">
        <div class="login">
          <h2>LOG IN</h2>
          <div class="inputbox">
            <input type="email" v-model="email" placeholder="Email Id">
            <input type="password" v-model="password" placeholder="Password" v-on:keydown.enter.prevent.stop="login">
          </div>
          <p v-on:click="forgetPassword">FORGOT PASSWORD ?</p>
          <button v-on:click="login">LOG IN</button>
          <div class="social">
            <span v-on:click="facebookLogin">
              <i class="fa fa-facebook-square fa-2x" aria-hidden="true"></i>
            </span>
            <span v-on:click="googleLogin">
              <i class="fa fa-google-plus-square fa-2x" aria-hidden="true"></i>
            </span>
            <span v-on:click="twitterLogin">
              <i class="fa fa-twitter-square fa-2x" aria-hidden="true"></i>
            </span>
            <span v-on:click="githubLogin">
              <i class="fa fa-github-square fa-2x" aria-hidden="true"></i>
            </span>
          </div>
        </div>

        <div class="signup hide">
          <h2>SIGN UP</h2>
          <div class="inputbox">
            <input type="text" v-model="username" placeholder="Username">
            <input type="email" v-model="signupemail" placeholder="Email Id">
            <input type="password" v-model="signuppassword" placeholder="Password">
          </div>
          <button v-on:click="signup">SIGN UP</button>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
  import Vue from 'vue';
  import $ from 'jquery';
  import axios from 'axios'
  import psl from 'psl'

  export default {
    name: 'login',
    data() {
      return {
        errmsg:'',
        email:'',
        password:'',
        username:'',
        signupemail:'',
        signuppassword:'',
        callbackUrl : process.env.callbackUrl,
        loginWithFacebookUrl : process.env.loginWithFacebookUrl,
        loginWithGoogleUrl : process.env.loginWithGoogleUrl
      }
    },
    methods:{
      facebookLogin(){
        console.log("calling")
        $("#form-facebook").submit() 
      },
      googleLogin(){
        console.log("calling")
        $("#form-google").submit();
      },
      twitterLogin(){
        console.log("calling")
      },
      githubLogin(){
        console.log("calling")
      },
      login:function(){
        let self = this
        let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

        if(this.email=='' || this.password==''){
          self.errmsg = 'All fields are required..!'
          setTimeout(function() {self.errmsg = ''}, 3000)
        }
        else if(!re.test(this.email)){
          self.errmsg = 'Email Id is not valid..!'
          setTimeout(function() {self.errmsg = ''}, 3000)
        }
        else{
          let self=this
          axios({
            method: 'post',
            url: process.env.authUrl+'/login',
            data: {
              email: this.email,
              password: this.password
            }
          })
          .then(response => {
            let location = psl.parse(window.location.hostname)
            location = location.domain === null ? location.input : location.domain
            self.$cookie.set('auth_token', response.data.logintoken, {expires: 1, domain: location});
            self.$store.state.loginToken = self.$cookie.get('auth_token')
          })
          .catch(function(e) {
            if(e.response.data === 'That user does not exist'){
              self.errmsg = 'User does not exist..!'
              setTimeout(function(option) {
                self.errmsg = ''
              },3000)
            }
            if(e.response.data === "password doesn't match"){
              self.errmsg = 'Password is incorrect..!'
              setTimeout(function(option) {
                self.errmsg = ''
              },3000)
            }
          })
        }
      },
      signup:function(){
        let self = this
        let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

        if(this.username=='' || this.signupemail=='' || this.signuppassword==''){
          self.errmsg = 'All fields are required..!'
          setTimeout(function() {self.errmsg = ''}, 3000)
        }
        else if(!re.test(this.signupemail)){
          self.errmsg = 'Email Id is not valid..!'
          setTimeout(function() {self.errmsg = ''}, 3000)
        }
        else{
          let self=this
          axios({
            method: 'post',
            url: process.env.authUrl+'/setup',
            data: {
              fullname: this.username,
              email: this.signupemail,
              password: this.signuppassword
            }
          })
          .then(response => {
            if(response)
              self.errmsg = 'User Registered Successfully..!'
              setTimeout(function() {self.errmsg = ''}, 3000) 
          })
        }
      },
      forgetPassword(){
        console.log('forget calling')
      }
    },
    mounted() {
      var $loginMsg = $('.loginMsg'),
        $login = $('.login'),
        $signupMsg = $('.signupMsg'),
        $signup = $('.signup'),
        $frontbox = $('.frontbox');

      $('#switch1').on('click', function() {
        $loginMsg.toggleClass("visibility");
        $frontbox.addClass("moving");
        $signupMsg.toggleClass("visibility");

        $signup.toggleClass('hide');
        $login.toggleClass('hide');
      })

      $('#switch2').on('click', function() {
        $loginMsg.toggleClass("visibility");
        $frontbox.removeClass("moving");
        $signupMsg.toggleClass("visibility");

        $signup.toggleClass('hide');
        $login.toggleClass('hide');
      })
    }
  }
</script>


<style scoped>
  .social {
    position: relative;
    margin-top: 10px;
  }
  .social span {
    margin-right: 5px;
  }
  .social span:hover {
    cursor: pointer;
  }
</style>