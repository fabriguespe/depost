<template>
  <body>
    <MyNav />
    <div class="container text-center">
      <h5> Chat with friends</h5>
      <p>This chat is for chatting with people you follow and they follow you back</p>
      <chat-window v-if="profile" 
      :current-user-id="profile.id" 
      :rooms="rooms" 
      
      :rooms-loaded="rooms_loaded" 
      :messages-loaded="rooms_loaded" 
      :messages="messages"
      
      @message-actions="messageActions"
      :show-emojis="false"
      :show-files="false"
      :show-audio="false"
      :show-add-room="false"
      @send-message="sendMessage($event)"

      
      />
      </div>
    <MyFooter/>
  </body>
</template>


<script>
import ChatWindow from 'vue-advanced-chat'
  import 'vue-advanced-chat/dist/vue-advanced-chat.css'

import { Client } from '@xmtp/xmtp-js'

import {  getFollowers,getFollowing } from '@/plugins/lens_api'
import MyNav from '@/components/Nav'
import MyFooter from '@/components/Footer'

export default {
  middleware: 'auth',
  data() {
        return {
          rooms_loaded:false,
          rooms: [],
          messageActions:[
            {
              name: 'replyMessage',
              title: 'Reply'
            },
            {
              name: 'editMessage',
              title: 'Edit Message',
              onlyMe: true
            },
            {
              name: 'deleteMessage',
              title: 'Delete Message',
              onlyMe: true
            },
            {
              name: 'selectMessages',
              title: 'Select'
            }
          ],
          menu_actions:[
            {
              name: 'inviteUser',
              title: 'Invite User'
            },
            {
              name: 'removeUser',
              title: 'Remove User'
            },
            {
              name: 'deleteRoom',
              title: 'Delete Room'
            }
          ],
          messages: [],
          followers:null,
          following:null,
          profile:null,
          contacts:[],
          wallet:this.$store.state.wallet,
          
        }
  },
  async mounted(){
    try{
      this.profile=await this.$util.getProfileByHandle()
      await this.getContacts()
      this.initRooms()
      this.initMessages()
      
    }catch(e){
      console.log(e)
    }
  },
  methods:{
   
    sendMessage(msg){
      const newm={  _id: Math.random(10000),content:msg.content,senderId: this.profile.id  } ;
      this.messages.push(newm)
    },
    async getContacts(){

       this.followers= await this.getFollowers(this.profile.id)
       this.following= await this.getFollowing()
       for(let fri in this.followers){
        let follower=this.followers[fri].wallet.defaultProfile
        if(!follower)follower={ownedBy:this.followers[fri].wallet.address}
        for(let fdi in this.following){
          let followed=this.following[fdi].profile
          if(followed.ownedBy==follower.ownedBy)this.contacts.push(follower)
        }
       } 
    },
    async initRooms(){
      const rooms = []
      for (let i in this.contacts){
        let me={_id: this.profile.id,username: this.profile.name,avatar: this.profile.picture.original.url,status: { state: 'online', } }

        //Him
        let contact=this.contacts[i]
        let contact_id=contact.id?contact.id:contact.ownedBy
        let contact_img=contact.picture?contact.picture.original.url:''
        let contact_name=contact.name?contact.name:contact.ownedBy
        let him={_id: contact_id,  username: contact_name,avatar:contact_img ,status: { state: 'online'}}
        rooms.push({roomId: contact_id, roomName: contact_name,users: [me,him] })

      }
      this.rooms = rooms
      this.rooms_loaded=true
       
    },
    isInContacts(wallet){
      for(let i in this.contacts){
        let cont=this.contacts[i]
        if(wallet==cont.ownedBy)return true
      }
      return false
    },
    async initMessages(){
      try{
        const xmtp = await Client.create(this.$util.getSigner())
        for (const conversation of await xmtp.conversations.list()) {
          if(!this.isInContacts(conversation.client.address))continue
          for await (const message of await conversation.streamMessages()) {
              if (message.senderAddress === xmtp.address) {
                console.log(message)
                continue
              }
              console.log(`New message from ${message.senderAddress}: ${message.text}`)
            }
          }

      }catch(e){
        console.log(e)
      }
      /*
      const xmtp = await Client.create(this.$util.getSigner())
      for(let i in this.contacts){
        console.log(this.contacts[i].ownedBy)
        const conversation = await xmtp.conversations.newConversation( this.contacts[i].ownedBy)
        const messages = await conversation.messages()
        for await (const message of await conversation.streamMessages()) {
          if(!message.content)continue
          console.log(message)
          console.log(`[${message.senderAddress}]: ${message.content}`)
          const newm={  _id: Math.random(10000),content:msg.content,senderId: this.profile.id  } ;
          this.messages.push(newm)
        }
      }*/
      
        
    } ,
    async getChatUser(){

    },
    async getFollowing() {
      try {
        const urqlClient = await this.$util.createClient()
        const response = await urqlClient.query(getFollowing,{request: {  address:this.wallet}}).toPromise()
    
        return response.data.following.items
      } catch (err) {
        console.log('error fetching recommended profiles: ', err)
      }
    },
    async getFollowers(profile_id) {
      try {
        const urqlClient = await this.$util.createClient()
        const response = await urqlClient.query(getFollowers,{request: {  profileId: profile_id}}).toPromise()
    
        return response.data.followers.items
      } catch (err) {
        console.log('error fetching recommended profiles: ', err)
      }
    },
  },
  components:{
    MyNav,MyFooter,ChatWindow
  }
}
</script>
<style >

h4{
  margin-bottom: 40px;
}
</style>