<template>
  <b-row>
    <b-col>
      <b-list-group class="border">
        <b-list-group-item class="pt-0 pb-0 pl-2" v-for="item in dirs[0]"
          :key="item.text" button @click="open(item,1)">
          <i v-if="item.type=='dir'" class='far fa-folder pr-2' />
          <i v-if="item.type=='file'" class='far fa-file pr-2' />
          {{item.text}}
        </b-list-group-item>
      </b-list-group>
    </b-col>
    <b-col>
      <b-list-group class="border" v-if="dirs[1] && dirs[1].length>0">
        <b-list-group-item class="pt-0 pb-0 pl-2" v-for="item in dirs[1]"
          :key="item.text" button @click="open(item,2)">
          <i v-if="item.type=='dir'" class='far fa-folder pr-2' />
          <i v-if="item.type=='file'" class='far fa-file pr-2' />
          {{item.text}}
        </b-list-group-item>
      </b-list-group>
    </b-col>
    <b-col>
      <b-list-group class="border" v-if="dirs[2] && dirs[2].length>0">
        <b-list-group-item class="pt-0 pb-0 pl-2" v-for="item in dirs[2]"
          :key="item.text" button @click="open(item,2)">
          <i v-if="item.type=='dir'" class='far fa-folder pr-2' />
          <i v-if="item.type=='file'" class='far fa-file pr-2' />
          {{item.text}}
        </b-list-group-item>
      </b-list-group>
    </b-col>
  </b-row>
</template>


<script lang="ts">
import { Vue, Component} from 'vue-property-decorator';

// set up the store
import login_store from '@/store/modules/login';

import axios from 'axios';

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
  name: 'LocalLibrary',
})
export default class LocalLibrary extends Vue {
  private dir_info: DirectoryStructure = {base: '', files: [], subdirs: []};
  private dirs: {[key: number]: DirectoryType[]} = {};
  private selection: DirectoryType[] = [];

  public mounted() {
    axios.get('/webwork3/api/courses/' + login_store.login_info.course_id + '/library/local')
      .then( (response) => {
        this.dir_info = response.data;
        // tslint:disable-next-line
        console.log(this.dir_info);
        this.open({type: 'dir', text: 'templates'}, 0);
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
    if (item.type === 'dir') {
      const dirs: {[key: number]: DirectoryType[]} = {};
      for (let i = 0; i < level; i++) {
        dirs[i] = this.dirs[i];
      }
      let _dirsTmp: DirectoryStructure = {base: '', files: [], subdirs: []};

      // get the right level in the directory tree.  TODO: write recursively.
      if (level === 0) {
        _dirsTmp = this.dir_info;
      } else if (level === 1) {
        _dirsTmp = this.dir_info.subdirs.find( (_dir: DirectoryStructure) => _dir.base === item.text) ||
                    {base: '', files: [], subdirs: []};
      } else if (level === 2) {
        _dirsTmp = this.dir_info.subdirs.find( (_dir: DirectoryStructure) => _dir.base === this.selection[1].text) ||
                      {base: '', files: [], subdirs: []};
        _dirsTmp = _dirsTmp.subdirs.find( (_dir: DirectoryStructure) => _dir.base === this.selection[2].text) ||
                      {base: '', files: [], subdirs: []};
      }

      // get all of the directories and filenames at the given level.
      dirs[level] = [
            ...(_dirsTmp.subdirs ? _dirsTmp.subdirs.map( (_dir: DirectoryStructure) =>
                                                            ({type: 'dir', text: _dir.base})) : []),
            ..._dirsTmp.files.map( (_file: string) => ({type: 'file', text: _file}) ),
          ];
      this.dirs = dirs;
    } else if (item.type === 'file') { // show the file in the
      this.selection[level] = item;
      // build the directory structure
      const path = this.selection.map( (el: DirectoryType) => el.text).join('/');
      // tslint:disable-next-line
      console.log(path)
      axios.get('/webwork3/api/courses/' + store.login_info.course_id + '/problems/local' + path)
        .then((response) => {
          this.$emit('load-problems', response.data);
        }).catch( (error) => {
          // tslint:disable-next-line
          console.log(error);
        });
    }
  } // open
} // class LocalLibrary
</script>

<style scoped>
.list-group {
  height: 100px;
  overflow: scroll;
}
.list-group-item {
  border: none;
}

</style>
