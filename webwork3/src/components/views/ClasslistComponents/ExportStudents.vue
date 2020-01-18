<template>
  <b-modal size="xl" id="export-students" ref="sfmodal" title="Export Students to a File">
    <b-container fluid>
      <b-row>
        <b-col>
          <b-form-group label-cols="4" label-cols-lg="2" label="Filename" label-for="filename-input">
            <b-form-input id="filename-input" v-model='filename' />
          </b-form-group>
        </b-col>
        <b-col>
          <b-btn variant="primary" @click='download()' :disabled='clicked'>Download Classlist File</b-btn>
        </b-col>
      </b-row>
    </b-container>
    <div slot="modal-footer" class="w-100">
      <b-btn-group size="sm" class="float-right">
        <b-btn variant="outline-dark" @click="$bvModal.hide('export-students')">Close</b-btn>
      </b-btn-group>
     </div>
  </b-modal>
</template>



<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { unparse } from 'papaparse';

import * as moment from 'moment';

import users_store from '@/store/modules/users';
import login_store from '@/store/modules/login';

@Component
export default class ImportStudentsFile extends Vue {
  private filename = '';
	private clicked = false;

  private download() {
    const csv = unparse(users_store.users_array);
		const blob = new Blob([csv], { type: 'text/csv' })
		const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = this.filename;
    link.click();
    URL.revokeObjectURL(link.href);
		this.clicked = true;
  }

	private mounted() {
		this.filename = login_store.login_info.course_id + '_classlist_'
			+ moment.default().format('YYYY-MM-DD') + '.csv';
	}
}
</script>
