// module
var fs = require('fs'),
    readLine = require('readline'),
    axios = require('axios'),
    path = require('path');

// user input value 16x8 size request
var userInputData = []; // 0. vender 1. coordinateX, 2. coordinateY, 3. zoomLevel, 4. apiKey(option)

// menu text 
const menuText = [
    '지도 종류를 선택해 주세요. (1. vworld, 2. naver, 3. duam, 4. google)',
    'x 좌표를 입력해 주세요.',
    'y 좌표를 입력해 주세요.',
    'zoom level을 입력해 주세요.',
    'API key를 입력해 주세요.'
]
const subMenuText = [
	''
]

// url context
var vworldUrlContext = '',
    naverUrlContext = 'https://simg.pstatic.net/onetile/get/', //  197/0/1/11/1750/1223/bl_st_bg
    daumUrlContext = 'http://map0.daumcdn.net/map_skyview/', //  L6/187/130.jpg?v=160114',
    googleUrlContext = 'https://khms0.google.co.kr/kh/; //  v=821?x=3499&y=1602&z=12';

// set module interface
var readLineInterface = readLine.createInterface(process.sdtin, process.stdout, null);

module.exports = {
    initAppHandler : function () {
        //TODO : app init
	getUserInput();
	 
    },
    doRequestMapTile : function (url, vender, coordinateSet, zoomLevel) {
	var saveInfo = {
		vender,
		coordinateSet,
		zoomLevel		
	};

        axios.get(url).then(response => {
		//TODO : check response data
		return response;
        }).catch(err => {
		console.log(err);
		return null;
        });
    },
    saveTile : function (data, tileInfo) {
	//TODO : tile save
	let maptileSavePath = path.resolve(__dirname, tileInfo.vender, tileInfo.coordinateSet.x +'_'+ tileInfo.coordinateSet.y
				+ '_' + tileInfo.zoomLevel + '.jpg';
	  	
	
    },
    getUserInput : function () {
	for(let consoleLine of menuText) {
		readLineInterface.question(consoleLine, function(answer) {
			userInputData.push(answer);
		});
	}
    },
}
