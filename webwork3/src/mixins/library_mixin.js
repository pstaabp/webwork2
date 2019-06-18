export default {
  data: function(){
    return {
      all_problems: [],
      current_page: 1,
      rows_per_page: 10
    }
  },
  methods:{
    addProblem: function(_problem){
      const set = this.problem_sets.find(set=>set.set_id==this.selected_set_id);
      set.save({method: "put"}).then(resp=>{
        // eslint-disable-next-line
        console.log(resp,_problem);
      }).catch(err=>{console.log(err)})
    },
  },
  computed: {
    num_problems: function (){
      return this.all_problems.length;
    },
    get_problems: function(){
      if(this.all_problems.length==0 || this.current_page == 0){
        return []
      }
      var probs = [];
      for(var i=(this.current_page-1)*this.rows_per_page;
          i < Math.min(this.all_problems.length,this.current_page*this.rows_per_page); i++){
        probs.push(this.all_problems[i]);
      }
      return probs;
    }
  }
}
