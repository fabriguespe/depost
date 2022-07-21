<template>
  <body> 
    <MyNav />
      <div class="container text-center ">
        <div class="profile d-flex flex-column">
          <img width="150" style="margin:0 auto;" :src="profile.picture.original.url"/>
          <span>{{profile.name}} - @{{profile.handle}}</span>
          <span>{{profile.bio}}</span>
        </div>
        <h5 style="margin-top:20px;text-aling:center">Posts</h5>
        <div v-if="!pubs" class="loader"></div>
        <div v-for="(pub,index) in pubs" :key="pub.id">
          <Pub :pub="pub" />
        </div>
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

  },
  methods:{
    
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