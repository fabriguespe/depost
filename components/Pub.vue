<template>
    <div class="post ">
        <div class="content" >
            <small class="hand" style="font-size:10px;">{{post.metadata.name}}-{{post.createdAt}}</small>
            <h3 class="hand" @click="gotoPost(post.id)">{{truncate(post.metadata.description,80)}}</h3>
            <p class="hand" @click="gotoPost(post.id)">{{removeTags(post.metadata.content)}}</p>
        </div>
        <img :src='getImage()'/>
    </div>
</template>


<script>
export default {
    props:['pub'],
    data() {
        return {
            post:this.pub,
            title:''
        }
    },
    mounted(){
        this.title = this.post.metadata.content.replace( /<\/?h1[^>]*>/g, '').split('<')[0];

        console.log(this.post)
    },
    methods:{
        getImage(){
            let media=this.post.metadata.media
            if(media[0] && media[0].original && media[0].original.mimeType.includes('image'))return media[0].original.url
            else return "https://pbs.twimg.com/profile_images/1490782523701481474/DtyJ_8ej_400x400.jpg"
        },
        truncate(str, n){
            return (str.length > n) ? str.substr(0, n-1) + '...' : str;
        },
        gotoPost(id){
        
            window.location.href='/post/'+id
        },
        removeTags(str) {
            if ((str===null) || (str===''))
                return false;
            else str = str.toString();
            
            str= str.replace( /(<([^>]+)>)/ig, ' ');
            str=this.truncate(str,250)
            return str
        }
    }
}
</script>
<style>
.post h3{
    font-weight: 700;
}
.post{
    text-align:left;
    max-width: 80%;
    margin: 0 auto;
    display: flex;
    padding: 20px;
    border-bottom: 1px solid #c2c9d6 ;
}
.post .content{
    width:70%;
}
.hand{
    cursor: pointer
}
.post img{
    max-width:10%;
    margin:0 auto;
    height: 50%;
}
</style>