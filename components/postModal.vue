<template>
  <div class="modal-overlay">
    <div v-if="loading>0" class="modals">
      <div class="loader"></div>
      <span v-if="loading==1">Uplading to the permaweb...</span>
      <span v-else-if="loading==2">Updating profile image</span>
    </div>
    
    <div v-else-if="!uri" class="modals">
        <div class="close" @click="$emit('close-modal')">X </div>
        <h6>Upload image!</h6>
        <input type="file"  @change="onFileChange" accept="image/png, image/gif, image/jpeg" />
        <button v-if="!uri" @click="uploadFile">Post</button>
    </div>
    <div v-else>
        <div class="close" @click="$emit('close-modal')">X</div>
        <h6>Upload image!</h6>
        <input type="file"  @change="onFileChange" accept="image/png, image/gif, image/jpeg" />
        <button v-if="!uri" @click="uploadFile">Post</button>
    </div>
  </div>
</template>
<script>

import { WebBundlr } from "@bundlr-network/client"
import {  ethers,providers } from 'ethers'
import LENS_ABI from '@/plugins/lens_abi'
import { LENS_HUB_CONTRACT_ADDRESS,defaultProfile} from '@/plugins/api'

export default {
    data() {
      return {
        loading:0,
        image:null,
        uri:null,
        image:null,
        bundlrRef:null,
        wallet:this.$store.state.wallet
      }
    },
    methods:{
        async initialiseBundlr(provider) {
          
          const bundlr = new WebBundlr("https://node1.bundlr.network", "matic", provider)
          await bundlr.ready()
          
          this.bundlrRef = bundlr
          this.bundlrRef.current = bundlr
          this.$store.state.bundlrRef = bundlr
          this.$store.state.bundlrRef.current = bundlr  
        },

        async  setProfilePhoto(uri,provider) {
          let dis=this
          const urqlClient = await this.$util.createClient()
          const dd = await urqlClient.query(defaultProfile, {request:{ethereumAddress: dis.wallet }}).toPromise()
          let profile=dd.data.defaultProfile

          const contract = new ethers.Contract( LENS_HUB_CONTRACT_ADDRESS, ABI,provider.getSigner() )
          try {
            const tx = await contract.setProfileImageURI(profile.id, uri)
            await tx.wait()
          } catch (err) {
            console.log('error: ', err)
          }
        },

        onFileChange(e) {
            let dis=this
            const file = e.target.files[0]
            if (file) {
                const image = URL.createObjectURL(file)
                this.image=image
                let reader = new FileReader()
                reader.onload = function () {if (reader.result) dis.file=Buffer.from(reader.result)}
                reader.readAsArrayBuffer(file)
            }
        },

        async uploadFile() {   
          try{

            //Init bundlr
            const provider = new providers.Web3Provider(window.ethereum);
            await provider._ready()

            await this.initialiseBundlr(provider)
            this.loading=1
            

            //Upload image
            let tx = await this.bundlrRef.uploader.upload(this.file, [{ name: "Content-Type", value: "image/png" }])
            console.log('tx: ', tx)
            this.uri=`http://arweave.net/${tx.data.id}`

            this.loading=2
             
            //Update lens profile
            await this.setProfilePhoto(this.uri,provider)

            this.loading=0
            if(!alert('Success!')){window.location.reload();}

          } catch(e){
            console.log(e)
          }
        },
        
  }
}
</script>

<style scoped>

.modal-overlay {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  background-color: #000000da;
}

.modals {
  text-align: center;
  background-color: white;
  height: 500px;
  width: 500px;
  margin: 10%;
  padding: 20px;
  border-radius: 20px;
}
.close {
margin:0px;
  cursor: pointer;
}

.check {
  width: 150px;
}

h6 {
  font-weight: 500;
  font-size: 28px;
  margin: 20px 0;
}

p {
  font-size: 16px;
  margin: 20px 0;
}

button {
  width: 150px;
  height: 40px;
  font-size: 14px;
  border-radius: 16px;
  margin-top: 50px;
}
</style>