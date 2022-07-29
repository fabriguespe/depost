<template>
  <body> 
    <MyNav />
      <div class="container text-center">
        <div v-if="loading" class="loader"></div>
        <h5  v-else-if="!profile" style="margin-top:20px;text-aling:center">Profile not found, connect</h5>
        <template v-else-if="profile" >
          <img :src="getCover()" style="width:100%;max-height:300px;margin-bottom:40px;object-fit: cover;"/>
          <div class="container d-flex flex-row" style="">
              <div class="profile d-flex flex-column" style="width:30%;">
                <img width="100%" style="margin:0 auto;" :src="getImage()"/>
                <span>{{profile.name}} - @{{profile.handle}}</span>
                <span>{{profile.bio}}</span>
                <button v-if="follow" @click="unfollow()">Unfollow</button>
                <button v-else @click="followUser()">Follow</button>
                <a style="border:0px;margin-top:20px;font-size:10px;" target="_blank" :href="'https://www.lensfrens.xyz/'+profile.handle" >Edit profile</a>
              </div>
              <div class="pubs " style="width:70%;">
                <h5 v-if="!publications || publications.length==0" style="margin-top:20px;text-aling:center">No posts yet</h5>
                <div  v-for="(pub,index) in publications" :key="pub.id"> <Pub :pub="pub" /> </div>
              </div>
          </div>
        </template>
      </div>
    <MyFooter/>
  </body>
</template>


<script>
import LENS_ABI from '@/plugins/lens_abi'
import MyNav from '@/components/Nav'
import {  ethers} from 'ethers'
import MyFooter from '@/components/Footer'
import { doesFollow,createUnfollowTypedData,LENS_HUB_CONTRACT_ADDRESS} from '@/plugins/lens_api'

export default {
  middleware: 'auth',
  data() {
        return {
          loading:true,
          publications:null,
          wallet:this.$store.state.wallet,
          profile:null,
          follow:false,
        }
  },
  async mounted(){
    try{
      let id=this.$route.params.id
      this.profile=await this.$util.getProfile(id)
      this.publications=await this.$util.getPublicationsByHandle(this.profile.id)
      this.loading=false
      this.checkDoesFollow()
    }catch(e){
      console.log(e)
    }
  },
  methods:{
      async  unfollow() {
        try {
          const urqlClient = await this.$util.createClient()
          const response = await urqlClient.mutation(createUnfollowTypedData, {request: { profile: this.profile.id }}).toPromise()
      
          const typedData = response.data.createUnfollowTypedData.typedData
          const contract = new ethers.Contract( typedData.domain.verifyingContract,LENS_ABI,this.$util.getSigner())
          const tx = await contract.burn(typedData.value.tokenId)
          this.follow=false
        
          await tx.wait()
          console.log(`successfully unfollowed ... ${this.profile.handle}`)
          } catch (err) {
            console.log('error:', err)
          }
      },
      async  followUser() {
        const contract = new ethers.Contract( LENS_HUB_CONTRACT_ADDRESS, LENS_ABI,this.$util.getSigner() )
        try {
          const tx = await contract.follow([this.profile.id], [0x0])
          this.follow=true
          await tx.wait()
          console.log(`successfully followed ... ${this.profile.handle}`)
        } catch (err) {
          console.log('error: ', err)
        }
      },

      getCover(){
        if(this.profile && this.profile.coverPicture){
          return this.profile.coverPicture.original.url
        }
        else return "https://pbs.twimg.com/profile_images/1490782523701481474/DtyJ_8ej_400x400.jpg"
      },
      getImage(){
        if(this.profile && this.profile.picture){
          return this.profile.picture.original.url
        }
        else return "https://pbs.twimg.com/profile_images/1490782523701481474/DtyJ_8ej_400x400.jpg"
      },
      async  checkDoesFollow() {
        const urqlClient = await this.$util.createClient()
      
        const response = await urqlClient.query(
          doesFollow, {
            request: {
              followInfos: [{
                followerAddress: this.wallet,
                profileId: this.profile.id
              }]
            }
          }
        ).toPromise()
        console.log('follow',response.data.doesFollow[0].follows)
        this.follow= response.data.doesFollow[0].follows
      },
  },
  computed:{

  },
  components:{
    MyNav,MyFooter
  }
}
</script>