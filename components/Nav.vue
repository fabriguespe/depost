<template>
<nav class="navbar navbar-expand-lg navbar-light">
      <div class="container">
      <a class="navbar-brand" href="/">🌿</a>
      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav mr-auto">
          <li class="nav-item active"> <router-link class="nav-link" to="/">Feed</router-link></li>
          <li class="nav-item active"> <router-link class="nav-link" to="/search">Search</router-link></li>
        </ul>
        <div class="form-inline my-2 my-lg-0">
          <button class="btn btn-outline-success " style="margin-right:20px;" @click="write()">✍🏻</button>
          <button v-if="!wallet" class="btn btn-outline-secondary" @click="$util.signIn(false)">Login</button>
          <button v-else class="btn btn-outline-secondary" @click="gotoProfile()" >{{wallet.slice(0,8)}}...</button>
        </div>
      </div>
      </div>
    </nav>
</template>

<script>
export default {
  data(){
    return{
        wallet:this.$store.state.wallet
    }
  },
  async mounted(){


  },
  methods:{
    gotoProfile(){
      window.location='/profile/default'
    },
    write(){
      window.location='/write'
    }

  }
}
</script>
<style >
.navbar{
  margin-bottom: 40px;
}
.navbar::after{
  margin-bottom: 40px;
      height: 4px;
    position: absolute;
    top: 100%;
    right: 0px;
    left: 0px;
    background: linear-gradient(rgba(9, 30, 66, 0.13) 0px, rgba(9, 30, 66, 0.13) 1px, rgba(9, 30, 66, 0.08) 1px, rgba(9, 30, 66, 0) 4px);
    content: "";
}
.bg-light{
  background-color: white !important;
}
.nuxt-link-exact-active{
  font-weight: bold;
}
.loader {
  border: 16px solid #f3f3f3; /* Light grey */
  border-top: 16px solid #224F24; /* Blue */
  border-radius: 50%;
  width: 120px;
  height: 120px;
  margin:0 auto;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

</style>