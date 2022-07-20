<template>
  <div class="container text-center">
    <MyNav />
 
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
    this.recommendProfiles()
  },
  methods:{
    
    async recommendProfiles() {
      try {
        const urqlClient = await this.$util.createClient()
        const response = await urqlClient.query(recommendProfiles).toPromise()
        const profileData = await Promise.all(response.data.recommendedProfiles.map(async profile => {
          const pub = await urqlClient.query(getPublications, { id: profile.id, limit: 1 }).toPromise()
          profile.publication = pub.data.publications.items[0]
          return profile
        }))
        this.pubs=profileData
      } catch (err) {
        console.log('error fetching recommended profiles: ', err)
      }
    },

  },
  components:{
    MyNav,MyFooter
  }
}
</script>