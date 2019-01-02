// module
var fs = require('fs'),
    readLine = require('readline'),
    axios = require('axios')

// user input value
var coordinateX,
    coordinateY,
    zoomLevel,
    apiKey = '';

// url context
var vworldUrlContext = '',
    naverUrlContext = '',
    daumUrlContext = '',
    googleUrlContext = '';

// map tile save path
const mapTileSavePathContext = '';

// set module interface
var readLineInterface = readLine.createInterface(process.sdtin, process.stdout, null);

module.exports = {
    doRequestMapTile : function (url) {
        //TODO : map tile request
        axios.get(url).then(response => {

        }).catch(err => {

        });
    },
    getUserInput : function () {
        //TODO : coordinate request, map vender request
    },
    validation : function (inputValue, vender) {
        //TODO : validation user input value

    },

}