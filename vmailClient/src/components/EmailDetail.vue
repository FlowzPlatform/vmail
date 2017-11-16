<template>
  <section class="emailDetail">
  	<div style="display: block; text-align: center;margin: 110px" v-if="$store.state.emailDetail==''">
      <i class="fa fa-spinner fa-spin" style="font-size:24px"></i>
    </div>
    <div v-if="emailDetail">
      <div v-if="emailDetail.received">
  	    <h2>
  	    	<span class="icon icon-star-large"></span>
  	    	{{emailDetail.subject}}
  	    </h2>
  	    <div class="meta-data">
  	      <p>
  	        <img src="http://mangalayatan.in/wp-content/uploads/2016/01/member1.jpg" class="avatar">
  	        {{emailDetail.from.value[0].address}}
  	        <span class="date" style="float: right;">{{emailDetail.date | dateFormat(dateType,dateFormat) }}</span>
  	      </p>
  	    </div>
  	    <div class="body" v-html="this.emailDetail.html"></div>
      </div>
      <!-- <div v-if="!emailDetail.received">
        <h2>
          <span class="icon icon-star-large"></span>
          {{emailDetail.subject}}
        </h2>
        <div class="meta-data">
          <p>
            <img src="http://mangalayatan.in/wp-content/uploads/2016/01/member1.jpg" class="avatar">
            {{emailDetail.from.value[0].address}}
            <span class="date" style="float: right;">{{emailDetail.date | dateFormat(dateType,dateFormat) }}</span>
          </p>
        </div>
        <div class="body" v-html="this.emailDetail.html"></div>
      </div> -->
	  </div>
  </section>
</template>


<script>
var moment = require('moment')

  export default {
    name: 'emailDetail',
    data(){
      return {
        dateType: this.$store.state.dateType,
        dateFormat: this.$store.state.dateFormat
      }
    },
	  computed: {
	    emailDetail() {
	      let detail = this.$store.state.emailDetail
	      return detail
	    }
	  },
    filters: {
      dateFormat(date,dateType,dateFormat){
        let myDate;
        if(dateType!='relative')
          myDate = moment(date).format(dateFormat)
        else
          myDate = moment(date).fromNow()
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
.avatar{
  height: 50px;
  width: 50px;
  border-radius: 50%;
}
</style>