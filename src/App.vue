<template>
  <v-app>
    <v-navigation-drawer temporary v-model="drawer">
      <v-list>
        <v-list-tile v-if="isAuthen" @click="onCreateRoom">
          <v-list-tile-action>
            <v-icon>add</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Create Room</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile v-if="isAuthen" @click="onJoinRoom">
          <v-list-tile-action>
            <v-icon>chevron_right</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Join Room</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile v-for="item in menuItems" :key="item.title" router :to="item.link">
          <v-list-tile-action>
            <v-icon>{{item.icon}}</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>{{item.title}}</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile v-if="isAuthen" @click="onSignOut">
          <v-list-tile-action>
            <v-icon>exit_to_app</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Sign Out</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>
    <v-toolbar class="teal darken-1">
      <v-toolbar-items class="ml-0">
        <v-btn flat @click.stop="drawer = !drawer" class="hidden-sm-and-up">
          <v-icon>reorder</v-icon>
        </v-btn>
      </v-toolbar-items>
      <v-toolbar-title>
        <router-link to="/" tag="span" style="cursor: pointer">
          {{title}}
        </router-link>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-items class="hidden-xs-only">
        <v-btn flat v-if="isAuthen" @click="onCreateRoom">
          <v-icon left>add</v-icon>
          Create Room
        </v-btn>
        <v-btn flat v-if="isAuthen" @click="onJoinRoom">
          <v-icon left>chevron_right</v-icon>
          Join Room
        </v-btn>
        <v-btn flat v-for="item in menuItems" :key="item.title" router :to="item.link">
          <v-icon left>{{item.icon}}</v-icon>
          {{item.title}}
        </v-btn>
        <v-btn flat v-if="isAuthen" @click="onSignOut">
          <v-icon left>exit_to_app</v-icon>
          Sign Out
        </v-btn>
      </v-toolbar-items>
    </v-toolbar>
    <main>
      <router-view></router-view>
    </main>
  </v-app>
</template>

<script>
export default {
  data () {
    return {
      drawer: false,
      right: true,
      title: 'Typing Letters'
    }
  },
  computed: {
    menuItems () {
      let _items = [
        {icon: 'face', title: 'Sign up', link: '/signup'},
        {icon: 'lock_open', title: 'Sign in', link: '/signin'}
      ]
      if (this.isAuthen) {
        _items = [
          {icon: 'account_box', title: 'Profile', link: '/profile'}
        ]
      }
      return _items
    },
    isAuthen () {
      return this.$store.getters.isAuthen
    }
  },
  methods: {
    onSignOut () {
      this.$store.dispatch('signUserOut')
      this.$router.push('/')
    },
    onCreateRoom () {
      this.$router.push('/room/' + this.generateRoomId())
    },
    onJoinRoom () {
      var self = this
      this.$store.dispatch('getRandomRoom').then(res => {
        if (res.length == 0){
          self.$router.push('/room/' + self.generateRoomId())
        } else {
          for (let i = res.length; i; i--) {
            let j = Math.floor(Math.random() * i);
            [res[i - 1], res[j]] = [res[j], res[i - 1]];
          }
          self.$router.push('/room/' + res[0].roomName)
        }
      })
    },
    generateRoomId () {
      var genId = Math.floor(Math.random() * 26) + Date.now()
      return genId++
    }
  }
}
</script>

<style lang="stylus">
  @import './stylus/main'
</style>
