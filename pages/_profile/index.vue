<template>
  <div class="container text-center">
    <MyNav/>
 
    <h4 style="margin-top:20px;text-aling:center">Recommended for you</h4>
    <div v-if="!pubs" class="loader"></div>
    <div v-for="(pub,index) in pubs" :key="pub.id">
      <div v-for="(post,index) in pub.publication" :key="post.id">
           <Pub :pub="post"/>
      </div>
      
    </div>
    <MyFooter/>
  </div>
</template>


<script>

import {  getPublications, recommendProfiles } from '@/plugins/api'
import MyNav from '@/components/Nav'
import MyFooter from '@/components/Footer'
export default {
  data() {
        return {
          pubs:null,
        }
  },
  async mounted(){

    await this.$util.checkMatic()
    this.getProfile()
  },
  methods:{
    
    async getProfile(){
        try {
          const { profile: profileData, publications: publicationData } = await utils.fetchProfile(id)
          
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