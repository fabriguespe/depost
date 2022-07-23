<template>
  <body> 
    <MyNav />
      <div class="container text-center ">
        <div v-if="loading" class="loader"></div>
        <template v-else-if="profile" >
          <div class="profile d-flex flex-column">
        
            <img width="150" style="margin:0 auto;" :src="getImage()"/>
            <span>{{profile.name}} - @{{profile.handle}}</span>
            <span>{{profile.bio}}</span>
          </div>
          <h5 v-if="pubs && pubs.lenght>0" style="margin-top:20px;text-aling:center">Stories</h5>
          <h5 v-else style="margin-top:20px;text-aling:center">No stories yet</h5>
          <div  v-for="(pub,index) in pubs" :key="pub.id"> <Pub :pub="pub" /> </div>
        </template>
        <h5 v-else style="margin-top:20px;text-aling:center">Profile not found, connect</h5>
      </div>
    <MyFooter/>
  </body>
</template>


<script>

import MyNav from '@/components/Nav'
import MyFooter from '@/components/Footer'
export default {
  middleware: 'auth',
  data() {
        return {
          loading:true,
          pubs:null,
          profile:null
        }
  },
  async mounted(){
    
    let id=this.$route.params.id
    const {profile,publications} = await this.$util.getProfileByHandle(id)
    this.pubs=publications
    this.profile=profile
    this.loading=false
  },
  methods:{
    getImage(){
      if(this.profile && this.profile.picture){
        return this.profile.picture.original.url
      }
      else return "https://pbs.twimg.com/profile_images/1490782523701481474/DtyJ_8ej_400x400.jpg"
    },
  },
  components:{
    MyNav,MyFooter
  }
}
</script>