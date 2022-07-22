<template>
<nav class="navbar navbar-expand-lg navbar-light">
      <div class="container">
        <a class="navbar-brand" href="/">🌿</a>
        <div class="collapse navbar-collapse" id="navbarSupportedContent">
          <ul class="navbar-nav mr-auto">
            This draft is automagically saved while your write...
          </ul>
          <div class="form-inline my-2 my-lg-0">
            <!--<button class="btn btn-outline-secondary mr-2" @click="save()">
              <template v-if="loadingSave">...</template>
              <template v-else>Save</template>
            </button>-->
            <button class="btn btn-outline-secondary " style="margin-right:10px;" @click="deletedr">
              <template >Delete</template>
            </button>
            <button class="btn btn-outline-success" @click="publish()">
              <template v-if="loadingPublish">...</template>
              <template v-else>Publish</template>
            </button>
        </div>
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
      this.$root.$on('done', () => { this.done()})
  },
  methods:{
    deletedr(){
      localStorage.removeItem('draft')
      window.location.reload()
    },
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