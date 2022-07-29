import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex);


const createStore = () => {
  let store= new Vuex.Store({
    state:{
      wallet: null,
      profile: null,
      signer: null,
      xmtp: null
    },
    mutations: {
      initialiseStore(state) {
        if(localStorage.getItem('store')) {
          // Replace the state object with the stored item
          this.replaceState(Object.assign(state, JSON.parse(localStorage.getItem('store'))) );
        }
      }
    },
    getters: {}
  })

  store.subscribe((mutation, state) => {
    localStorage.setItem('store', JSON.stringify(state));
  });
  return store
}

export default createStore
