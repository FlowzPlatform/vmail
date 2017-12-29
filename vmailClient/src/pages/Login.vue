<template>
  <v-app id="layout" dark>
    <v-content style="background-color: #2d324e;">
      <v-container fluid fill-height>
        <v-layout row wrap justify-center align-center>
          <v-flex xs12 sm6 md6 lg4 style="box-shadow: 0 2px 4px -1px rgba(0,0,0,.2), 0 4px 5px 0 rgba(0,0,0,.14), 0 1px 10px 0 rgba(0,0,0,.12)">
            <v-layout row wrap>
              <v-flex xs12 sm12 md12>
                <v-alert outline color="error" icon="warning" :value="errMsg" transition="scale-transition">
                  {{ errMsg }}
                </v-alert>
                <v-alert outline color="success" icon="check_circle" :value="successMsg" transition="scale-transition">
                  {{ successMsg }}
                </v-alert>
              </v-flex>
              <template>
                <v-tabs fixed left>
                  <v-tabs-bar dark style="background-color: #0e1118;border-color: #0e1118;">
                    <v-tabs-item href="#login">
                      login
                    </v-tabs-item>
                    <v-tabs-item href="#ldap">
                      ldap login
                    </v-tabs-item>
                  </v-tabs-bar>
                  <v-tabs-items>



                    <v-tabs-content id="ldap">
                      <v-card flat style="background-color: #232636">
                        <v-card-text>
                          <v-form v-model="ldapValid" ref="ldapData" lazy-validation>
                            <v-container fluid>
                              <v-layout row wrap>
                                <v-flex xs12>
                                  <v-text-field
                                    label="E-mail"
                                    v-model="ldapData.email"
                                    :rules="[rules.required, rules.email]"
                                  ></v-text-field>
                                </v-flex>
                                <v-flex xs12>
                                  <v-text-field
                                    label="Enter your password"
                                    v-model="ldapData.password"
                                    :rules="[rules.required]"
                                    type="password"
                                  ></v-text-field>
                                </v-flex>
                              </v-layout>
                              <v-layout row wrap style="margin-top: 10px;">
                                <v-flex xs12 sm8 md8>
                                </v-flex>
                                <v-flex xs12 sm4 md4>
                                  <v-btn block color="success" @click="ldapLogin" :disabled="!ldapValid">Login</v-btn>
                                </v-flex>
                              </v-layout>
                            </v-container>
                          </v-form>
                        </v-card-text>
                      </v-card>
                    </v-tabs-content>



                    <v-tabs-content id="login">
                      <v-card flat style="background-color: #232636">
                        <v-card-text>
                          <v-form v-model="formValid" ref="formData" lazy-validation>
                            <v-container fluid>
                              <v-layout row wrap>
                                <v-flex xs12>
                                  <v-text-field
                                    label="E-mail"
                                    v-model="formData.email"
                                    :rules="[rules.required, rules.email]"
                                  ></v-text-field>
                                </v-flex>
                                <v-flex xs12>
                                  <v-text-field
                                    label="Enter your password"
                                    v-model="formData.password"
                                    :rules="[rules.required]"
                                    type="password"
                                  ></v-text-field>
                                </v-flex>
                              </v-layout>
                              <v-layout row wrap style="margin-top: 10px;">
                                <v-flex xs12 sm8 md8>
                                  <v-btn icon slot="activator" dark @click="tweeLogin">
                                    <i class="fa fa-twitter fa-2x"></i>
                                  </v-btn>
                                  <v-btn icon slot="activator" dark @click="gmailLogin">
                                    <i class="fa fa-google fa-2x"></i>
                                  </v-btn>
                                  <v-btn icon slot="activator" dark @click="fbLogin">
                                    <i class="fa fa-facebook fa-2x"></i>
                                  </v-btn>
                                  <v-btn icon slot="activator" dark @click="gitLogin">
                                    <i class="fa fa-github fa-2x"></i>
                                  </v-btn>
                                </v-flex>
                                <v-flex xs12 sm4 md4>
                                  <v-btn block color="success" @click="login" :disabled="!formValid">Login</v-btn>
                                </v-flex>
                              </v-layout>
                            </v-container>
                          </v-form>
                        </v-card-text>
                      </v-card>
                    </v-tabs-content>


                  </v-tabs-items>
                </v-tabs>
              </template>
            </v-layout>
          </v-flex>
        </v-layout>
      </v-container>
    </v-content>


    <form id="form-google" name="form-google" :action=loginWithGoogleUrl method="post">
      <input type="hidden" name="success_url" :value=callbackUrl>
    </form>

    <form id="form-facebook" name="form-facebook" :action=loginWithFacebookUrl method="post">
      <input type="hidden" name="success_url" :value=callbackUrl>
    </form>

    <form id="form-twitter" name="form-twitter" :action=loginWithTwitterUrl method="post">
      <input type="hidden" name="success_url" :value=callbackUrl>
    </form>

    <form id="form-github" name="form-github" :action=loginWithGithubUrl method="post">
      <input type="hidden" name="success_url" :value=callbackUrl>
    </form>

  </v-app>
