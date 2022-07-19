<template>
  <div class="container text-center">
    <MyNav :key="wallet" :wallet="wallet"/>
    <div v-if="!wallet && !profile" class="container text-center">
      <h4>No profile, connect your wallet</h4>
    </div>
    <div v-else-if="!profile" class="loader"></div>
    <div v-else-if="profile" class="container text-center">
      <img v-if="profile.picture" style='border-radius:50%;display:block;max-width:300px;margin:0 auto;' :src='profile.picture.original.url'/>
      <button class="btn btn-outline-success " style="margin-top:20px;"  @click="showModal=true">Change image</button>
      <span style="display:block;margin-top:20px;">{{profile.id}}</span>
      <h2 style="margin-top:20px;">{{profile.name}}</h2>
      <p style="margin-top:20px;">{{profile.bio}}</p>
      <postModal v-show="showModal" @close-modal="showModal = false" :provider="provider" />
    </div>
  </div>
</template>


<script>
import { defaultProfile } from '@/plugins/api'
import MyNav from '@/components/Nav'
import postModal from '@/components/postModal'
export default {
  data() {
        return {
            showModal:false,
            profile:null,
            provider:null,
            wallet:this.$store.state.wallet
        }
  },
  async mounted(){

      const accounts = await window.ethereum.request({ method: 'eth_accounts' })
      const account = accounts[0]
      this.wallet=account
      this.$store.state.wallet=account
      await this.$util.checkMatic()
      if(this.wallet)this.fetchProfile(this.wallet)
  },
  methods:{
    
    
    async  fetchProfile(wallet) {
      try {
        let dis= this
        const urqlClient = await this.$util.createClient()
        const dd = await urqlClient.query(defaultProfile, {request:{ethereumAddress: wallet }}).toPromise()
        this.profile=dd.data.defaultProfile
   
      } catch (err) {
        console.log('error fetching profile...', err)
      }
    }

  },
  components:{
    MyNav,postModal
  }
}
</script>