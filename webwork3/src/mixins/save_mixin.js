// define a mixin object
export const SaveMixin = {
  methods: {
    saveProblemSet: function (_set) {
      _set.save({method: "PUT"}).then((response) => {
        // say "yeah saved!!";
        // eslint-disable-next-line
        console.log(response);
      }).catch((error) => {
        // Handle failure here
        // eslint-disable-next-line
        console.log(error);

      })
    }
  }
}
