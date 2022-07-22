<template>
  <body>
    <MyNav />
    <div class="container write ">
        <div v-if="draft">
          <img :src="image"/>
          <input type="file" @change="onChangeFile"  ref="file" accept="file_extension|audio/*|video/*|image/*|media_type">
          <input type="text"  v-model="title"   class="title" placeholder="The title goes here"/>
        </div>
        <medium-editor v-model='content' :prefill="draft.content"  :options='options'  :onChange="onChange"   />
    </div>
  </body>
</template>

<script>
import { create } from 'ipfs-http-client'
const ipfs_client = create('https://ipfs.infura.io:5001/api/v0')

import MyNav from '@/components/NavEditor'
export default {
    data() {
        return {
            title:'',
            image:'',
            content:'',
            draft:localStorage.getItem('draft')?JSON.parse(localStorage.getItem('draft')):{content:'',title:'',image:''},
            options: {
              toolbar: {
                  buttons: ["bold", "italic", "underline", "quote", "h1", "h2", "h3", 'pre', 'unorderedlist']
              }
            }
        }
    },
    async mounted(){

      await this.$util.checkMatic()
      if(localStorage.getItem('draft')){
        console.log(localStorage.getItem('draft'))
        this.draft=JSON.parse(localStorage.getItem('draft'))
        this.content=this.draft.content
        this.title=this.draft.title
      }
      this.$root.$on('publishDraft', () => { this.publishDraft() })
    }, 
    methods: {
      
      async publishDraft(){
        await this.$util.savePost(this.content,this.title,this.image)
        this.$root.$emit('done')
      },
      onChangeFile() {
        let imgFile = this.$refs.file.files[0];
        if(imgFile)this.image = URL.createObjectURL(imgFile);
        this.onChange()

      },
      onChange() {
        localStorage.setItem('draft',JSON.stringify({content:this.content,title:this.title,image:this.image}))

      },
      uploadCallback(url) {

        console.log("uploaded url", url)
      }
    },
    watch:{
      title(){
        this.onChange()
      }

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
.write img{
  max-width: 50%;;
  display:block;
}
.title{
  display: block;;
  font-size: 45px;;
  border: 0px;;
  width:100%;
}
.medium-editor-container .medium-editor-element:empty, .medium-editor-container .medium-editor-placeholder,
.medium-editor-container .editor.has-content,
.medium-editor-container p, .medium-editor-container h1, .medium-editor-container h2, .medium-editor-container h3, .medium-editor-container h4, .medium-editor-container h5, .medium-editor-container h6, .medium-editor-container ul, .medium-editor-container ol, .medium-editor-container pre, .medium-editor-container blockquote{
  max-width: 100%;;
}
</style>