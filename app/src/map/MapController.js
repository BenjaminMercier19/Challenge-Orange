(function(){

  angular
       .module('map')
       .controller('MapController',  [
          '$scope', MapController
       ]);

  /**
   * Main Controller for the Angular Material Starter App
   * @constructor
   */
  function MapController($scope) {
    var self = this;
    // Datasync
    self.usersDatasync = new Webcom('https://io.datasync.orange.com/base/hackathon/users');
    self.areaDatasync =  new Webcom('https://io.datasync.orange.com/base/hackathon/areas');
    self.users = [];
    self.areas = [];
    
    self.securityLevels = [
      {value: 1, name: "Quarantaine"},
      {value: 2, name: "Habilité"},
      {value: 3, name: "Ouvert"},
    ];
    self.usersLevels = {
      "worker_level1": "Ouvrier",
      "manager_level1": "Chef de BU"
    };
    
    self.currentSelectedArea = undefined;
    self.currentSelectedUser = undefined;

    /**
     * Set up Datasync info to watch child added event
     *
     */
    self.usersDatasync.on('child_added', function(snapUser){
      console.log("user",  snapUser.val());
      var user = snapUser.val();
      var marker = new google.maps.Marker({
        position: new google.maps.LatLng(user.lat, user.lng),
        map: self.map,
        metadata: user
      });
      
      marker.addListener("click", clickedUser);
      
      self.users.push(marker);
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
        if(self.users[i].metadata.id == user.id)
        {
          self.users[i].setPosition(new google.maps.LatLng(user.lat, user.lng));
        }
      };
      self.calculateUserPerArea();
    });
    
    function clickedArea() {
      console.log(this);
      var area = this;
      
      $scope.$apply(function () {
        self.currentSelectedUser = undefined;
        self.currentSelectedArea = area;
      });
    }
    
    function clickedUser() {
      console.log(this);
      var user = this;
      
      $scope.$apply(function () {
        self.currentSelectedArea = undefined;
        self.currentSelectedUser = user;
      });
    }

    self.calculateUserPerArea = function()
    {
      for(var a = 0; a < self.areas.length; a++)
      {
        var area = self.areas[a];
        area.metadata.containedUsers = 0;
        for(var u = 0; u < self.users.length; u++)
        {
          var user = self.users[u];
          
          user.metadata.currentArea = null;
          
          if(google.maps.geometry.poly.containsLocation(user.getPosition(), area))
          {
            area.metadata.containedUsers ++;
            user.metadata.currentArea = area.metadata.id;
          }
          console.log(area);
        }
      }
    }

    /**
     * Get areas
     *
     */
    self.areaDatasync.on("child_added", function(snapArea){
      var area = snapArea.val();

      var polygonCoors = [];
      // transform GeoJson coordinates to Polygon coordinates
      for (var i in area.geometry.coordinates[0]) {
        if (area.geometry.coordinates[0].hasOwnProperty(i)) {
          var coor = area.geometry.coordinates[0][i];
          polygonCoors.push({lat: coor[1], lng: coor[0]});
        }
      }

      var polygon = new google.maps.Polygon({
        paths: polygonCoors,
        metadata: area
      });
      
      polygon.metadata = area.metadata;
      
      polygon.addListener('click', clickedArea)
      
      polygon.setMap(self.map);
      self.areas.push(polygon);
      self.calculateUserPerArea();
    });
    
    self.changedSecurityLevel = function () {
      self.areaDatasync.child('' + self.currentSelectedArea.metadata.id + '/metadata').update(self.currentSelectedArea.metadata);
    };

    self.initMap = function(){
      self.map = new google.maps.Map(document.getElementById('map_canvas'), {
        center: new google.maps.LatLng(48.80016797520192, 2.2942496091127396),
        zoom: 17,
        mapTypeControlOptions: {
          position: google.maps.ControlPosition.RIGHT_TOP
        }
      });

      var imageBounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(48.799784232891696, 2.2937208072014528), // bottom left corner
        new google.maps.LatLng(48.80129773796974, 2.2960765902823823)  // top right corner
      );
      
      self.map.addListener('click', function () {
        $scope.$apply(function () {
          // clears the current selected area and user
          self.currentSelectedArea = undefined;
          self.currentSelectedUser = undefined;
        });
      });

      historicalOverlay = new google.maps.GroundOverlay('/assets/images/imgaPlanViergeRotate.png', imageBounds, {clickable: false});
      historicalOverlay.setMap(self.map);
    };
  }

})();
