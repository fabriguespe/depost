
import { v4 as uuid } from 'uuid'
import { createClient } from 'urql'
import { refresh } from '@/plugins/lens_api'
import {  utils,ethers} from 'ethers'
import { LENS_HUB_CONTRACT_ADDRESS,baseMetadata,defaultProfile,baseSources,getPublications,getProfile,getProfileByHandle} from '@/plugins/lens_api'
import LENS_ABI from '@/plugins/lens_abi'

export const APIURL = "https://api.lens.dev"
export const STORAGE_KEY = "LH_STORAGE_KEY"
import { create } from 'ipfs-http-client'
const ipfs_client = create('https://ipfs.infura.io:5001/api/v0')
export const basicClient = new createClient({url: APIURL})


export default ({ app,store,route }, inject) => {
    inject('util',{
      
      async getHash(image) {
    
        try {
            const uploadResult = await ipfs_client.add(image)
            let uri=`https://ipfs.io/ipfs/${uploadResult.path}`
            console.log(uri)
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

        async  uploadToIPFS(profile,content,title,image) {
          const metaData = {
              content: content,
              description:title,
              name: `Post by @${profile.handle}`,
              external_url: `https://depost.xyz/profile/${profile.handle}`,
              metadata_id: uuid(),
              media: [await this.getHash(image)],
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
        async  savePost(content,title,image) {
          let wallet=store.state.wallet
          if(!wallet)return alert('not wallet')
          const urqlClient = await this.createClient()
          const dd = await urqlClient.query(defaultProfile, {request:{ethereumAddress: wallet }}).toPromise()
          let profile=dd.data.defaultProfile

          const contentURI = await this.uploadToIPFS(profile,content,title,image)
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
            console.log(postData)
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

            if (!authData.data) return

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
        async getProfileByHandle(input,wallet) {
          try {
            input=input.toString()
            const urqlClient = await this.createClient()
            let query=input.includes('lens')?getProfileByHandle:input.includes('0x')?getProfile:input=='default'?defaultProfile:''
            let params=input.includes('lens')?{handle: input }:input.includes('0x')?{id: input }:input=='default'?{request:{ethereumAddress: store.state.wallet}}:{}
    
            let dd = await urqlClient.query(query,params).toPromise()
            let profile=dd.data.defaultProfile?dd.data.defaultProfile:dd.data.profile
            const pub = await urqlClient.query(getPublications, { id: profile.id ,sources:baseSources}).toPromise()
            let pubs=pub.data.publications.items
            return {publications:pubs,profile:profile}
          } catch (err) {
            console.log('error fetching profile...', err)
          }
        },
        async createClient() {
          const storageData = JSON.parse(localStorage.getItem(STORAGE_KEY))
          if (storageData) {
            try {
              const { accessToken } = await this.refreshAuthToken()
              const urqlClient = new createUrqlClient({
                url: APIURL,
                fetchOptions: {
                  headers: {
                    'x-access-token': `Bearer ${accessToken}`
                  },
                },
              })
              return urqlClient
            } catch (err) {
              return basicClient
            }
          } else {
            return basicClient
          }
      },
    })
}