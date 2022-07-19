<template>
  <div class="container text-center">
    <MyNav :key="wallet" :wallet="wallet"/>
 
    <h4 style="margin-top:20px;text-aling:center">Recommended for you</h4>
    <div v-if="!pubs" class="loader"></div>
    <div v-for="(pub,index) in pubs" :key="pub.id">
      <div v-for="(post,index) in pub.publication" :key="post.id">
        <template >
          {{pub.publication.metadata.content}}
          <b style="display:block;margin-top:40px;">{{pub.id}}-{{pub.name}}</b>
          <p>{{pub.content}}</p>

          <img v-if="post.media && post.media[0] && post.media[0].original && post.media[0].original.mimeType.includes('image')" style='display:block;max-width:300px;margin:0 auto;' :src='post.media[0].original.url'/>
        </template>
      </div>
      
    </div>
  </div>
</template>


<script>

import {  getPublications, recommendProfiles } from '@/plugins/api'
import MyNav from '@/components/Nav'
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
    MyNav
  }
}
</script>