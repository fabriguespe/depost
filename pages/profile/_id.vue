<template>
  <body> 
    <MyNav />
      <div class="container text-center ">
        <div v-if="profile" class="profile d-flex flex-column">
       
          <img width="150" style="margin:0 auto;" :src="getImage()"/>
          <span>{{profile.name}} - @{{profile.handle}}</span>
          <span>{{profile.bio}}</span>
        </div>
        <h5 style="margin-top:20px;text-aling:center">Stories</h5>
        <div v-if="!pubs" class="loader"></div>
        <div v-for="(pub,index) in pubs" :key="pub.id"> <Pub :pub="pub" /> </div>
      </div>
    <MyFooter/>
  </body>
</template>


<script>

import MyNav from '@/components/Nav'
import MyFooter from '@/components/Footer'
export default {
  data() {
        return {
          pubs:null,
          profile:null
        }
  },
  async mounted(){
    
    await this.$util.checkMatic()
    this.getProfile()
    let id=this.$route.params.id
    const {profile,publications} = await this.$util.getProfileByHandle(id)
    this.pubs=publications
    this.profile=profile
    console.log(this.profile)
  },
  methods:{
    getImage(){
      if(this.profile && this.profile.picture){
        return this.profile.picture.original.url
      }
      else return "https://pbs.twimg.com/profile_images/1490782523701481474/DtyJ_8ej_400x400.jpg"
    },
    async getProfile(){
        try {

        } catch (err) {
          console.log('error fetching profile...', err)
        }
    }

  },
  components:{
    MyNav,MyFooter
  }
}
</script>