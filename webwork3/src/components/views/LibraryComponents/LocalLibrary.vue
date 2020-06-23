<!-- LocalLibrary.vue

This is a tab in the LibraryBrowser that allows one to find problems in the local (course) library -->

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";

import { login_store } from "@/store";

import axios from "axios";

interface DirectoryStructure {
  base: string;
  files: string[];
  subdirs: DirectoryStructure[];
}

interface DirectoryType {
  type: string;
  text: string;
}

@Component({
  name: "LocalLibrary",
})
export default class LocalLibrary extends Vue {
  private dir_info: DirectoryStructure = { base: "", files: [], subdirs: [] };
  private dirs: { [key: number]: DirectoryType[] } = {};
  private selection: DirectoryType[] = [];

  public mounted(): void {
    axios.get(login_store.api_header + "/library/local").then((response) => {
      this.dir_info = response.data;
      this.open({ type: "dir", text: "templates" }, 0);
    });
  }

  // this opens either a directory or a file
  // Note: there are only 3 levels of directories.  Should write for more.
  private open(item: DirectoryType, level: number) {
    const select: DirectoryType[] = [];
    for (let i = 0; i < level; i++) {
      select[i] = this.selection[i];
    }
    this.selection = select;
    this.selection[level] = item;
    if (item.type === "dir") {
      const dirs: { [key: number]: DirectoryType[] } = {};
      for (let i = 0; i < level; i++) {
        dirs[i] = this.dirs[i];
      }
      let directory_temp: DirectoryStructure = {
        base: "",
        files: [],
        subdirs: [],
      };

      // get the right level in the directory tree.  TODO: write recursively.
      if (level === 0) {
        directory_temp = this.dir_info;
      } else if (level === 1) {
        directory_temp = this.dir_info.subdirs.find(
          (_dir: DirectoryStructure) => _dir.base === item.text
        ) || { base: "", files: [], subdirs: [] };
      } else if (level === 2) {
        directory_temp = this.dir_info.subdirs.find(
          (_dir: DirectoryStructure) => _dir.base === this.selection[1].text
        ) || { base: "", files: [], subdirs: [] };
        directory_temp = directory_temp.subdirs.find(
          (_dir: DirectoryStructure) => _dir.base === this.selection[2].text
        ) || { base: "", files: [], subdirs: [] };
      }

      // get all of the directories and filenames at the given level.
      dirs[level] = [
        ...(directory_temp.subdirs
          ? directory_temp.subdirs.map((_dir: DirectoryStructure) => ({
              type: "dir",
              text: _dir.base,
            }))
          : []),
        ...directory_temp.files.map((_file: string) => ({
          type: "file",
          text: _file,
        })),
      ];
      this.dirs = dirs;
    } else if (item.type === "file") {
      // show the file in the
      this.selection[level] = item;
      // build the directory structure
      const path = this.selection.map((el: DirectoryType) => el.text).join("/");

      console.log(path); // eslint-disable-line no-console
      axios
        .get(login_store.api_header + "/problems/local" + path)
        .then((response) => {
          this.$emit("load-problems", response.data);
        })
        .catch((error) => {
          console.log(error); // eslint-disable-line no-console
        });
    }
  } // open
} // class LocalLibrary
</script>

<template>
  <b-row>
    <b-col>
      <b-list-group class="border">
        <b-list-group-item
          v-for="item in dirs[0]"
          :key="item.text"
          class="pt-0 pb-0 pl-2"
          button
          @click="open(item, 1)"
        >
          <i v-if="item.type == 'dir'" class="far fa-folder pr-2" />
          <i v-if="item.type == 'file'" class="far fa-file pr-2" />
          {{ item.text }}
        </b-list-group-item>
      </b-list-group>
    </b-col>
    <b-col>
      <b-list-group v-if="dirs[1] && dirs[1].length > 0" class="border">
        <b-list-group-item
          v-for="item in dirs[1]"
          :key="item.text"
          class="pt-0 pb-0 pl-2"
          button
          @click="open(item, 2)"
        >
          <i v-if="item.type == 'dir'" class="far fa-folder pr-2" />
          <i v-if="item.type == 'file'" class="far fa-file pr-2" />
          {{ item.text }}
        </b-list-group-item>
      </b-list-group>
    </b-col>
    <b-col>
      <b-list-group v-if="dirs[2] && dirs[2].length > 0" class="border">
        <b-list-group-item
          v-for="item in dirs[2]"
          :key="item.text"
          class="pt-0 pb-0 pl-2"
          button
          @click="open(item, 2)"
        >
          <i v-if="item.type == 'dir'" class="far fa-folder pr-2" />
          <i v-if="item.type == 'file'" class="far fa-file pr-2" />
          {{ item.text }}
        </b-list-group-item>
      </b-list-group>
    </b-col>
  </b-row>
</template>

<style scoped>
.list-group {
  height: 100px;
  overflow: scroll;
}
.list-group-item {
  border: none;
}
</style>
