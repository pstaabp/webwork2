/*  This is the configuration for the require.js loading.  See requirejs.org for more info.

  It should be loaded directly before the require.js is loaded in a page.  */

var require = {
    paths: {
        "backbone":             "/webwork3/modules/backbone/backbone", // backbone.stickit requires a lower-case "b"
        "backbone-validation":  "/webwork3/modules/backbone-validation/dist/backbone-validation",
        "underscore":           "/webwork3/modules/underscore/underscore",
        "jquery-ui":            "/webwork3/modules/jquery-ui/ui",
        "jquery":               "/webwork3/modules/jquery/dist/jquery",
        "bootstrap":            "/webwork3/modules/bootstrap/dist/js/bootstrap.bundle",
        "moment":               "/webwork3/modules/moment/moment",
        "stickit":              "/webwork3/modules/backbone.stickit/backbone.stickit",
        "imagesloaded":         "/webwork3/modules/imagesloaded/imagesloaded",
        //"jquery-truncate":      "/webwork3/modules/jquery-truncate/jquery.truncate",
        "blob":                 "/webwork3/modules/blob/Blob",
        "file-saver":           "/webwork3/modules/file-saver/FileSaver",
        "ev-emitter/ev-emitter":"/webwork3/modules/ev-emitter/ev-emitter", // NEEDED in this form by imagesloaded
        "knowl":                "/webwork2_files/js/vendor/other/knowl",
        "Base64":               "/webwork2_files/js/apps/Base64/Base64",
        "jquery-csv":           "/webwork3/modules/jquery-csv/src/jquery.csv",
        "views":                "/webwork3/js/views",
        "models":               "/webwork3/js/models",
        "apps":                 "/webwork3/js/apps",
        "config":               "/webwork3/js/apps/config"
    },
    packages: [
         {
            name: "codemirror",
            location: "/webwork3/modules/codemirror",
            main: "lib/codemirror"
    }],
    //urlArgs: "bust=" +  (new Date()).getTime(),
    waitSeconds: 10,
    shim: {
        'underscore': { deps: ['jquery'], exports: '_' },
        'backbone': { deps: ['underscore', 'jquery'], exports: 'backbone'},
        'bootstrap':{ deps: ['jquery']}, // saying that bootstrap requires jquery-ui makes bootstrap (javascript) buttons work.
        'backbone-validation': ['backbone'],
        'jquery-ui': ['apps/bs-button'],  // setup a conflict-free button situation

        // 'stickit': ["backbone","jquery"],
        // 'datepicker': ['bootstrap'],
        // //'jquery-truncate': ['jquery'],
        // //'editablegrid': {deps: ['jquery'], exports: 'EditableGrid'},
        // 'blob': {exports : 'Blob'},
        'imagesloaded': ['jquery','ev-emitter/ev-emitter'],
        'knowl': ['Base64','jquery']
    }
};
