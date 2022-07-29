<template>
  <body>
    <MyNav />
    <div  class="container text-center">
      <h5> Chat with friends</h5>
      <p>This chat is for chatting with people you follow and they follow you back</p>
      <div v-if="loading" class="loader"></div>
      <chat-window v-else-if="profile" 
      :current-user-id="wallet" 
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


import {  getFollowers,getFollowing } from '@/plugins/lens_api'
import MyNav from '@/components/Nav'
import MyFooter from '@/components/Footer'

export default {
  middleware: 'auth',
  data() {
        return {
          xmtp:null,
          loading:false,
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
      this.loading=true
      this.profile=await this.$util.getProfile()
      this.xmtp=await this.$util.getXMTP()
      await this.initRooms()
      this.messageListener()
      this.loading=false
    }catch(e){
      console.log(e)
    }
  },
  methods:{
   
    async sendMessage(msg){
      msg={  _id: Math.random(10000),senderId: this.wallet,...msg  }

      this.messages.push(msg)
      for (const conversation of await this.xmtp.conversations.list()) {
        if(conversation.peerAddress==msg.roomId){
          //console.log(conversation)
          //Push messages sent and sends it to the xmtp protocol
          await conversation.send(msg.content)
        }
      }
      
    },
    async getContacts(){
      const contacts=[]
      //Gets array of contacts (people you follow and they follow you back)
      this.followers= await this.getFollowers(this.profile.id)
      this.following= await this.getFollowing()
      for(let fri in this.followers){
        let follower=this.followers[fri].wallet.defaultProfile
        if(!follower)follower={ownedBy:this.followers[fri].wallet.address}
        for(let fdi in this.following){
          let followed=this.following[fdi].profile
          if(followed.ownedBy==follower.ownedBy)contacts.push(follower)
        }
      } 
      return contacts
    },
    async initRooms(){
      const rooms = []

      this.contacts= await this.getContacts()

      try{
        for (let i in this.contacts){
          let me={_id: this.wallet,username: this.profile.handle,avatar: this.profile.picture?this.profile.picture.original.url:null,status: { state: 'online', } }

          //Him
          let contact=this.contacts[i]
          let contact_id=contact.ownedBy
          let contact_img=contact.picture?contact.picture.original.url:''
          let contact_name=contact.name?contact.name:contact.ownedBy
          let him={_id: contact_id,  username: contact_name,avatar:contact_img ,status: { state: 'online'}}
          //console.log(me,him)
            
          if(await this.xmtp.getUserContact(contact_id)){
            //Creates a room and a conversation for every contact that exists in XMTP.
            //By existing i mean that sign an xmtp message at least once
            //console.log('New room',contact_id)
            rooms.push({roomId: contact_id, roomName: contact_name,users: [me,him] })
            const conversation=await this.xmtp.conversations.newConversation( contact_id)
            const messages = await conversation.messages()
            for(let i in messages){
              let message=messages[i]
              if(!message.content)continue
              this.messages.push({  _id: Math.random(10000),content:message.content,senderId: message.senderAddress,disableReactions: true  })
            }
           
          }
        }

        this.rooms = rooms
        this.rooms_loaded=true

      }catch(e){
        console.log(e)
      }
       
    },
    isInContacts(wallet){
      for(let i in this.contacts){
        let cont=this.contacts[i]
        if(wallet==cont.ownedBy)return true
      }
      return false
    },

    async messageListener(){
      for(let i in this.contacts){
        const conversation = await this.xmtp.conversations.newConversation( this.contacts[i].ownedBy)
        for await (const message of await conversation.streamMessages()) {
          if(!message.content)continue
          if(message.senderAddress!=this.wallet)this.messages.push({  _id: Math.random(10000),content:message.content,senderId: message.senderAddress ,disableReactions: true  })
        }
      } 
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
  watch:{
    messages(val){
      let jeje=val.slice(val.length-8,val.length)
      console.log(jeje)
    }
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