</template>



<script>
  import authentication from '@/api/authentication'
  import psl from 'psl'
  import $ from "jquery"
  
  export default {
    data () {
      return {
        formValid: true,
        ldapValid: true,
        errMsg: null,
        successMsg: null,
        formData:{
          email: '',
          password: ''
        },
        ldapData:{
          email: '',
          password: ''
        },
        callbackUrl : process.env.callbackUrl,
        loginWithFacebookUrl : process.env.loginWithFacebookUrl,
        loginWithGoogleUrl : process.env.loginWithGoogleUrl,
        loginWithTwitterUrl : process.env.loginWithTwitterUrl,
        loginWithGithubUrl : process.env.loginWithGithubUrl,
        rules: {
          required: (value) => !!value || 'Required.',
          email: (value) => {
            const pattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            return pattern.test(value) || 'Invalid e-mail.'
          }
        }
      }
    },
    methods : {
      async login () {
        if (this.$refs.formData.validate()) {
          let self = this
          self.successMsg = "Authenticating ...!"
          var auth = await authentication.login(self.formData).catch(error => {
            self.successMsg = null
            self.errMsg = error.response.data
            setTimeout(function(option) {
              self.errMsg = null
            },3000)
          })

          if (auth) {
            self.successMsg = "Logged in successfully ...!"
            setTimeout(function(option) {
              self.successMsg = null
            },3000)

            let location = psl.parse(window.location.hostname)  // get parent domain
            location = location.domain === null ? location.input : location.domain
            self.$cookie.set('auth_token', auth.logintoken, {expires: 1, domain: location}) // Store in cookie
            self.$router.push({ path: '/user/maildashboard' })
          }
        }
      },
      async ldapLogin(){
        if (this.$refs.ldapData.validate()) {
          let self = this
          var auth = await authentication.ldapLogin(self.ldapData).catch(error => {
            self.errMsg = error.response.data.message
            setTimeout(function(option) {
              self.errMsg = null
            },3000)
          })

          if (auth) {
            self.successMsg = "Logged in successfully ...!"
            setTimeout(function(option) {
              self.successMsg = null
            },3000)

            let location = psl.parse(window.location.hostname)  // get parent domain
            location = location.domain === null ? location.input : location.domain
            self.$cookie.set('auth_token', auth.logintoken, {expires: 1, domain: location}) // Store in cookie
            self.$router.push({ path: '/user/maildashboard' })
          }
        }
      },
      fbLogin(){
        $("#form-facebook").submit();
      },
      gmailLogin(){
        $("#form-google").submit();
      },
      tweeLogin(){
        $("#form-twitter").submit();
      },
      gitLogin(){
        $("#form-github").submit();
      }
    },
    created(){
      var url_string = window.location.href;
      var url = new URL(url_string);

      var id = url.searchParams.get('ob_id')
      if(id){
        this.$store.state.obid = id
        this.$router.push({ path: '/SocialLogin' })
      }

      var token = url.searchParams.get('token')            
      if (token) {               
        let location = psl.parse(window.location.hostname)  // get parent domain
        location = location.domain === null ? location.input : location.domain
        this.$cookie.set('auth_token', token, {expires: 1, domain: location}) // Store in cookie
        this.$router.push({ path: '/user/maildashboard' })
      }

    },
    mounted(){
      var simpleLogin = document.getElementById('login')
      let self = this
      simpleLogin.onkeypress = function (e) {
        if (e.key == 'Enter'){
          self.login()
        }
      }

      var ldap = document.getElementById('ldap')
      ldap.onkeypress = function (e) {
        if (e.key == 'Enter'){
          self.ldapLogin()
        }
      }
    }
  }
</script>