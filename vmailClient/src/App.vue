<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
var AWS = require('aws-sdk')
AWS.config.update({
  accessKeyId: process.env.accesskey,
  secretAccessKey: process.env.secretkey
});
AWS.config.region = 'us-west-2';
export default {
  name: 'app'
}
</script>

