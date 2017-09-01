<template>
  <v-container @click="onShowKeyBoard">
    <v-flex xs12 class="text-xs-center">
      <v-progress-circular indeterminate class="teal--text" :width="7" :size="70" v-if="loading" ></v-progress-circular>
    </v-flex>
    <v-layout v-if="user && !loading" row wrap class="text-xs-center">
      <v-flex xs12 v-if="isStarting">
        <label> This game will start in {{ timing }} seconds... </label>
      </v-flex>
      <v-flex xs12 v-show="!isPlayed || hasWinner" v-for="player in tw.players" :key="player.id">
        <v-chip class="indigo white--text">
          <v-avatar>
            <v-icon>account_circle</v-icon>
          </v-avatar>
          {{ player.email }}
        </v-chip>
        <v-chip v-show="hasWinner" class="indigo white--text">{{ player.score }}</v-chip>
      </v-flex>
      <v-flex xs12>
        <v-btn v-if="isHost && !isPlayed" @click="startGame">Start Game</v-btn>
      </v-flex>
      <v-flex xs12>
        <v-text-field style="width:0px; height:0px; opacity:0;" ref="locationInput" name="location"></v-text-field>
      </v-flex>
      <v-flex xs12 v-if="isPlayed && !hasWinner">
        <v-chip class="teal white--text text-xs-left">{{getCurrentIndex + 1}}/{{ range }}</v-chip>
        <v-chip class="secondary  white--text text-xs-right">{{ getScore }}</v-chip>
      </v-flex>
      <v-flex xs12 v-show="isPlayed && !hasWinner">
        <span data-current-text ref="matchInput" style="color:teal; font-size:50px" ><span class="match" style="color:#d94f5c"></span><span class="unmatch"></span></span>
      </v-flex>
    </v-layout>
    <c-dialog @closeDialog="onCloseDialog" :text="dialogText" :vdialog="dialog"></c-dialog>
  </v-container>
</template>
<<script>
var socket = null,
    g_roomKey = 0;

