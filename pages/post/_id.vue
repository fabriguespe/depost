<template>
  <div class="container">
      <Nav/>
      <div v-html="content"></div>
  </div>
</template>

<script>

import {  getPublication } from '@/plugins/lens_api'
import Nav from '@/components/Nav'
export default {
    data() {
        return {
            content:'',
            loading:false
        }
    },
    async mounted(){
        this.loading=true
        const urqlClient = await this.$util.createClient()
        let id=this.$route.params.id
        const pub = await urqlClient.query(getPublication, { id: id.toString()  }).toPromise()
        this.content=pub.data.publication.metadata.content
        this.loading=false
    }, 
    methods: {
    },
    components:{
      Nav
    }
}
</script>
<style >
.medium-editor-container *{
max-width:100%;
}
</style>