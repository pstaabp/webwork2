<!-- SelectUserSidebar.vue

This is the Sidebar to allow changes to the selected user in many different views. -->

<script lang="ts">
import { Component, Watch, Vue } from "vue-property-decorator";

import { users_store, app_state_store } from "@/store";

@Component({ name: "SelectUserSidebar" })
export default class SelectUserSidebar extends Vue {
  private user_id = "";

  private get user_names() {
    return users_store.user_names;
  }

  @Watch("user_id")
  private userIDChanged() {
    app_state_store.updateAppState({ user_id: this.user_id });
  }

  private beforeMount() {
    this.user_id = app_state_store.selected_user;
  }
}
</script>
<template>
  <b-container>
    <b-form-group label="Selected User">
      <b-select v-model="user_id" :options="user_names">
        <template #first>
          <b-select-option value="" disabled
            >Please select a user</b-select-option
          >
        </template>
      </b-select>
    </b-form-group>
  </b-container>
</template>
