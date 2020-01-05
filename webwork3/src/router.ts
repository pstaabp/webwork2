import Vue from 'vue';
import VueRouter from 'vue-router';

import CourseList from '@/components/CourseList.vue';
import Manager from '@/components/Manager.vue';
import Login from '@/components/Login.vue';
import ProblemSetsManager from './components/views/ProblemSetsManager.vue';
import ClasslistManager from './components/views/ClasslistManager.vue';
import Calendar from './components/views/Calendar.vue';
import Settings from './components/views/Settings.vue';
import ProblemSetDetails from './components/views/SetDetails.vue';
import LibraryBrowser from './components/views/LibraryBrowser.vue';
import ImportExport from './components/views/ImportExport.vue';
import Editor from './components/views/Editor.vue';
import Statistics from './components/views/Statistics.vue';
import PageNotFound from './components/PageNotFound.vue';
import Empty from './components/Empty.vue';

Vue.use(VueRouter);

export default new VueRouter({
  base: '/webwork3',
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
           { path: 'statistics', component: Statistics},
         ],
       }],
     }],
    },
    {path: '*', component: PageNotFound},
  ],
});
