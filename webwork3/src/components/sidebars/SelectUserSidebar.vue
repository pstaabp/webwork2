<!-- SelectUserSidebar.vue

This is the Sidebar to allow changes to the selected user in many different views. -->

<script lang="ts">
import { Component, Watch, Vue } from "vue-property-decorator";

import user_store from "@/store/modules/users";
import app_state from "@/store/modules/app_state";

@Component({name: "SelectUserSidebar"})
export default class SelectUserSidebar extends Vue {
  private user_id = "";

  private get user_names() {
    console.log(user_store.users); // eslint-disable-line no-console
    return Array.from(user_store.users.keys());
  }

  @Watch("set_id")
  private userIDChanged() {
    app_state.setSelectedUser(this.user_id);
  }
}
</script>
<template>
  <b-container>
    <b-form-group label="Selected User">
      <b-select v-model="user_id" :options="user_names">
        <template v-slot:first>
          <b-select-option value="" disabled>Please select a user</b-select-option>
        </template>
      </b-select>
    </b-form-group>
  </b-container>
</template>
