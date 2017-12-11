//BLOCK: Initialize variables
var neighborhoods = []; //list of all neighborhoods stored as objects
var listings = []; //list of all listings stored as objects
var inputWalkScoreRange={"min":0, "max":100};
var outputWalkScoreRange={"min":0, "max":3};
var hashMap = new Map();
var isZoomed = false;
    
//BLOCK: Initialize controls

// Create the Google Map…
var map = new google.maps.Map(d3.select("#map").node(), {
  zoom: 13,
  center: new google.maps.LatLng(41.8750748 , -87.6514596),
  mapTypeId: google.maps.MapTypeId.roadmap
});

google.maps.Polygon.prototype.getBounds = function() {
    var bounds = new google.maps.LatLngBounds();
    this.getPath().forEach(function(element,index){ bounds.extend(element); });
    return bounds;
}

google.maps.Polygon.prototype.getApproximateCenter = function() {
  var boundsHeight = 0,
      boundsWidth = 0,
      centerPoint,
      heightIncr = 0,
      maxSearchLoops,
      maxSearchSteps = 10,
      n = 1,
      northWest,
      polygonBounds = this.getBounds(),
      testPos,
      widthIncr = 0;


  // Get polygon Centroid
  centerPoint = polygonBounds.getCenter();
  return centerPoint;
};

//Create a geoXML parser for KML neighborhood
var iconBase = 'https://maps.google.com/mapfiles/kml/shapes/';
    var icons = {
       parking: {
         icon: iconBase + 'parking_lot_maps.png'
       },
       library: {
         icon: iconBase + 'library_maps.png'
       },
       info: {
         icon: iconBase + 'info-i_maps.png'
       }
};
var  neighborhoodParser = new geoXML3.parser(
        {
            map: map,
            singleInfoWindow: false,
            zoom: false,
            createMarker: function (placemark, doc, neighborhood, polygon) {
                // var contentString = '<div id="content">'+
                //                     '<div id="siteNotice">'+
                //                     '</div>'+
                //                     '<h1 id="firstHeading" class="firstHeading">'+ neighborhood.name +'</h1>'+
                //                     '<div id="bodyContent">'+
                //                     '<p><b>Uluru</b>, also referred to as <b>Ayers Rock</b>, is a large ' +
                //                     'sandstone rock formation in the southern part of the '+
                //                     'Northern Territory, central Australia. It lies 335&#160;km (208&#160;mi) '+
                //                     'south west of the nearest large town, Alice Springs; 450&#160;km '+
                //                     '(280&#160;mi) by road. Kata Tjuta and Uluru are the two major '+
                //                     'Heritage Site.</p>'+
                //                     '<p>Attribution: Uluru, <a href="https://en.wikipedia.org/w/index.php?title=Uluru&oldid=297882194">'+
                //                     'https://en.wikipedia.org/w/index.php?title=Uluru</a> '+
                //                     '(last visited June 22, 2009).</p>'+
                //                     '<button class="btn-primary btn-close" onclick="zoomOut()">Close</button>'+
                //                     '</div>'+
                //                     '</div>';

                // var infowindow = new google.maps.InfoWindow({
                //         minWidth:150, 
                //         maxWidth:400,
                //         content: contentString
                //     });

                // var markerImage = {
                //    url: icons["info"].icon,
                //    size: new google.maps.Size(8, 8),
                //    origin: null,
                //    anchor: null,
                //    scaledSize: new google.maps.Size(8, 8)
                // };

                // var marker=new google.maps.Marker({
                //         title: placemark.vars.val.pri_neigh,
                //         position: polygon.getApproximateCenter(),    
                //         map: map,
                //         icon: icons["info"].icon
                //     });        

                // google.maps.event.addListener(marker, 'mouseover', function() {
                //     infowindow.open(map,marker);
                // });

                // google.maps.event.addListener(marker, 'mouseout', function() {
                //     if(!isZoomed){
                //         infowindow.close(map,marker);    
                //     }                    
                // });

                //  google.maps.event.addListener(marker, 'click', function() {
                //     this.getMap().setCenter(this.getPosition());
                //     this.getMap().setZoom(14);
                //     isZoomed = true;
                //     infowindow.open(map,marker);
                //     placemark.polygon.setOptions({fillColor: "#000", strokeColor: "#000000", fillOpacity: 0, strokeWidth: 20});
                //     displayHeatMap(neighborhood.getAllListings());
                //    // displayListings(neighborhood.getAllListings());

                // });

                //return marker;
            },
            afterParse:function(docs){
                if (docs[0].gpolygons.length>0){ 
                    var colorScale = d3.scale.linear().range([0,255]).domain([1,100]);
                    for(var i = 0; i < docs[0].gpolygons.length; i++){
                        var polygon = docs[0].gpolygons[i];
                        var id = docs[0].placemarks[i].vars.val.sec_neigh;
                        var name = docs[0].placemarks[i].vars.val.pri_neigh;
                        var val = Math.floor(Math.random() * 100) + 1;
                        var color = "rgb(" + Math.floor(colorScale(val)) + "," + Math.floor(colorScale(val)) + ",255)";
                        docs[0].placemarks[i].polygon.setOptions({fillColor: color, strokeColor: "#000000", fillOpacity: 0.5, strokeWidth: 10});
                        var neighborhood = new Neighborhood(polygon,id,name,val);
                        neighborhood.setAllListings(hashMap.get(name));
                        if(typeof neighborhood.getAllListings() == 'undefined'){
                             neighborhoodParser.docs[0].gpolygons[i].setMap(null);
                        }
                        else{
                            neighborhoods.push(neighborhood);
                            //this.createMarker(docs[0].placemarks[i],docs[0],neighborhood,polygon);    
                            //console.log(name);
                            setPopup(polygon,neighborhood);
                            
                        }


                        
                        
                    }
                
                    console.log(neighborhoods);
                }else{
                    //[.....]
                }
            }

        });

