<template>
  <h3>Import-Export Manager</h3>
</template>

<script>
import Problem from '@/models/ProblemSet';

export default {
  name: 'ImportExport',
  mounted() {
    const prob = new ProblemSet({set_id: 'HW1'});


    // tslint:disable-next-line
    console.log(prob);
  },
};

</script>
