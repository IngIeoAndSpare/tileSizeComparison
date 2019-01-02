// module
var fs = require('fs'),
    readLine = require('readline'),
    axios = require('axios')

// user input value
var coordinateX,
    coordinateY,
    zoomLevel,
    apiKey = '';

// menu text 
const menuText = [
    '지도 종류를 선택해 주세요. (1. vworld, 2. naver, 3. duam, 4. google)',
    'x 좌표를 입력해 주세요.',
    'y 좌표를 입력해 주세요.',
    'zoom level을 입력해 주세요.',
    'API key를 입력해 주세요.'
]

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
    initAppHandler : function () {
        //TODO : app init 
    },
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