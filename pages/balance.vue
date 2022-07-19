<template>
  <div class="container text-center">
    <MyNav :key="wallet" :wallet="wallet"/>
    <div>
      <h4 style="margin-top:20px;text-aling:center">Your balance</h4>
      <h3>{{balance}}</h3>
      <div>
          <input  v-model="amount" />
          <button @click="fundWallet">Fund Wallet</button>
      </div>
    </div>
  </div>
</template>


<script>
import { WebBundlr } from "@bundlr-network/client"
import BigNumber from 'bignumber.js'
import { providers, utils,ethers } from 'ethers'
import MyNav from '@/components/Nav'

export default {
  data() {
        return {
          wallet:this.$store.state.wallet,
          amount:0,
          bundlrRef:this.$store.state.bundlrRef,
          balance:0
        }
  },
  async mounted(){
  
    const accounts = await window.ethereum.request({ method: 'eth_accounts' })
    const account = accounts[0]
    this.wallet=account
    this.$store.state.wallet=account
    await this.$util.checkMatic()

    this.fetchBalance()
  },
  methods:{

    parseInput (input) {
      const conv = new BigNumber(input).multipliedBy(this.bundlrRef.currencyConfig.base[1])
      if (conv.isLessThan(1)) {
        console.log('error: value too small')
        return
      } else {
        return conv
      }
    },
    
    async fetchBalance() {
       
      const provider = new providers.Web3Provider(window.ethereum);
      await provider._ready()
    
      const bundlr = new WebBundlr("https://node1.bundlr.network", "matic", provider)
      await bundlr.ready()
      
      this.bundlrRef = bundlr
      this.bundlrRef.current = bundlr
      this.$store.state.bundlrRef = bundlr
      this.$store.state.bundlrRef.current = bundlr  
      const bal = await this.bundlrRef.current.getLoadedBalance()
      console.log('bal: ', utils.formatEther(bal.toString()))
      this.balance=utils.formatEther(bal.toString())
    },
    async  fundWallet() {
      try{

        if (!this.amount) return
        let response = await this.bundlrRef.fund(this.parseInput(this.amount))
        console.log('Wallet funded: ', response)
        fetchBalance()
      }catch(e){
        console.log(e)
      }
    },

  },
  components:{
    MyNav
  }
}
</script>