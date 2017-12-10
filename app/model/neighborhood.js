//sample model
function Neighborhood(polygon,id,name,value){
    "use strict";
    
    this.polygon = polygon;
    this.id = id;
    this.name = name;
    this.value = value;
    this.allListings = []; //array of listing ids
    this.crimeData = "";
    this.metroStops = []; //[{lat: 22.33, long: 23.33},{lat: 22.33, long: 23.33}]

    //constructor

    //BLOCK: setters
    this.setAllListings = function (listings) { 
        this.allListings = listings;
    };

    this.setCrimeData = function(){

    }

    this.setMetroStops = function(){

    }

    //BLOCK: getters

    this.getAllListings = function () {
        return this.allListings;
    };

    this.getCrimeData = function(){
        return this.crimeData;
    }

    this.getMetroStops = function(){
        return this.metroStops;
    }


    //BLOCK: utility functions

}