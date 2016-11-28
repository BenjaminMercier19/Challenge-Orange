(function(){

  angular
       .module('main')
       .controller('MainController',  ['$mdSidenav',
          MainController
       ]);

  /**
   * Main Controller for the Angular Material Starter App
   * @constructor
   */
  function MainController($mdSidenav) {
    var self = this;
    // Datasync
    self.fds = new Webcom('https://io.datasync.orange.com/base/hackathon/users');
    self.menus = [
      {
        "name": "Manage users",
        "action": "",
      },
      {
        "name": "Manage areas",
        "action": "",
      },
      {
        "name": "Live map",
        "action": "",
      },
    ];
    self.toggleMenu = function() {
      $mdSidenav('left').toggle();
    };

    /**
     * Set up Datasync info to watch child added event
     *
     */
     self.fds.on('child_added', function(snap){
       alert("child_added");
       console.info(snap.val());
     });

  }

})();
