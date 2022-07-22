<template>
  <body>
    <MyNav />
    <div class="container text-center">
      <h4>Latest posts</h4>
      <div v-if="!pubs" class="loader"></div>
      <div v-for="(pub,index) in pubs" :key="pub.id">
        <Pub :pub="pub" />
      </div>
    </div>
    <MyFooter/>
  </body>
</template>


<script>

import {  getPublications, defaultProfile,baseSources } from '@/plugins/lens_api'
import MyNav from '@/components/Nav'
import MyFooter from '@/components/Footer'
export default {
  data() {
        return {
          pubs:null,
          wallet:this.$store.state.wallet,
          
        }
  },
  async mounted(){

    
    await this.$util.checkMatic()
    this.latestPosts()
  },
  methods:{
    
    async latestPosts() {
      try {
        let dis=this
        const urqlClient = await this.$util.createClient()
        const dd = await urqlClient.query(defaultProfile, {request:{ethereumAddress: dis.$store.state.wallet }}).toPromise()
        let profile=dd.data.defaultProfile
        const pub = await urqlClient.query(getPublications, { id: profile.id ,sources:baseSources}).toPromise()
        this.pubs=pub.data.publications.items
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
<style >

h4{
  margin-bottom: 40px;
}
</style>