
import { v4 as uuid } from 'uuid'
import { createClient } from 'urql'
import { refresh } from '@/plugins/lens_api'
import {  utils,ethers} from 'ethers'
import { 
LENS_HUB_CONTRACT_ADDRESS
,baseMetadata
,authenticate
,defaultProfile
,baseSources
,getPublications
,getProfile
,getProfileByHandle
,getChallenge} 
from '@/plugins/lens_api'

import LENS_ABI from '@/plugins/lens_abi'

export const APIURL = "https://api.lens.dev"
export const STORAGE_KEY = "LH_STORAGE_KEY"
import { create } from 'ipfs-http-client'
import { hidePublication } from './lens_api'
const ipfs_client = create('https://ipfs.infura.io:5001/api/v0')
export const basicClient = new createClient({url: APIURL})


export default ({ app,store,route }, inject) => {
    inject('util',{
      
      async getHash(file) {
    
        try {
            const uploadResult = await ipfs_client.add(file)
            let uri=`https://ipfs.io/ipfs/${uploadResult.path}`
         
            return uri
        } catch(e) {
            console.log(e)
            return
        }
      },
      async checkMatic(){

        const accounts = await window.ethereum.request({ method: 'eth_accounts' })
        const account = accounts[0]
        store.state.wallet=account
        

        const chainId = 137 // Polygon Mainnet
        if (window.ethereum.networkVersion !== chainId) {
              try {
                await window.ethereum.request({ method: 'wallet_switchEthereumChain',params: [{ chainId: utils.hexlify(chainId) }]});
              } catch (err) {
                console.log(err)
                if (err.code === 4902) {
                  await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [
                      {
                        chainName: 'Polygon Mainnet',
                        chainId: utils.hexlify(chainId),
                        nativeCurrency: { name: 'MATIC', decimals: 18, symbol: 'MATIC' },
                        rpcUrls: ['https://polygon-rpc.com/']
                      }
                    ]
                  });
                }
              }
        }
      },
      parseJwt (token) {
          var base64Url = token.split('.')[1];
          var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
        
          return JSON.parse(jsonPayload);
        },

        async  uploadToIPFS(handle,content,title,file) {
          const metaData = {
              content: content,
              name:title,
              description: `Post by @${handle}`,
              metadata_id: uuid(),
              media: [{item:await this.getHash(file),type:'image/png'}],
              createdOn: new Date().toISOString(),
              ...baseMetadata
          }
          const added = await ipfs_client.add(JSON.stringify(metaData))
          const uri = `https://ipfs.infura.io/ipfs/${added.path}`
          return uri
        },
        getSigner() {
          const provider = new ethers.providers.Web3Provider(window.ethereum)
          return provider.getSigner();
        },
        async  savePost(content,title,file) {
          let wallet=store.state.wallet
          if(!wallet)return alert('not wallet')
          const urqlClient = await this.createClient()
          const dd = await urqlClient.query(defaultProfile, {request:{ethereumAddress: wallet }}).toPromise()
          let profile=dd.data.defaultProfile

          const contentURI = await this.uploadToIPFS(profile.handle,content,title,file)
          const contract = new ethers.Contract(LENS_HUB_CONTRACT_ADDRESS,LENS_ABI, this.getSigner())
          try {
            const postData = {
              profileId: profile.id,
              contentURI,
              collectModule: '0x23b9467334bEb345aAa6fd1545538F3d54436e96',
              collectModuleInitData: ethers.utils.defaultAbiCoder.encode(['bool'], [true]),
              referenceModule: '0x0000000000000000000000000000000000000000',
              referenceModuleInitData: []
            }
            localStorage.removeItem('draft')
            const tx = await contract.post(postData)
            window.location='/'
            await tx.wait()
            
          } catch (err) {
            console.log('error: ', err)
          }
        },
        async refreshAuthToken() {
          const token = JSON.parse(localStorage.getItem(STORAGE_KEY))
          if (!token) return
          try {
            const authData = await basicClient.mutation(refresh, {refreshToken: token.refreshToken}).toPromise()
       
            if (!authData.data)return

            const { accessToken, refreshToken } = authData.data.refresh
            const exp = this.parseJwt(refreshToken).exp

            localStorage.setItem(STORAGE_KEY, JSON.stringify({ accessToken, refreshToken, exp }))

            return {
              accessToken
            }
          } catch (err) {
            console.log('error:', err)
          }
        },
        async hidePublication(post_id){
          const urqlClient = await this.createClient()
          await urqlClient.mutation(hidePublication, { id: post_id}).toPromise()
          window.location.reload()
        },
        async  signIn(reload=false) {
          try {
            //We force metamask to switch to MATIC network   
            await this.checkMatic()
            const accounts = await window.ethereum.send( "eth_requestAccounts" )
            //We get the wallet address
            const account = accounts.result[0]
            const urqlClient = await this.createClient()
            //We request a refresh token from Lens
            const response = await urqlClient.query(getChallenge, {address: account }).toPromise()
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner()
            const signature = await signer.signMessage(response.data.challenge.text)
            const authData = await urqlClient.mutation(authenticate, {address: account, signature}).toPromise()
            const { accessToken, refreshToken } = authData.data.authenticate
            const accessTokenData = this.parseJwt(accessToken)

            //We saved the tokens in local memory for later use
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify({accessToken, refreshToken, exp: accessTokenData.exp}))

            if(reload)window.location.reload()
          } catch (err) {
            console.log('error: ', err)
          }
        },
        async isLogged(){

          const accounts = await window.ethereum.send( "eth_requestAccounts" )
          const account = accounts.result[0]
          return account
        },
        async getPublicationsByHandle(profile_id) {
          try {
            const urqlClient = await this.createClient()
            const pub = await urqlClient.query(getPublications, { id: profile_id ,sources:baseSources}).toPromise()
            let pubs=pub.data.publications.items
            return pubs
          } catch (err) {
            console.log('error fetching profile...', err)
          }
        },
        async getProfileByHandle(input='default') {
          try {
            //Let's make sure if a string in case we input and Hex.
            input=input.toString()
            const urqlClient = await this.createClient()
            //If Id is fabri.lens uses getProfileByHandle
            //If Id is in Hex format uses getProfile from the docs
            //If Id is 'default' uses defaultProfile from the docs
            let query=input.includes('lens')?getProfileByHandle:input.includes('0x')?getProfile:input=='default'?defaultProfile:''
            let params=input.includes('lens')?{handle: input }:input.includes('0x')?{id: input }:input=='default'?{request:{ethereumAddress: store.state.wallet}}:{}
            let dd = await urqlClient.query(query,params).toPromise()
            if(!dd.data)return {publications:null,profile:null}
            let profile=dd.data.defaultProfile?dd.data.defaultProfile:dd.data.profile?dd.data.profile:null
            return profile
          } catch (err) {
            console.log('error fetching profile...', err)
          }
        },
        async createClient() {
          const storageData = JSON.parse(localStorage.getItem(STORAGE_KEY))
          if (storageData) {
            try {
              const { accessToken } = await this.refreshAuthToken()
              const urqlClient = new createClient({
                url: APIURL,
                fetchOptions: {headers: {'x-access-token': `Bearer ${accessToken}`}},
              })
              return urqlClient
            } catch (err) {
              console.log(err)
              return basicClient
            }
          } else {
            return basicClient
          }
      },
    })
}