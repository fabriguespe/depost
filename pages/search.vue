<template>
  <body>
    <MyNav />
    <div class="container text-center">
      <h4>Search</h4>
      <input v-on:keyup.enter="onEnter"  class="search" placeholder="Search for content" v-model="query"/>
      <div v-if="loading" class="loader"></div>
      <div v-else-if="pubs.length==0" class="">No results found</div>
      <div v-for="(pub,index) in pubs" :key="pub.id">
        <Pub :pub="pub" />
      </div>
    </div>
    <MyFooter/>
  </body>
</template>


<script>

import {  searchPublications, baseSources } from '@/plugins/lens_api'
import MyNav from '@/components/Nav'
import MyFooter from '@/components/Footer'
export default {
  data() {
        return {
          loading:false,
          pubs:[],
          wallet:this.$store.state.wallet,
          query:""
          
        }
  },
  async mounted(){

    await this.$util.checkMatic()
  },
  methods:{
    async onEnter() {
      try {
        let dis=this
        this.loading=true
        this.pubs=[]
        const urqlClient = await this.$util.createClient()

        //Currently we can only search tags in lens protocol. Search is actively being developed.
        const pub = await urqlClient.query(searchPublications, { query:dis.query ,sources:baseSources}).toPromise()
        this.pubs=pub.data.search.items
        
        this.loading=false
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
.search{
  width:60%;
  margin: 0 auto;
  margin-bottom: 40px;;
}
</style>