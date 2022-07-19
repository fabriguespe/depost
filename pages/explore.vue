<template>
  <div class="container text-center">
    <MyNav :key="wallet" :wallet="wallet"/>
 
    <h4 style="margin-top:20px;text-aling:center">Recommended for you</h4>
    <div v-if="!pubs" class="loader"></div>
    <div v-for="(pub,index) in pubs" :key="pub.id">
      <div v-for="(post,index) in pub.publication" :key="post.id">
          <Pub :pub="post"/>
      </div>
    </div>
  </div>
</template>


<script>

import {  explorePublications } from '@/plugins/api'
import MyNav from '@/components/Nav'
import Pub from '@/components/Pub'
export default {
  data() {
        return {
          wallet:this.$store.state.wallet,
          pubs:null,
        }
  },
  async mounted(){
    const accounts = await window.ethereum.request({ method: 'eth_accounts' })
    const account = accounts[0]
    this.wallet=account
    this.$store.state.wallet=account

    await this.$util.checkMatic()
    this.explorePublications()
  },
  methods:{
    
    async explorePublications() {
      try {

        const urqlClient = await this.$util.createClient()
        const response = await urqlClient.query(explorePublications).toPromise()
        this.pubs=response.data.explorePublications.items

        console.log(this.pubs)
      } catch (err) {
        console.log('error fetching recommended profiles: ', err)
      }
    },

  },
  components:{
    MyNav,Pub
  }
}
</script>