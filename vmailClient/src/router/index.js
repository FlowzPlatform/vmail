import Vue from 'vue'
import Layout from '@/layout/Master'
import Mail from '@/pages/Mail'
import Login from '@/pages/Login'
import Compose from '@/pages/Compose'
import SocialLogin from '@/pages/SocialLogin'
import Calendar from '@/pages/Calendar'
import Emailtemplate from '@/pages/Emailtemplate'

const routes = [
  {
    path: '/user',
    name: 'Layout',
    component: Layout,
    meta: { requiresAuth: true },
    children: [{
      path: 'maildashboard',
      name: 'MailDashboard',
      component: Mail
    },
    {
      path: 'compose',
      name: 'Compose',
      component: Compose
    },
    {
      path: 'calendar',
      name: 'Calendar',
      component: Calendar
    },
    {
      path: 'emailtemplate',
      name: 'Emailtemplate',
      component: Emailtemplate
    }]
  },
  { 
    path: '/Login',
    name: 'Login',
    component: Login
  },
  { 
    path: '/SocialLogin',
    name: 'SocialLogin',
    component: SocialLogin
  },
  {
    path: '/',
    name: '',
    redirect: '/Login'
  }
]

export default routes