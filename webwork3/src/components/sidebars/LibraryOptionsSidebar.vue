<template>
  <div>
    <b-form-group label="Target Problem Set">
      <b-form>
        <b-select v-model="selected_set"
        :options="getProblemSets"
        value-field="set_id" text-field="set_id" size="sm"
          @change="$emit('update:selected_set_id',selected_set)"
          :state="selected_set !== null">
          <template slot="first">
            <option :value="null">Select set...</option>
          </template>
        </b-select>
        <b-form-invalid-feedback>Please select a problem set</b-form-invalid-feedback>
      </b-form>
    </b-form-group>
  </div>
</template>

<script>

export default {
  name: 'LibraryOptionsSidebar',
  props: {
    // problem_sets: ProblemSetList,
    selected_set_id: String,
  },
  data() {
    return {
      selected_set: null,
    };
  },
  computed: {
    getProblemSets() {
      return this.$store.state.problem_sets;
    },
  },

};
</script>
