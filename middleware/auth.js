
import {  ethers} from 'ethers'

export default async function ({ store, redirect,app,route }) {
    try{
        store.commit('initialiseStore');
        app.$util.refreshAuthToken()
        const provider = new ethers.providers.Web3Provider((window).ethereum )
        const addresses = await provider.listAccounts();
        if (addresses.length) {
            store.state.wallet=addresses[0]
        } else {
            store.state.wallet=null
        }
    }catch(e){
        console.log(e)
    }
    
}

