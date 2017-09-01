import Vue from 'vue'
import Vuex from 'vuex'
import * as firebase from 'firebase'

Vue.use(Vuex)

export const store = new Vuex.Store({
  state: {
    loadedMeetups: [],
    user: null,
    loading: false,
    error: null,
    availableRooms: []
  },
  mutations: {
    createMeetup (state, meetup) {
      state.loadedMeetups.push(meetup)
    },
    setAvaivableRoom (state, rooms) {
      state.availableRooms = rooms
    },
    setUser (state, user) {
      state.user = user
    },
    setLoading (state, _state) {
      state.loading = _state
    },
    setError (state, _state) {
      state.error = _state
    },
    clearError (state) {
      state.error = null
    },
    setLoadedMeetups (state, meetups) {
      state.loadedMeetups = meetups
    }
  },
  actions: {
    getRandomRoom (context) {
      context.commit('setLoading', true)
      var start = new Date()
      start.setMinutes(start.getMinutes() - 1)

      var ref = firebase.database().ref('rooms')
      return ref.orderByChild('date').startAt(start.getTime()).once('value').then((data) => {
        const rooms = []
        const val = data.val()
        for (let key in val) {
          if (val[key].isActive) {
            rooms.push({
              id: key,
              isActive: val[key].isActive,
              roomName: val[key].roomName
            })
          }
        }
        context.commit('setAvaivableRoom', rooms)
        context.commit('setLoading', false)
        return new Promise((resolve, reject) => {
          resolve(rooms)
        })
      })
    },
    loadMeetups (context) {
      context.commit('setLoading', true)
      firebase.database().ref('meetups').once('value')
      .then((data) => {
        const meetups = []
        const val = data.val()
        for (let key in val) {
          meetups.push({
            id: key,
            title: val[key].title,
            description: val[key].description,
            imgUrl: val[key].imgUrl,
            location: val[key].location,
            date: val[key].date
          })
        }
        context.commit('setLoadedMeetups', meetups)
        context.commit('setLoading', false)
      })
      .catch((error) => {
        context.commit('setLoading', false)
        console.log(error)
      })
    },
    createMeetup (context, meetup) {
      context.commit('setLoading', true)
      const model = {
        title: meetup.title,
        description: meetup.description,
        imgUrl: meetup.imgUrl,
        location: meetup.location,
        date: meetup.date.toISOString(),
        uid: context.state.user.id
      }
      return firebase.database().ref('meetups').push(model)
        .then((data) => {
          model.id = data.key
          context.commit('createMeetup', model)
          context.commit('setLoading', false)
          return new Promise((resolve, reject) => {
            resolve(model)
          })
        })
        .catch((error) => {
          console.log(error)
        })
    },
    createRoom (context, room) {
      const model = {
        roomName: room.roomName,
        isActive: true,
        uid: context.state.user.id,
        date: new Date().getTime()
      }
      return firebase.database().ref('rooms').push(model)
      .then((data) => {
        model.id = data.key
        return new Promise((resolve, reject) => {
          resolve(model)
        })
      })
      .catch((error) => {
        console.log(error)
      })
    },
    deactiveRoom (context, id) {
      firebase.database().ref('rooms/' + id).update({
        isActive: false
      })
    },
    signUserUp ({commit}, user) {
      commit('setLoading', true)
      commit('clearError')
      firebase.auth().createUserWithEmailAndPassword(user.email, user.password)
        .then(
          user => {
            const newUser = {
              id: user.uid,
              email: user.email
            }
            commit('setLoading', false)
            commit('setUser', newUser)
          }
        )
        .catch(
          error => {
            commit('setError', error)
            commit('setLoading', false)
          }
        )
    },
    signUserIn ({commit}, user) {
      commit('setLoading', true)
      commit('clearError')
      firebase.auth().signInWithEmailAndPassword(user.email, user.password)
        .then(
          user => {
            const newUser = {
              id: user.uid,
              email: user.email
            }
            commit('setLoading', false)
            commit('setUser', newUser)
          }
        )
        .catch(
          error => {
            commit('setError', error)
            commit('setLoading', false)
          }
        )
    },
    clearError ({commit}) {
      commit('clearError')
    },
    signUserOut (context) {
      firebase.auth().signOut()
      context.commit('setUser', null)
    },
    autoSignIn ({commit}, _user) {
      commit('setUser', {id: _user.uid, email: _user.email})
    }
  },
  getters: {
    loadedMeetups (state) {
      return state.loadedMeetups.sort((A, B) => {
        return A.date > B.date
      })
    },
    getAvailableRooms (state) {
      return state.availableRooms
    },
    featureMeetups (state, getters) {
      return getters.loadedMeetups.slice(0, 5)
    },
    loadedMeetup (state) {
      return (meetupId) => {
        return state.loadedMeetups.find((meetup) => {
          return meetup.id === meetupId
        })
      }
    },
    user (state) {
      return state.user
    },
    isAuthen (state) {
      return state.user !== null && state.user !== undefined
    },
    error (state) {
      return state.error
    },
    loading (state) {
      return state.loading
    }
  }
})
