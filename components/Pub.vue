<template>
    <div class="post ">
        <div class="content" >
            <small class="hand" @click="gotoProfile(post.id)" style="font-size:10px;">{{post.metadata.description}}-{{post.createdAt}}</small>
            <h3 class="hand" @click="gotoPost(post.id)">{{truncate(post.metadata.name,80)}}</h3>
            <p class="hand" @click="gotoPost(post.id)">{{removeTags(post.metadata.content)}}</p>
        </div>

        <div class="imgcolumn" >
         <img class="lazy" :src='getImage()'  />
        <small class="hand" v-if="isOwner" @click="hide()">Hide</small>
        </div>
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
        
    },
    methods:{
        async hide(){
            await this.$util.hidePublication(this.post.id);
            alert('done')
        },
        getImage(){
            let media=this.post.metadata.media
            if(media[0] && media[0].original && media[0].original.mimeType.includes('image'))return media[0].original.url
            else return "https://pbs.twimg.com/profile_images/1490782523701481474/DtyJ_8ej_400x400.jpg"
        },
        truncate(str, n){
            return (str.length > n) ? str.substr(0, n-1) + '...' : str;
        },
        gotoProfile(post_id){
            //Post id contains 2 id's separated by a slash -
            //We will split and only get the first id, which is for the profile
            let id=post_id.split('-')[0]
            window.location.href='/profile/'+id
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
    } ,
    computed:{
        isOwner(){
            return(this.$route.path.includes('profile')) 
        },
    }
}
</script>
<style>

.hand{
    cursor: pointer
}



.post{
    text-align:left;
    max-width: 80%;
    margin: 0 auto;
    display: flex;  align-items: center;
    padding: 20px;
    vertical-align: middle !important;
    border-bottom: 1px solid #c2c9d6 ;
}

.post .content{
    width:70%;
}
.post .imgcolumn{
    width:30%;
    padding:20px;
}
.imgcolumn img{
    max-width:100%;
}
.post h3{
    font-weight: 700;
    margin:0px !important;
}
@media (max-width: 799px) {
    .post{
        padding: 0px;;
        
    }
     .post h3{
        font-size: 16px;
     }
    .post p,
    .post small{
        display: none;
    };
    
}
</style>