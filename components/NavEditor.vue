<template>
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <a class="navbar-brand" href="/"><img width="50" src="/logo.png"/></a>
      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav mr-auto">
          This draft is automagically saved while your write...
        </ul>
        <div class="form-inline my-2 my-lg-0">
          <!--<button class="btn btn-outline-secondary mr-2" @click="save()">
            <template v-if="loadingSave">...</template>
            <template v-else>Save</template>
          </button>-->
          <button class="btn btn-outline-success" @click="publish()">
            <template v-if="loadingPublish">...</template>
            <template v-else>Publish</template>
          </button>
        </div>
      </div>
    </nav>
</template>

<script>

export default {
  data(){
    return{
      loadingSave:false,
      loadingPublish:false,
      wallet:this.$store.state.wallet
    }
  },
  async mounted(){
    

      const accounts = await window.ethereum.request({ method: 'eth_accounts' })
      const account = accounts[0]
      this.wallet=account
      this.$store.state.wallet=account
      console.log(this.wallet)
      this.$root.$on('done', () => { this.done()})
  },
  methods:{
    async  done() {
      this.loadingPublish=false
      this.loadingSave=false
    },
    async  publish() {
      this.loadingPublish=!this.loadingPublish
      this.$root.$emit('publishDraft')
    },
    async  save() {
      this.loadingSave=!this.loadingSave
      this.$root.$emit('saveDraft')
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