//sample model
function Listings(){
    "use strict";

    this.id = -1;
    this.allListings = []; //array of listing ids
    this.name = "";
    this.crimeData = "";
    this.metroStops = []; //[{lat: 22.33, long: 23.33},{lat: 22.33, long: 23.33}]

    //constructor

    //Assigned to: Aravind
    this.createNeighborhood = function(id,name){
        this.id = id;
        this.name = name;
    }

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