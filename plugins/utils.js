import Vue from 'vue'
import { createClient } from 'urql'
import { refresh } from '@/plugins/api'
import {  utils } from 'ethers'
import { LENS_HUB_CONTRACT_ADDRESS,baseMetadata,defaultProfile} from '@/plugins/api'
import LENS_ABI from '@/plugins/lens_abi'

export const APIURL = "https://api.lens.dev"
export const STORAGE_KEY = "LH_STORAGE_KEY"
export const basicClient = new createClient({url: APIURL})


export default ({ app,store,route }, inject) => {
    const wallet=store.state.wallet
    inject('util',{
      
      async checkMatic(){

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

        async  uploadToIPFS(content) {
            const metaData = {
              content: content,
              description:'new_post',
              name: `Post by @${profile.handle}`,
              external_url: `https://depost.xyz/profile/${profile.handle}`,
              metadata_id: uuid(),
              createdOn: new Date().toISOString(),
              ...baseMetadata
            }
            const added = await client.add(JSON.stringify(metaData))
            const uri = `https://ipfs.infura.io/ipfs/${added.path}`
            return uri
        },
        async  savePost() {
          if(!wallet)return alert('not wallet')
          const urqlClient = await this.createClient()
          const dd = await urqlClient.query(defaultProfile, {request:{ethereumAddress: wallet }}).toPromise()
          
          console.log('Pasa',wallet,dd)
          let profile=dd.data.defaultProfile
          console.log('Pasa',profile)
          const contentURI = await this.uploadToIPFS()
          const contract = new ethers.Contract(LENS_HUB_CONTRACT_ADDRESS,LENS_ABI, getSigner())
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
            const tx = await contract.post(postData)
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
        async fetchProfile(id) {
          try {
            const urqlClient = await this.createClient()
            const returnedProfile = await urqlClient.query(getProfiles, { id }).toPromise();
            const profileData = returnedProfile.data.profiles.items[0]
            profileData.color = generateRandomColor()
            const pubs = await urqlClient.query(getPublications, { id, limit: 50 }).toPromise()
            return {
              profile: profileData,
              publications: pubs.data.publications.items
            }
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