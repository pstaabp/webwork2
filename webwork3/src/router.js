import Vue from 'vue'
import VueRouter from 'vue-router'

import CourseList from '@/CourseList'
import Manager from '@/Manager'
import Login from '@/components/Login'
import ProblemSetsManager from '@/components/views/ProblemSetsManager'
import ClasslistManager from '@/components/views/ClasslistManager'
import Calendar from '@/components/views/Calendar'
import Settings from '@/components/views/Settings'
import ProblemSetDetails from '@/components/views/SetDetails'
import LibraryBrowser from '@/components/views/LibraryBrowser'
import ImportExport from '@/components/views/ImportExport'
import Editor from '@/components/views/Editor'
import Statistics from '@/components/views/Statistics'
import PageNotFound from '@/components/PageNotFound'
import Empty from '@/components/Empty'

Vue.use(VueRouter);

export default new VueRouter({
  mode: 'history',
  routes: [
    { path: '/courses', component: Empty, children: [
      { path: '', component: CourseList},
       { path: ':course_id', component: Empty, children: [
         { path: 'login', component: Login },
         { path: 'manager', component: Manager, children: [
           { path: 'problem-sets', component: ProblemSetsManager},
           { path: 'classlist', component: ClasslistManager},
           { path: 'settings', component: Settings},
           { path: 'calendar', component: Calendar},
           { path: 'set-details', component: ProblemSetDetails},
           { path: 'library', component: LibraryBrowser},
           { path: 'import-export', component: ImportExport},
           { path: 'editor', component: Editor},
           { path: 'statistics', component: Statistics}
         ]}
      ]
    }
  ]
}
]
})

//
//           },
//           {
//             path: 'mananger/calendar',
//             component: Calendar,
//
//           },
//           {
//             path: 'mananger/settings',
//             component: Settings,
//
//           },
//           {
//             path: 'mananger/set-details',
//             component: ProblemSetDetails,
//
//           }
//       ]
//     },
//     { path: '*', component: PageNotFound }
//   ]
// });
