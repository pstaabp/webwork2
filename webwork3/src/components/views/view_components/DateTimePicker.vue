<template>
  <table><tr><td>
    <b-input size="sm" type="date" :value="selected_set | getDateType(date_type) | formatDate"
      @change="updateDate(this.date_type,$event)"/></td>
    <td><b-input v-if="show_time" size="sm" type="time" :value="selected_set | getDateType(date_type) | formatTime" />
    </td></tr></table>
</template>



<script>
import moment from 'moment'

export default {
  name: 'DateTimePicker',
  props: ['selected_set','date_type','show_time'],
  methods: {

    formatTime: function(date_in_unix){
      // eslint-disable-next-line
      //console.log(moment.unix(date_in_unix).format("HH:mm"));

      return moment.unix(date_in_unix).format("HH:mm")
    }
  },
  filters: {
    getDateType: function(_set, date_type){
      return _set === undefined ? 0 : _set[date_type];
    },
    formatDate: function(date_in_unix){
      // eslint-disable-next-line
      //console.log(date_in_unix);

      return moment.unix(date_in_unix).format("YYYY-MM-DD")
    },
    formatTime: function(date_in_unix){
      // eslint-disable-next-line
      //console.log(moment.unix(date_in_unix).format("HH:mm"));

      return moment.unix(date_in_unix).format("HH:mm")
    }
  }
}
</script>
