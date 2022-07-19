<template>
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <a class="navbar-brand" href="/"><img width="50" src="https://docs.bundlr.network/img/logo.svg"/></a>
      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav mr-auto">
          <li class="nav-item active"> <router-link class="nav-link" to="/">Home</router-link></li>
          <li class="nav-item active"> <router-link class="nav-link" to="/explore">Explore</router-link></li>
        </ul>
        <div class="form-inline my-2 my-lg-0">
          <button v-if="!walladd" class="btn btn-outline-success my-2 my-sm-0" @click="write()">Write</button>
          <button v-if="!walladd" class="btn btn-outline-success my-2 my-sm-0" @click="signIn()">Login</button>
          <button v-else class="btn btn-outline-success my-2 my-sm-0" >{{walladd.slice(0,8)}}...</button>
        </div>
      </div>
    </nav>
</template>

<script>
import { getChallenge,authenticate} from '@/plugins/api'
import { providers } from 'ethers'

export default {
  props:['wallet'],
  data(){
    return{
      walladd:this.wallet
    }
  },
  methods:{
    
    async  signIn() {
      try {
        const accounts = await window.ethereum.send( "eth_requestAccounts" )
        const account = accounts.result[0]
        const urqlClient = await this.$util.createClient()
        const response = await urqlClient.query(getChallenge, {address: account }).toPromise()
        const provider = new providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner()
        const signature = await signer.signMessage(response.data.challenge.text)
        const authData = await urqlClient.mutation(authenticate, {address: account, signature}).toPromise()
        const { accessToken, refreshToken } = authData.data.authenticate
        const accessTokenData = this.$util.parseJwt(accessToken)

        localStorage.setItem(this.$util.STORAGE_KEY, JSON.stringify({
          accessToken, refreshToken, exp: accessTokenData.exp
        }))
        window.location.reload()
      } catch (err) {
        console.log('error: ', err)
      }
    }

  }
}
</script>
<style >
.nuxt-link-exact-active{
  font-weight: bold;
}
.loader {
  border: 16px solid #f3f3f3; /* Light grey */
  border-top: 16px solid #224F24; /* Blue */
  border-radius: 50%;
  width: 120px;
  height: 120px;
  margin:0 auto;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.navbar{
  margin-bottom: 40px;
}
</style>