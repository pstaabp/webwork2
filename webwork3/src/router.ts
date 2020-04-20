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
import ImportExport from "./components/views/ImportExport.vue";
import Editor from "./components/views/Editor.vue";
import Statistics from "./components/views/Statistics.vue";
import PageNotFound from "./components/PageNotFound.vue";
import Empty from "./components/Empty.vue";

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
              component: Manager,
              children: [
                {
                  path: "problem-sets",
                  name: "sets",
                  component: ProblemSetsManager,
                },
                {
                  path: "classlist",
                  name: "classlist",
                  component: ClasslistManager,
                },
                { path: "settings", name: "settings", component: Settings },
                { path: "calendar", name: "calendar", component: Calendar },
                { path: "set-view", component: ProblemSetView },
                {
                  path: "set-view/:set_id",
                  component: ProblemSetView,
                  name: "setview",
                },
                {
                  path: "library",
                  name: "library",
                  component: LibraryBrowser,
                  children: [
                    {
                      path: "subjects",
                      name: "library-subjects",
                      component: LibraryBrowser,
                    },
                    {
                      path: "directory",
                      name: "library-directory",
                      component: LibraryBrowser,
                    },
                    {
                      path: "textbooks",
                      name: "library-textbooks",
                      component: LibraryBrowser,
                    },
                    {
                      path: "local",
                      name: "library-local",
                      component: LibraryBrowser,
                    },
                    {
                      path: "setdefn",
                      name: "library-setdefn",
                      component: LibraryBrowser,
                    },
                    {
                      path: "search",
                      name: "library-search",
                      component: LibraryBrowser,
                    },
                    {
                      path: "pending",
                      name: "library-pending",
                      component: LibraryBrowser,
                    },
                  ],
                },
                {
                  path: "import-export",
                  name: "import-export",
                  component: ImportExport,
                },
                { path: "editor", name: "editor", component: Editor },
                {
                  path: "statistics",
                  name: "statistics",
                  component: Statistics,
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
