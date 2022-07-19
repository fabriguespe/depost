<template>
  <div class="container">
      <NavEditor/>
      <medium-editor v-model='content'  :options='options'  :onChange="onChange"  v-on:uploaded="uploadCallback" />
  </div>
</template>

<script>

import NavEditor from '@/components/NavEditor'
export default {
    data() {
        return {
            content: "",
            options: {
              toolbar: {
                  buttons: ["bold", "italic", "underline", "quote", "h1", "h2", "h3", 'pre', 'unorderedlist']
                }
            }
        }
    },
    methods: {
      onChange() {
        console.log(this.content)
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