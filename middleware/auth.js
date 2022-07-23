
import {  ethers} from 'ethers'

export default async function ({ store, redirect,app,route }) {
    app.$util.refreshAuthToken()
    const provider = new ethers.providers.Web3Provider((window).ethereum )
    const addresses = await provider.listAccounts();
    if (addresses.length) {
        store.state.wallet=addresses[0]
    } else {
        store.state.wallet=null
    }
}
