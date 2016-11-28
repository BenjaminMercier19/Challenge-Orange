(function(){

  angular
       .module('map')
       .controller('MapController',  [
          MapController
       ]);

  /**
   * Main Controller for the Angular Material Starter App
   * @constructor
   */
  function MapController() {
    var self = this;
    // Datasync
    self.usersDatasync = new Webcom('https://io.datasync.orange.com/base/hackathon/users');
    self.areaDatasync =  new Webcom('https://io.datasync.orange.com/base/hackathon/areas');
    self.users = [];
    self.areas = [];

    /**
     * Set up Datasync info to watch child added event
     *
     */
    self.usersDatasync.on('child_added', function(snapUser){
      console.log("user",  snapUser.val());
      var user = snapUser.val();
      user.marker = new google.maps.Marker({
        position: new google.maps.LatLng(user.lat, user.lng),
        map: self.map,
        title: 'Hello World!'
      });
      self.users.push(user);
    });

    /**
     * Sync data changed for users location !
     *
     */
    self.usersDatasync.on("child_changed", function(snapUser){
      console.log("child_changed");
      var user = snapUser.val();
      for(var i = 0; i < self.users.length; i++)
      {
        if(self.users[i].id == user.id)
        {
          self.users[i].marker.setPosition(new google.maps.LatLng(user.lat, user.lng));
        }
      };
    });

    /**
     * Get areas
     *
     */
    self.areaDatasync.on("child_added", function(snapArea){
      var area = snapArea.val();

      console.log(area);

      var polygonCoors = [];
      for (var i in area.geometry.coordinates[0]) {
        if (area.geometry.coordinates[0].hasOwnProperty(i)) {
          var coor = area.geometry.coordinates[0][i];
          console.log(coor);
          polygonCoors.push({lat: coor[1], lng: coor[0]});
        }
      }

      var polygon = new google.maps.Polygon({
        paths: polygonCoors
      });

      polygon.setMap(self.map);
    });

    self.initMap = function(){
      self.map = new google.maps.Map(document.getElementById('map_canvas'), {
        center: new google.maps.LatLng(48.8008313,2.2950299),
        zoom: 19
      });

      var imageBounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(48.799784232891696, 2.2937208072014528), // bottom left corner
        new google.maps.LatLng(48.80129773796974, 2.2960765902823823)  // top right corner
      );

      historicalOverlay = new google.maps.GroundOverlay('/assets/images/imgaPlanViergeRotate.png', imageBounds, {clickable: false});
      historicalOverlay.setMap(self.map);
    };
  }

})();
