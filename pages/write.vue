<template>
  <div class="container">
      <NavEditor/>
      <medium-editor v-model='content' :prefill="prefill"  :options='options'  :onChange="onChange"  v-on:uploaded="uploadCallback" />
  </div>
</template>

<script>

import NavEditor from '@/components/NavEditor'
export default {
    data() {
        return {
            content:'',
            prefill:localStorage.getItem('draft'),
            options: {
              contentDefault:'sds',
              toolbar: {
                  buttons: ["bold", "italic", "underline", "quote", "h1", "h2", "h3", 'pre', 'unorderedlist']
                }
            }
        }
    },
    mounted(){
      this.$root.$on('publishDraft', () => { this.publishDraft() })
    }, 
    methods: {
      async publishDraft(){
        await this.$util.savePost(this.content)
        this.$root.$emit('done')
      },
      onChange() {
        //console.log(this.content)
        localStorage.setItem('draft',this.content)
      },
      uploadCallback(url) {
        console.log("uploaded url", url)
      }
    },
    components:{
      NavEditor
    }
}
</script>
<style >
.medium-editor-container *{
max-width:100%;
}
</style>