export default {
  mounted: function () {
    // this.$nextTick(function () {
    //   this.$firebase.auth().onAuthStateChanged((user) => {
    //     if (user) {
          
    //     }
    //   })
    // })
  },
  data () {
    return {
      hasWinner: false,
      range: 2,
      loading: true,
      roomKey: 0,
      isStarting: false,
      timing: 5,
      dialog: false,
      dialogText: '',
      isHost: false,
      isPlayed: false,
      bindTypingWord: function() {
        var self = this
        $(document).unbind("keypress")
        $(document).keypress(function (event) {

          var currentElPress = $("[data-current-text]"),
              matchSpan = currentElPress.find(".match"),
              unmatchSpan = currentElPress.find(".unmatch"),
              unmatchText = unmatchSpan.text(),
              inputChar;
         
          inputChar = String.fromCharCode(event.charCode);

          if (inputChar == unmatchText.charAt(0)) {
            unmatchSpan.text(unmatchText.replace(inputChar, ""));
            matchSpan.append(inputChar);
            if (unmatchText.length == 1) {
              self.tw.currentIndex++
              if (self.tw.currentIndex== self.tw.items.length) {
                  self.generateWinner()
              } else {
                $("[data-current-text]").find(".match").text('');
                $("[data-current-text]").find(".unmatch").text(self.tw.items[self.tw.currentIndex]);
              }

              var _id = self.user.id, tmpScore = 0;
              $.grep(self.tw.players, function (i, a) { if (i.id == _id) { i.score++; tmpScore = i.score; } })
              self.tw.score = tmpScore;
              socket.on(self.room).emit('completeWorld', {
                  currentIndex: self.tw.currentIndex,
                  id: _id
              });
            }
          }
        })
      },
      completeWord (data) {
        var self = this.tw, tmpScore = 0;
        if (this.hasWinner)
            return;
        self.currentIndex = data.currentIndex;

        $.grep(self.players, function (i, a) { if (i.id == data.id) { i.score++; tmpScore = i.score; } })
        
        if (self.currentIndex == self.items.length) {
            this.generateWinner()
        } else {
          $("[data-current-text]").find(".match").text('');
          $("[data-current-text]").find(".unmatch").text(self.items[self.currentIndex]);
        }
      },
      generateWinner () {
        var self = this
        self.hasWinner = true
      },
      tw: {
        init () {
          var self = this
          self.isInit = true
          self.players.push({
            id: self.user.id,
            email: self.user.email, 
            score: 0
          })
        },
        isInit: false,
        user: null,
        items: [],
        players: [],
        currentIndex: 0,
        score: 0
      }
    }
  },
  computed: {
    getCurrentIndex () {
      return this.tw.currentIndex
    },
    getScore () {
      return this.tw.score
    },
    room () {
      return this.$route.params['id']
    },
    user () {
      return this.$store.getters.user
    }
  },
  watch: {
    '$store.getters.user': 'checkUser',
    '$route': 'checkUser'
  },
  methods: {
    checkUser () {
      var $self = this

      if(this.user == null)
        return
      $self.isStarting = false
      $self.isPlayed = false
      $self.timing = 5
      $self.dialog = false
      $self.dialogText = ''
      $self.isHost = false
      $self.roomKey = 0
      $self.loading = true
      $self.hasWinner = false
      g_roomKey = 0

      $self.tw.players = []
      $self.tw.isInit = false
      $self.tw.user = null
      $self.tw.items = []
      $self.tw.players = []
      $self.tw.currentIndex = 0
      $self.tw.score = 0

      if (socket == undefined || socket == null) {
        socket = io.connect('/game')
      }
      else if(socket != null && !socket.connected) {
        socket = null
        socket = io.connect('/game')
      }
      var user = this.user
      var _room = this.room
      var _user = this.user
      $self.tw.user = {id: user.id, email: user.email}
      
      socket.on('connect', function () {
        socket.emit('joinRoom', {
            room: _room,
            userId: _user.id,
            userName: _user.email
        })
      })
      socket.on('init', function (data) {
        if (data.roomLength == 1) // only himseft on this game
        {
          const model = {
            roomName: _room
          }
          $self.$store.dispatch('createRoom', model).then(res => {
            $self.loading = false
            $self.roomKey = res.id  
            g_roomKey = res.id
            $self.isHost = true
            $self.tw.init()
          })
        } else {
          if (!$self.tw.isInit) {
            $self.loading = false
            socket.on(_room).emit('initGameFromOther')
          }
        }
      })

      socket.on('userDisconnect', function (data) {
          if (data.isHost && !$self.isPlayed) {
              $self.dialogText = "Host has just left the room, please go back to home page"
              $self.dialog = true
          } else {
            $self.tw.players = $.grep($self.tw.players, function (i, a) { return i.email != data.userName })
          }
      })

      socket.on('initGameFromOther', function () {
        socket.on(_room).emit('initGameToOther', {
            data: $self.tw,
            isStarting: $self.isStarting,
            isPlayed: $self.isPlayed,
            hasWinner: $self.hasWinner
        })
      })

      socket.on('sendGame', function (data) {
        const _data = data.data
        $self.tw.players = _data.players
        if(data.hasWinner)
          return
        if (data.isPlayed) {
          $self.tw.items = _data.items
          $self.tw.currentIndex = _data.currentIndex
          $self.isStarting = data.isStarting
          $self.isPlayed = data.isPlayed
          $self.$refs.locationInput.$el.querySelector('input[type=text]').focus()
          $self.bindTypingWord()
          $self.$refs.matchInput.querySelector("[class=unmatch]").innerText = $self.tw.items[$self.tw.currentIndex]
        }
        
        $self.tw.init()
        socket.on(_room).emit('sendNumberOfPlayer',
        {
          players: $self.tw.players
        })
      })

      socket.on('getNumberOfPlayer', function (data) {
        if ($self.tw.isInit) {
          $self.tw.players = data.players
        }
      })

      socket.on('sendStartGame', function (data) {
        var  _data = data.data
        $self.tw.items = _data.items
        $self.startGame()
      })

      socket.on('completeWorld', function (data) {
        if ($self.tw.isInit) {
          $self.completeWord(data)
        }
      })
    },
    onShowKeyBoard () {
      this.$refs.locationInput.$el.querySelector('input[type=text]').focus()
    },
    onCloseDialog () {
      this.$router.push('/')
    },
    startGame () {
      var $self = this
      if ($self.isHost) {
        $self.deactiveRoom()
        $.getJSON('/static/hard.json', function(jsData){
          $self.tw.items = $self.suffle(jsData).slice(0, $self.range);
          socket.on($self.room).emit('startGame', {data: $self.tw})
          $self.isStarting = true
          var t = 5
          var a = setInterval(function () {
            t--
            $self.timing = t
            if (t == 0) {
              $self.isStarting = false
              clearInterval(a)
              $self.$refs.locationInput.$el.querySelector('input[type=text]').focus()
              $self.bindTypingWord()
              $self.isPlayed = true
              $self.$refs.matchInput.querySelector("[class=unmatch]").innerText = $self.tw.items[$self.tw.currentIndex]
            }
          }, 1000)
        })
      } else {
        $self.isStarting = true
        var t = 5
        var a = setInterval(function () {
          t--
          $self.timing = t
          if (t == 0) {
            $self.isStarting = false
            clearInterval(a)
            $self.$refs.locationInput.$el.querySelector('input[type=text]').focus()
            $self.bindTypingWord()
            $self.isPlayed = true
            $self.$refs.matchInput.querySelector("[class=unmatch]").innerText = $self.tw.items[$self.tw.currentIndex]
          }
        }, 1000)
      }
    },
    suffle (a) {
      for (let i = a.length; i; i--) {
          let j = Math.floor(Math.random() * i);
          [a[i - 1], a[j]] = [a[j], a[i - 1]];
      }

      return a
    },
    deactiveRoom () {
      var $self = this
      if ($self.isHost && $self.roomKey != 0) {
        $self.$store.dispatch('deactiveRoom', $self.roomKey)
      }
    }
  },
  beforeRouteLeave: (to, from, next) => {
    socket.disconnect()
    next()
  },
  beforeRouteUpdate: (to, from, next) => {
    socket.disconnect()
    next()
  },
  beforeRouteEnter (to, from, next) {
    next(vm => vm.checkUser())
  }
}
</script>
