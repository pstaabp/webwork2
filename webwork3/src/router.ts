import Vue from "vue";
import VueRouter from "vue-router";

import CourseList from "@/components/CourseList.vue";
import Manager from "@/components/Manager.vue";
import Login from "@/components/Login.vue";
import ProblemSetsManager from "./components/views/ProblemSetsManager.vue";
import ClasslistManager from "./components/views/ClasslistManager.vue";
import Calendar from "./components/views/Calendar.vue";
import Settings from "./components/views/Settings.vue";
import ProblemSetView from "./components/views/ProblemSetView.vue";
import LibraryBrowser from "./components/views/LibraryBrowser.vue";
import Editor from "./components/views/Editor.vue";
import Statistics from "./components/views/Statistics.vue";
import PageNotFound from "./components/PageNotFound.vue";
import Empty from "./components/Empty.vue";
import ProblemViewer from "./components/views/ProblemViewer.vue";
import StudentView from "./components/StudentView.vue";

Vue.use(VueRouter);

export default new VueRouter({
  base: "/webwork3",
  mode: "history",
  routes: [
    {
      path: "/courses",
      component: Empty,
      children: [
        { path: "", component: CourseList },
        {
          path: ":course_id",
          component: Empty,
          children: [
            { path: "login", component: Login },
            {
              path: "manager",
              name: "manager",
              component: Manager,
              children: [
                {
                  path: "problem-sets",
                  name: "problem-sets",
                  component: ProblemSetsManager,
                },
                {
                  path: "viewer",
                  name: "viewer",
                  component: ProblemViewer,
                  props: { viewer_type: "instructor" },
                },
                {
                  path: "classlist",
                  name: "classlist",
                  component: ClasslistManager,
                },
                {
                  path: "settings",
                  name: "settings",
                  component: Settings,
                },
                {
                  path: "calendar",
                  name: "calendar",
                  component: Calendar,
                  props: { calendar_type: "instructor" },
                },
                {
                  path: "set-view",
                  name: "set-view",
                  component: ProblemSetView,
                },
                {
                  path: "set-view/:set_id",
                  component: ProblemSetView,
                  name: "set-view-tabs",
                },
                {
                  path: "library",
                  name: "library",
                  component: LibraryBrowser,
                },
                {
                  path: "library/:tabname",
                  name: "library-tabs",
                  component: LibraryBrowser,
                },
                {
                  path: "editor",
                  name: "editor",
                  component: Editor,
                },
                {
                  path: "statistics",
                  name: "statistics",
                  component: Statistics,
                },
                {
                  path: "statistics/:tabname",
                  name: "statistics-tabs",
                  component: Statistics,
                },
              ],
            },
            {
              path: "student",
              name: "student",
              component: StudentView,
              children: [
                {
                  path: "calendar",
                  name: "student-calendar",
                  component: Calendar,
                  props: { calendar_type: "student" },
                },
                {
                  path: "viewer",
                  name: "student-problems",
                  component: ProblemViewer,
                  props: { viewer_type: "student" },
                },
                {
                  path: "viewer/users/:user_id/sets/:set_id",
                  name: "student-problem-user-set",
                  component: ProblemViewer,
                  props: { viewer_type: "student" },
                },
              ],
            },
          ],
        },
      ],
    },
    { path: "*", component: PageNotFound },
  ],
});
