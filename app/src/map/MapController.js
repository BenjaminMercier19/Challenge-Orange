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
    self.fds = new Webcom('https://io.datasync.orange.com/base/hackathon/users');
    /**
     * Set up Datasync info to watch child added event
     *
     */
     self.fds.on('child_added', function(snap){
       alert("child_added");
       console.info(snap.val());
     });

     self.initMap = function(){
       console.log('test')
      self.map = new google.maps.Map(document.getElementById('map_canvas'), {
        center: new google.maps.LatLng(48.8008313,2.2950299),
        zoom: 8
      });
     var imageBounds = new google.maps.LatLngBounds(
       new google.maps.LatLng(48.799784232891696, 2.2937208072014528), // bottom left corner
       new google.maps.LatLng(48.80129773796974, 2.2960765902823823)  // top right corner
    );

   historicalOverlay = new google.maps.GroundOverlay('/assets/images/imgaPlanViergeRotate.png', imageBounds, {clickable: false});
   historicalOverlay.setMap(self.map);


     }
  }

})();
