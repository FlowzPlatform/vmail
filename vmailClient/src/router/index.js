import Vue from 'vue'
import Router from 'vue-router'
import Login from '@/components/Login'
import Main from '@/components/Main'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import Middle from '@/components/Middle'
import Subjectlist from '@/components/Subjectlist'
import Conversation from '@/components/Conversation'
import Compose from '@/components/Compose'
import EmailDetail from '@/components/EmailDetail'
import MjmlEditor from '@/components/MjmlEditor'
import Setting from '@/components/Setting'
import Calender from '@/components/Calender'

Vue.use(Router)

export default new Router({
	mode:'history',
  routes: [
    {
      path: '/',
      name: 'Main',
      component: Main
    },
    {
      path: '/Login',
      name: 'Login',
      component: Login
    },
    {
      path: '/Sidebar',
      name: 'Sidebar',
      component: Sidebar
    },
    {
      path: '/Header',
      name: 'Header',
      component: Header
    },
    {
      path: '/Middle',
      name: 'Middle',
      component: Middle
    },
    {
      path: '/Subjectlist',
      name: 'Subjectlist',
      component: Subjectlist
    },
    {
      path: '/Conversation',
      name: 'Conversation',
      component: Conversation
    },
    {
      path: '/Compose',
      name: 'Compose',
      component: Compose
    },
    {
      path: '/EmailDetail',
      name: 'EmailDetail',
      component: EmailDetail
    },
    {
      path: '/MjmlEditor',
      name: 'MjmlEditor',
      component: MjmlEditor
    },
    {
      path: '/Setting',
      name: 'Setting',
      component: Setting
    },
    {
      path: '/Calender',
      name: 'Calender',
      component: Calender
    }
  ]
})
