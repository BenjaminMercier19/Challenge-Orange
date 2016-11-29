(function(){

  angular
       .module('map')
       .controller('MapController',  [
          '$scope', '$http', '$mdDialog', MapController
       ]);

  /**
   * Main Controller for the Angular Material Starter App
   * @constructor
   */
  function MapController($scope, $http, $mdDialog) {
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
          self.calculateUserPerArea();
          checkIfUsersAreaOvercrowded(self.users[i]);
        }
      };

    });

    function checkIfUsersAreaOvercrowded(user)
    {
      if(user.metadata.currentArea)
      {
        var area = user.metadata.currentArea.area;
        if(area.metadata.containedUsers > area.metadata.numMaxPeople)
        {
          showAlert(area.metadata.name);
        }
      }
    }

    function clickedArea() {
      var area = this;

      $scope.$apply(function () {
        self.currentSelectedUser = undefined;
        self.currentSelectedArea = area;
      });
    }

    function clickedUser() {
      var user = this;

      $scope.$apply(function () {
        self.currentSelectedArea = undefined;
        self.currentSelectedUser = user;
      });
    }

    self.calculateUserPerArea = function()
    {
      var users = self.users.slice();
      for(var a = 0; a < self.areas.length; a++)
      {
        var area = self.areas[a];
        area.metadata.containedUsers = 0;
        for(var u = users.length - 1; u >=0 ; u--)
        {
          var user = users[u];
          user.metadata.currentArea = null;

          if(google.maps.geometry.poly.containsLocation(user.getPosition(), area))
          {
            area.metadata.containedUsers ++;
            user.metadata.currentArea = {
              "area": area.metadata,
              "enteredAt": new Date().getTime()
            }
            self.users[u] = user;

            //Check if currentArea in synced data is same as here, then get time
            self.usersDatasync.child(user.metadata.id).on("value", function(snapUser){
              var storedUser = snapUser.val();
              if(storedUser && storedUser.currentArea && storedUser.currentArea.area.id == user.metadata.currentArea.area.id) {
                user.metadata = storedUser;
              }
              else {
                if(user.metadata)
                {
                  self.usersDatasync.child(user.metadata.id).set(user.metadata);

                }
              }
              self.usersDatasync.child(user.metadata.id).off("value");
            })
            users.splice(u,1);

          }
        }
        /*if(area.metadata.containedUsers > area.metadata.numMaxPeople)
        {
          showAlert(area.metadata.name);
        }*/
      }
    }

    self.areaDatasync.on("child_changed", function(snapArea){

      var area = snapArea.val();

      for(var i = 0; i < self.areas.length; i++)
      {
        if(self.areas[i].metadata.id == area.metadata.id)
        {
          console.log(area.metadata.security_level)
          switch (area.metadata.security_level) {
            case 1:
              polygonColor = "#e2574a";
              break;
            case 2:
              polygonColor = "#1d92d6";
              break;
            case 3:
              polygonColor = "#24c942";
              break;
            default:

          }
          self.areas[i].setOptions({fillColor : polygonColor});
          break;
        }
      };

      //Check users in the zone
      if(area.metadata.security_level == 1)
      {
        for(var i = 0; i < self.users.length; i++)
        {
          if(self.users[i].metadata.currentArea && self.users[i].metadata.currentArea.area.id == area.metadata.id)
          {
            console.log("Warning user");
            warnUser();
          }
        }
      }
    });
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
      var polygonColor = "#7f8896";
      switch (area.metadata.security_level) {
       case 1:
         polygonColor = "#e2574a";
         break;
       case 2:
         polygonColor = "#1d92d6";
         break;
       case 3:
         polygonColor = "#24c942";
         break;
       default:

     }

     var polygon = new google.maps.Polygon({
       paths: polygonCoors,
       fillColor: polygonColor,
       fillOpacity: 0.8,
       metadata: area
     });


      polygon.metadata = area.metadata;

      polygon.addListener('click', clickedArea)

      polygon.setMap(self.map);
      self.areas.push(polygon);
      if(self.areas.length == 5)
      {
        self.calculateUserPerArea();
      }
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

    function warnUser()
    {
      /*  $http({
        method: 'GET',
        url: 'http://10.0.0.51:8000/advert-user'
      }).then(function successCallback(response) {
        console.log("user has been warned")
      }, function errorCallback(response) {
        console.log(response);
      });*/
      $http.post('http://odc.kermit.orange-labs.fr/post/866224023460388', {'securityArea':'on'}).then(function(response){return response;});

    }

    function showAlert(areaName){
      var message = "Trop de personnes dans la zone: " + areaName + ", ceux-ci ont été averti";
      $mdDialog.show(
        $mdDialog.alert()
          .clickOutsideToClose(true)
          .title('Danger')
          .textContent(message)
          .ariaLabel('Alert Dialog Demo')
          .ok('ok!')
      );
    };

  }

})();
