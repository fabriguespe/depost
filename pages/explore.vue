<template>
  <body>
    <MyNav />
    <div class="container text-center">
      <h4 style="margin-top:20px;text-aling:center">Most liked</h4>
      <div v-if="!pubs" class="loader"></div>
      <div v-for="(pub,index) in pubs" :key="pub.id">  <Pub :pub="pub" /> </div>
    </div>
  </body>
</template>


<script>

import {  explorePublications ,baseSources} from '@/plugins/lens_api'
import MyNav from '@/components/Nav'
import Pub from '@/components/Pub'
import MyFooter from '@/components/Footer'

export default {
  data() {
        return {
          pubs:null,
        }
  },
  async mounted(){

    await this.$util.checkMatic()
    this.explorePublications()
  },
  methods:{
    
    async explorePublications() {
      try {

        const urqlClient = await this.$util.createClient()
        const response = await urqlClient.query(explorePublications,{publicationTypes: ["POST"],sources:baseSources}).toPromise()
        this.pubs=response.data.explorePublications.items

        console.log(this.pubs)
      } catch (err) {
        console.log('error fetching recommended profiles: ', err)
      }
    },

  },
  components:{
    MyNav,Pub,MyFooter
  }
}
</script>