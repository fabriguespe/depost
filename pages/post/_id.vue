<template>
  <body>
    <MyNav />
    <div v-if="post && post.metadata" class="container write ">
        <div >
          <small class="hand" @click="gotoProfile(post.id)" style="font-size:10px;">{{post.metadata.description}}-{{post.createdAt}}</small><br>
          <img  :src="getImage()"/>
          <h1 class="title">{{post.metadata.name}}</h1>
        </div>
        <div v-html="post.metadata.content"></div>
    </div>
  </body>
</template>

<script>

import {  getPublication } from '@/plugins/lens_api'
import MyNav from '@/components/Nav'
export default {
    data() {
        return {
            post:'',
            loading:false
        }
    },
    async mounted(){
      await this.$util.checkMatic()
      this.loading=true
      //Let's find the publication using a query and the ID we get from the url.
      let id=this.$route.params.id
      const urqlClient = await this.$util.createClient()
      const pub = await urqlClient.query(getPublication, { id: id.toString()  }).toPromise()
      this.post=pub.data.publication
      this.loading=false
    }, 
    methods: {
        gotoProfile(post_id){
            //Post id contains 2 id's separated by a slash -
            //We will split and only get the first id, which is for the profile
            let id=post_id.split('-')[0]
            window.location.href='/profile/'+id
        },
        getImage(){
            let media=this.post.metadata.media
            if(media[0] && media[0].original && media[0].original.mimeType.includes('image'))return media[0].original.url
            else return ""
        },
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