function setPopup(polygon,neighborhood){
    var contentString = '<div id="content">'+
                        '<div id="siteNotice">'+
                        '</div>'+
                        '<h1 id="firstHeading" class="firstHeading">'+ neighborhood.name +'</h1>'+
                        '<div id="bodyContent">'+
                        '<p><b>Uluru</b>, also referred to as <b>Ayers Rock</b>, is a large ' +
                        'sandstone rock formation in the southern part of the '+
                        'Northern Territory, central Australia. It lies 335&#160;km (208&#160;mi) '+
                        'south west of the nearest large town, Alice Springs; 450&#160;km '+
                        '(280&#160;mi) by road. Kata Tjuta and Uluru are the two major '+
                        'Heritage Site.</p>'+
                        '<p>Attribution: Uluru, <a href="https://en.wikipedia.org/w/index.php?title=Uluru&oldid=297882194">'+
                        'https://en.wikipedia.org/w/index.php?title=Uluru</a> '+
                        '(last visited June 22, 2009).</p>'+
                        '<button class="btn-primary btn-close" onclick="zoomOut()">Close</button>'+
                        '</div>'+
                        '</div>';

    var infowindow = new google.maps.InfoWindow({
            minWidth:150, 
            maxWidth:400,
            content: contentString
        });

    var marker=new google.maps.Marker({
            title: name,
            position: polygon.getApproximateCenter(),
            map: map,
            icon: "../images/transparent-square-tiles/png"             
        });        

    google.maps.event.addListener(polygon,"mouseover",function() {                                
       // console.log(polygon);
        if(!isZoomed){
            infowindow.open(map,marker);
        }
    });

    google.maps.event.addListener(polygon,"mouseout",function() {
       // console.log("out");
        infowindow.close(map,marker);
    });

    google.maps.event.addListener(polygon, 'click', function() {
        this.getMap().setCenter(this.getApproximateCenter());
        this.getMap().setZoom(14);
        isZoomed = true;
        infowindow.close(map,marker);
        this.setOptions({fillColor: "#000", strokeColor: "#000000", fillOpacity: 0, strokeWidth: 20});
        displayHeatMap(neighborhood.getAllListings());
        displayListings(neighborhood.getAllListings());
    });
}

function zoomOut(){
    console.log("click");  
    isZoomed = false;
    map.setZoom(12);
}

function initialize(){
    loadData();
}

function loadData(){
    // Load the listings data.
    // assign listing ids to each neighborhood : call neighborhood.setAllListings()
    // assign walk scores to each listing -  read score from json -Hung Wen 
    queue()
        .defer(d3.json, "data/listings_all.json")
        .defer(d3.json, "data/score.json")
        .await(ready);

    function ready(error, datalistings, dataScore) {
        if (error) throw error;
        //TODO: parse listings data and populate listings array 
        for (var i = 0; i < datalistings.length; i++) { 
            let lat = datalistings[i].latitude;
            let lon = datalistings[i].longitude;
            let address = datalistings[i].street;
            let room_type = datalistings[i].room_type;
            let list = new Listings();
            if (room_type === "Entire home/apt") {
              datalistings[i].room_type = 2;
            } else if (room_type === "Private room") {
              datalistings[i].room_type = 1;
            } else {
              datalistings[i].room_type = 0;
            }
            if (hashMap.has(datalistings[i].neighbourhood_cleansed)) {
                hashMap.get(datalistings[i].neighbourhood_cleansed).push(i);
            } else {
                var element = [];
                element.push(i);
                hashMap.set(datalistings[i].neighbourhood_cleansed, element);
            }
            list.createListing(datalistings[i].id, datalistings[i].name, datalistings[i].latitude, datalistings[i].longitude, datalistings[i].room_type, datalistings[i].price, datalistings[i].street);
            list.walkScore = calculateScale(dataScore[i], inputWalkScoreRange, outputWalkScoreRange);
            listings.push(list);

        }

        neighborhoodParser.parse('../../data/neighborhoods.kml');
    }


    // Load the metro data.
    d3.json("data/Chicago_Metro_Stop_Data.json", function(error, data) {
        if (error) throw error;

      
    });
}

function calculateScale(input, inputDomain, outputRange){
    //helper function to scale values 
    var inputDiff = inputDomain.max - inputDomain.min;
    var outputDiff = outputRange.max - outputRange.min;
    if ((input - inputDomain.min) == 0) {
      return (outputRange.min);
    }
    return (input - inputDomain.min) / inputDiff * outputDiff + outputRange.min
}


//call initialize
initialize();


function displayListings(allListings){
    let data = [];
    for (var i = 0; i < allListings.length; i++) {
        let index = allListings[i];
        data.push({lat : listings[index].lat, lng: listings[index].long});
    }
    console.log(data);
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
            console.log(d);
            d = new google.maps.LatLng(d.value.lat, d.value.lng);
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


function displayHeatMap(allListings){
    if (typeof(allListings) !== 'undefined'){
        let heatMapData = [];
        for (var i = 0; i < allListings.length; i++) {
            let index = allListings[i];
            heatMapData.push({location:new google.maps.LatLng(listings[index].lat, listings[index].long), weight: listings[index].walkScore});
        }
        var heatmap = new google.maps.visualization.HeatmapLayer({
          data: heatMapData
        });
        heatmap.setMap(map);
    }
}
