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


<script>
import axios from 'axios'
import {mapState} from 'vuex'

export default {
  name: "LocalLibrary",
  data: function (){
    return {
      dir_info: {},
      dirs: {},
      selection: {}
    }
  },
  methods: {
    loadProblems(){

    },
    // getDirectory(level){
    //
    // },

    // this opens either a directory or a file
    // Note: there are only 3 levels of directories.  Should write for more.
    open(item,level){
      var select = {}
      for(var i = 0; i < level; i++){
        select[i] = this.selection[i]
      }
      this.selection = select;
      this.selection[level] = item;
      if(item.type=="dir"){
        var dirs = {}
        for(var i =0;i<level;i++){
          dirs[i] = this.dirs[i];
        }
        var _dirs_tmp = [];

        // get the right level in the directory tree.  TODO: write recursively.
        if(level==0){
          _dirs_tmp = this.dir_info;
        } else if(level==1){
          _dirs_tmp = this.dir_info.subdirs.find(_dir => _dir.base == item.text);
        } else if(level==2){
          _dirs_tmp = this.dir_info.subdirs.find(_dir => _dir.base == this.selection[1].text);
          _dirs_tmp = _dirs_tmp.subdirs.find(_dir => _dir.base == this.selection[2].text);
        }

        // get all of the directories and filenames at the given level.
        const _files_at_level = [
              ...(_dirs_tmp.subdirs ? _dirs_tmp.subdirs.map(_dir => {return{type:"dir",text:_dir.base}}): []),
              ..._dirs_tmp.files.map(_file => {return {type:"file",text: _file}})]
        dirs[level] = _files_at_level;
        this.dirs= dirs;
      } else if (item.type=="file"){ // show the file in the
        this.selection[level] = item
        // build the directory structure
        const path = Object.keys(this.selection).map(key => this.selection[key].text).join("/")
        // eslint-disable-next-line
        console.log(path)
        axios.get("/webwork3/api/courses/" + this.login_info.course_id + "/problems/local/" + path)
          .then((response)=>{
            this.$emit('load-problems',response.data);
          });
      }
    }
  },
  computed: {
    ...mapState(['login_info'])
  },
  mounted(){
    axios.get("/webwork3/api/courses/" + this.login_info.course_id + "/library/local")
      .then( (response) => {
        this.dir_info = response.data;
        this.open({type:"dir",text:"templates"},0)
      })
  }
}
</script>

<style>
.list-group {
  height: 100px;
  overflow: scroll;
}
.list-group-item {
  border: none;
}

</style>
