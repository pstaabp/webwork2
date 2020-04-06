<!-- SaveAsProblemModal.vue

What is this for??  -->

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";

import { getLocalDirectory } from "@/store/api";
import { FileInfo } from "@/store/models";

@Component({
  name: "SaveAsProblemModal",
})
export default class SaveAsProblemModal extends Vue {
  private file = "";
  private dir = "";
  private file1 = "";
  private options1: FileInfo[] = [];
  private file2 = "";
  private options2: FileInfo[] = [];
  private file3 = "";
  private options3: FileInfo[] = [];

  private get directory() {
    return this.file1 + (this.file2 ? "/" + this.file2 : "");
  }

  private async selected1(name: string) {
    this.file1 = name;
    this.file2 = "";
    this.options2 = await getLocalDirectory(name);
  }

  private async selected2(name: string) {
    this.file2 = name;
    this.options3 = await getLocalDirectory(this.file1 + "/" + name);
  }

  private async mounted() {
    this.options1 = await getLocalDirectory("");
  }
}
</script>

<template>
  <b-modal id="save-as-problem-modal" size="xl">
    <b-row>
      <b-col cols="6">
        <b-form-group label-cols="auto" label="Directory:">
          <b-input v-model="directory" />
        </b-form-group>
      </b-col>
      <b-col>
        <b-form-group label-cols="auto" label="Filename:">
          <b-input v-model="file" />
        </b-form-group>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <b-list-group>
          <b-list-group-item
            v-for="item in options1"
            :key="item.name"
            class="p-1"
            :button="item.type === 'dir'"
            :disabled="item.type === 'file'"
            @click="selected1(item.name)"
          >
            <b-icon v-if="item.type === 'dir'" icon="folder" />
            <b-icon v-if="item.type === 'file'" icon="document" />
            <span class="pl-2">{{ item.name }}</span>
          </b-list-group-item>
        </b-list-group>
      </b-col>
      <b-col>
        <b-list-group-item
          v-for="item in options2"
          :key="item.name"
          class="p-1"
          :button="item.type === 'dir'"
          :disabled="item.type === 'file'"
          @click="selected2(item.name)"
        >
          <b-icon v-if="item.type === 'dir'" icon="folder" />
          <b-icon v-if="item.type === 'file'" icon="document" />
          <span class="pl-2">{{ item.name }}</span>
        </b-list-group-item>
      </b-col>
      <b-col />
    </b-row>
  </b-modal>
</template>
