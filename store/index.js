import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex);

const getDefaultState = () => {
  return{
    bundlrRef:null,
    wallet: null
  }
}
// initial state
const state = getDefaultState()


const createStore = () => {
  return new Vuex.Store({
    state,
    getters: {
      getProfile() {
        return state.wallet
      }
    },
    mutations :{
      setProfile(state,element) {
          state.wallet=element
      }
    },
    actions:{
      async fetchCounter(state) {
        const res = { data: 10 };
        state.counter = res.data;
        return res.data;
      }
    }
  })
}

export default createStore
