<template>
     <div>
        {{pub.publication.metadata.content}}
        <b style="display:block;margin-top:40px;">{{pub.id}}-{{pub.name}}</b>
        <p>{{pub.content}}</p>
        <img v-if="post.media && post.media[0] && post.media[0].original && post.media[0].original.mimeType.includes('image')" style='display:block;max-width:300px;margin:0 auto;' :src='post.media[0].original.url'/>
    </div>
</template>


<script>
export default {
    props:['pub'],
    data() {
        return {
            post:this.pub
        }
    }
}

</script>