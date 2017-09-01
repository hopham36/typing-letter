import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/Home'
import CreateMeetup from '@/components/Meetup/CreateMeetup'
import Room from '@/components/Room/Index'
import Profile from '@/components/User/Profile'
import Signin from '@/components/User/Signin'
import Signup from '@/components/User/Signup'
import AuthRouter from './auth.js'

Vue.use(Router)
var r = new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home,
      beforeEnter: AuthRouter
    },
    {
      path: '/meetups/new',
      name: 'CreateMeetup',
      component: CreateMeetup,
      beforeEnter: AuthRouter
    },
    {
      path: '/profile',
      name: 'Profile',
      component: Profile,
      beforeEnter: AuthRouter
    },
    {
      path: '/signup',
      name: 'Signup',
      component: Signup
    },
    {
      path: '/signin',
      name: 'Signin',
      component: Signin
    },
    {
      path: '/room/:id',
      name: 'Room',
      component: Room
    }
  ]
})
export default r

