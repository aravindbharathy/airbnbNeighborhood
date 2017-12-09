

//BLOCK: Initialize variables
var neighborhoods = []; //list of all neighborhoods stored as objects
var listings = []; //list of all listings stored as objects

    
//BLOCK: Initialize controls

// Create the Google Map…
var map = new google.maps.Map(d3.select("#map").node(), {
  zoom: 13,
  center: new google.maps.LatLng(41.8750748 , -87.6514596),
  mapTypeId: google.maps.MapTypeId.roadmap
});

//Create a geoXML parser for KML neighborhood
var neighborhoodParser = new geoXML3.parser({map: map});


function initialize(callback){
    neighborhoodParser.parse('../../data/neighborhoods.kml');
    callback();
}

function loadData(){
    //TODO: parse neighborhood data from neighborhoodParser and populate neighborhoods array  - Aravind





    // Load the listings data.
    d3.json("data/listings.json", function(error, data) {
        if (error) throw error;

        //TODO: parse listings data and populate listings array 




        //TODO: assign listing ids to each neighborhood : call neighborhood.setAllListings()




        //TODO: assign walk scores to each listing - Hung Wen



    });

    // Load the metro data.
    d3.json("data/Chicago_Metro_Stop_Data.json", function(error, data) {
        if (error) throw error;

      
    });

}


//call initialize
initialize(function(){
    loadData();
});


function displayListings(data){
     var overlay = new google.maps.OverlayView();

      // Add the container when the overlay is added to the map.
      overlay.onAdd = function() {
        var layer = d3.select(this.getPanes().overlayLayer).append("div")
            .attr("class", "listings");

        // Draw each marker as a separate SVG element.
        overlay.draw = function() {
          var projection = this.getProjection(),
              padding = 10;

          var marker = layer.selectAll("svg")
              .data(d3.entries(data))
              .each(transform) // update existing markers
            .enter().append("svg")
              .each(transform)
              .attr("class", "marker");

          // Add a circle.
          marker.append("circle")
              .attr("r", 2.5)
              .attr("cx", padding)
              .attr("cy", padding);

          // Add a label.
          // marker.append("text")
          //     .attr("x", padding + 7)
          //     .attr("y", padding)
          //     .attr("dy", ".31em")
          //     .text(function(d) { return d.key; });

          function transform(d) {
            d = new google.maps.LatLng(d.value.latitude, d.value.longitude);
            d = projection.fromLatLngToDivPixel(d);
            return d3.select(this)
                .style("left", (d.x - padding) + "px")
                .style("top", (d.y - padding) + "px");
          }
        };
      };

      // Bind our overlay to the map…
      overlay.setMap(map);
}


function displayMetros(data){
    var overlay = new google.maps.OverlayView();

      // Add the container when the overlay is added to the map.
      overlay.onAdd = function() {
        var layer = d3.select(this.getPanes().overlayLayer).append("div")
            .attr("class", "metro");

        // Draw each marker as a separate SVG element.
        overlay.draw = function() {
          var projection = this.getProjection(),
              padding = 10;

          var marker = layer.selectAll("svg")
              .data(d3.entries(data))
              .each(transform) // update existing markers
            .enter().append("svg")
              .each(transform)
              .attr("class", "marker");

          // Add a circle.
          marker.append("circle")
              .attr("r", 4.5)
              .attr("cx", padding)
              .attr("cy", padding);

          // Add a label.
          // marker.append("text")
          //     .attr("x", padding + 7)
          //     .attr("y", padding)
          //     .attr("dy", ".31em")
          //     .text(function(d) { return d.key; });

          function transform(d) {
            var temp = parseTuple(d.value.Location);
            d = new google.maps.LatLng(temp[0][0], temp[0][1]);
            d = projection.fromLatLngToDivPixel(d);
            return d3.select(this)
                .style("left", (d.x - padding) + "px")
                .style("top", (d.y - padding) + "px");
          }

          function parseTuple(t) {
                var items = t.replace(/^\(|\)$/g, "").split("),(");
                items.forEach(function(val, index, array) {
                   array[index] = val.split(",").map(Number);
                });
                return items;
            }
        };
      };

      // Bind our overlay to the map…
      overlay.setMap(map);
}
