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
                <v-layout row>
                  <v-flex xs12>
                    <v-card>
                      <v-toolbar dark style="background-color: #0e1118;border-color: #0e1118;">
                        <v-toolbar-title>Register Your Email</v-toolbar-title>
                      </v-toolbar>
                      <template>
                        <v-form v-model="formValid" ref="formData" lazy-validation style="background-color: #232636">
                            <v-container fluid>
                              <v-layout row wrap>
                                <v-flex xs12>
                                  <v-text-field
                                    label="E-mail"
                                    v-model="formData.email"
                                    :rules="[rules.required, rules.email]"
                                  ></v-text-field>
                                </v-flex>
                              </v-layout>
                              <v-layout row wrap style="margin-top: 10px;">
                                <v-flex xs12 sm12 md4 lg4 offset-md8 offset-lg8>
                                  <v-btn block color="success" @click="login" :disabled="!formValid">Register</v-btn>
                                </v-flex>
                              </v-layout>
                            </v-container>
                          </v-form>
                      </template>
                    </v-card>
                  </v-flex>
                </v-layout>
              </template>


            </v-layout>
          </v-flex>
        </v-layout>
      </v-container>
    </v-content>
  </v-app>
</template>


<script>
  import authentication from '@/api/authentication'
  import psl from 'psl'

  export default {
    data () {
      return {
        formValid: true,
        errMsg: null,
        successMsg: null,
        formData:{
          email: '',
          id: this.$store.state.obid
        },
        rules: {
          required: (value) => !!value || 'Required.',
          email: (value) => {
            const pattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            return pattern.test(value) || 'Invalid e-mail.'
          }
        }
      }
    },
    methods:{
      async login () {
        if (this.$refs.formData.validate()) {
          let self = this
          self.successMsg = "Authenticating ...!"
          var auth = await authentication.gmailLogin(self.formData).catch(error => {
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
      }
    }
  }
</script>