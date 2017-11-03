<template>
	<div v-bind:class="{middleView:$store.state.sidebarOpen,activeToggle:!$store.state.sidebarOpen}">
		<div class="row">
			<div class="col-md-4" id="subjectlist">
				<subjectlist></subjectlist>
			</div>
			<div class="col-md-8" id="conversation">
				<div class="expandIcon">
					<i class="fa fa-expand"></i>
				</div>
				<conversation></conversation>
			</div>
		</div>
	</div>
</template>


<script>
import subjectlist from './Subjectlist.vue'
import conversation from './Conversation.vue'

	export default{
		name: 'middle',
		components:{
			subjectlist,
			conversation
		},
		mounted(){
			$('.expandIcon').click(function (argument) {
				$('#conversation').toggleClass('open')
				$('.expandIcon > i').toggleClass('fa-compress')
			})
		}
	}
</script>


<style scoped>
	.activeToggle .row .col-md-8{
	  left: 31%;
    width: 65%;	
	}
	.col-md-4{
		padding: 20px;
		margin-left: 1%;
		width: 30%;
		border: 1px solid #e7ecf1;
	}
	.col-md-8.open {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    height: 100%;
    overflow: auto;
    width: 100%;
    max-height: 100%;
    background-color: #fff;
    margin-left: 0;
	}
	.col-md-8.open .chat{height: auto;}
	.col-md-8{
		padding: 20px;
		margin-left: 2%;
		width: 66%;
		border: 1px solid #e7ecf1;
    
    position: fixed;
    left: 45%;
    width: 52%;
    max-height: 89%;
    overflow: auto;
	}
	.middleView{
		margin-left: 22%;
		width: 76%;
		height: 100%;
	}
	.activeToggle{
		margin-left: 2%;
		width: 96%;
		height: 100%;
	}
	.expandIcon{
		position: absolute;
    top: 1px;
    right: 0;
    padding: 0px 5px;
    border-radius: 3px;
	}
	.expandIcon:hover{
		background-color: #dddddd;
		cursor: pointer;
	}
</style>