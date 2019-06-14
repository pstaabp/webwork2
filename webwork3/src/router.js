import Vue from 'vue'
import VueRouter from 'vue-router'

import Manager from '@/Manager'
import Login from '@/components/Login'
import ProblemSetsManager from '@/components/views/ProblemSetsManager'
import Calendar from '@/components/views/Calendar'
import Settings from '@/components/views/Settings'
import ProblemSetDetails from '@/components/views/SetDetails'

Vue.use(VueRouter);

export default new VueRouter({
  mode: 'history',
  routes: [
    {
      path: '/courses/:course_id/manager/',
      component: Manager,
      props: (route) => ({ params: route.params })
    },
    {
      path: '/courses/:course_id/login',
      component: Login,
      props: (route) => ({params: route.params})
    },
    {
      path: '/courses/:course_id/manager/problem-sets',
      component: ProblemSetsManager,
      props: (route) => ({params: route.params})
    },
    {
      path: '/courses/:course_id/manager/calendar',
      component: Calendar,
      props: (route) => ({params: route.params})
    },
    {
      path: '/courses/:course_id/manager/settings',
      component: Settings,
      props: (route) => ({params: route.params})
    },
    {
      path: '/courses/:course_id/manager/set-details',
      component: ProblemSetDetails,
      props: (route) => ({params: route.params})
    }
  ]
});
