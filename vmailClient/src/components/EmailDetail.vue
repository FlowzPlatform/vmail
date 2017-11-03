<template>
  <section class="emailDetail">
  	<div style="display: block; text-align: center;margin: 110px" v-if="$store.state.emailDetail==''">
      <i class="fa fa-spinner fa-spin" style="font-size:24px"></i>
    </div>
    <div v-if="emailDetail">
      <div v-if="emailDetail.emailType==undefined">
  	    <h2>
  	    	<span class="icon icon-star-large"></span>
  	    	{{emailDetail.subject}}
  	    </h2>
  	    <div class="meta-data">
  	      <p>
  	        <img src="http://api.randomuser.me/portraits/med/men/66.jpg" class="avatar">
  	        {{emailDetail.from.value[0].address}}
  	        <span class="date" style="float: right;">{{emailDetail.date | dateFormat(dateType) }}</span>
  	      </p>
  	    </div>
  	    <div class="body" v-html="this.emailDetail.html"></div>
      </div>
      <div v-if="emailDetail.emailType!=undefined">
        <h2>
          <span class="icon icon-star-large"></span>
          {{emailDetail.data.subject}}
        </h2>
        <div class="meta-data">
          <p>
            <img src="http://api.randomuser.me/portraits/med/men/66.jpg" class="avatar">
            {{emailDetail.data.from}}
            <span class="date" style="float: right;">{{emailDetail.sendedAt | dateFormat(dateType) }}</span>
          </p>
        </div>
        <div class="body" v-html="this.emailDetail.data.body"></div>
      </div>
	  </div>
  </section>
</template>


<script>
var moment = require('moment')

  export default {
    name: 'emailDetail',
    data(){
      return {
        dateType: this.$store.state.dateFormat
      }
    },
	  computed: {
	    emailDetail() {
	      let detail = this.$store.state.emailDetail
	      return detail
	    }
	  },
    filters: {
      dateFormat(date,type){
        let myDate;
        if(type == 'relative')
          myDate = moment(date).fromNow()
        else if(type == 'dateType1')
          myDate = moment(date).format('HH:mm a DD/MM/YYYY')
        else if(type == 'dateType2')
          myDate = moment(date).format('DD/MM/YY')
        return myDate
      }
    }
  }
</script>

<style scoped>
.emailDetail {
  -webkit-flex: 1;
  order: 2;
  background: #fff;
  display: block;
}
.emailDetail h2 {
  margin: 0;
  padding: 20px 30px;
  font-weight: 400;
}
.emailDetail .meta-data {
  margin: 10px 30px;
  border-top: 1px solid #ddd;
  border-bottom: 1px solid #ddd;
  line-height: 50px;
  color: #888;
}
.emailDetail .body {
  padding: 20px 30px;
}
</style>