<template>
  <body>
    <MyNav />
    <div class="container write ">
        <div >
          <img v-if="image" :src="image"/>
          <h1 class="title">{{title}}</h1>
        </div>
        <div v-html="content"></div>
    </div>
  </body>
</template>

<script>

import {  getPublication } from '@/plugins/lens_api'
import MyNav from '@/components/Nav'
export default {
    data() {
        return {
            content:'',
            title:'',
            image:'',
            loading:false
        }
    },
    async mounted(){
        this.loading=true
        let id=this.$route.params.id
        const urqlClient = await this.$util.createClient()
        const pub = await urqlClient.query(getPublication, { id: id.toString()  }).toPromise()
    
        this.content=pub.data.publication.metadata.content
        this.title=pub.data.publication.metadata.description
        this.image=pub.data.publication.metadata.media[0]
        this.loading=false
    }, 
    methods: {
    },
    components:{
      MyNav
    }
}
</script>
<style >
.medium-editor-container *{
max-width:100%;
}

</style>