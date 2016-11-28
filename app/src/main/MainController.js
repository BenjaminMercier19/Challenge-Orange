(function(){

  angular
       .module('main')
       .controller('MainController',  ['$mdSidenav', '$location',
          MainController
       ]);

  /**
   * Main Controller for the Angular Material Starter App
   * @constructor
   */
  function MainController($mdSidenav, $location) {
    var self = this;
    // Datasync
    self.fds = new Webcom('https://io.datasync.orange.com/base/hackathon/users');
    self.menus = [
      {
        "name": "Manage users",
        "route": "/users",
      },
      {
        "name": "Manage areas",
        "route": "",
      },
      {
        "name": "Live map",
        "route": "/map",
      },
    ];

    self.selectMenu = function(menu)
    {
      self.selected = angular.isNumber(menu) ? self.menus[menu] : menu;
      $location.path(menu.route);
    };

    self.toggleMenu = function() {
      $mdSidenav('left').toggle();
    };

    /**
     * Set up Datasync info to watch child added event
     *
     */
     /*self.fds.on('child_added', function(snap){
       console.info(snap.val());
     });*/

  }

})();
