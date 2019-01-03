// module
var fileSaver = require('file-saver'),
	readLineSync = require('readline-sync'),
    axios = require('axios'),
    path = require('path');

// user input value 16x8 size request
var userInputData = [], // 0. vender 1. coordinateX, 2. coordinateY, 3. zoomLevel, 4. apiKey(option)
	requestUrl = []; // map tile request url array

// menu text 
const menuText = [
    '지도 종류를 선택해 주세요. (1. vworld, 2. naver, 3. duam, 4. google) => ',
    'x 좌표를 입력해 주세요. => ',
    'y 좌표를 입력해 주세요. => ',
    'zoom level을 입력해 주세요. => ',
    'API key를 입력해 주세요. (vworld 해당)=> '
]

// url context
var vworldUrlContext = '',
    naverUrlContext = 'https://simg.pstatic.net/onetile/get', //  197/0/1/11/1750/1223/bl_st_bg (x/y)
    daumUrlContext = 'http://map0.daumcdn.net/map_skyview', //  L6/187/130.jpg?v=160114',
    googleUrlContext = 'https://khms0.google.co.kr/kh;'  //v=821?x=3499&y=1602&z=12';

module.exports = {
    initAppHandler : function () {
        const thisApp = this;
		this.getUserInput();
		let coordinateX = Number(userInputData[1]),
			coordinateY = Number(userInputData[2]);

		for(let x = coordinateX; x < coordinateX + 16; x++) {
			for(let y = coordinateY; y < coordinateY + 8; y++) {
				requestUrl.push(thisApp.setUrl(x, y));
				// thisApp.doRequestMapTile(thisApp.setUrl(x, y));
			}
		}
		let data = this.doRequestMapTile(requestUrl[0]);
    },
    doRequestMapTile : function (url) {
        axios.get(url).then(response => {
			console.log('request ok');
			return response.data;
        }).catch(err => {
			console.log(err);
			return null;
        });
    },
    saveTile : function (data, tileInfo) {
		//TODO : tile save
		let maptileSavePath = path.resolve(__dirname, tileInfo.vender, tileInfo.coordinateSet.x +'_'+ tileInfo.coordinateSet.y + '_' + tileInfo.zoomLevel + '.jpg');
		
    },
    getUserInput : function () {
		for(let consoleLine of menuText) {
			userInputData.push(readLineSync.question(consoleLine));
		}
	},
    setUrl : function (x, y) {
		let urlArray = [vworldUrlContext, naverUrlContext, daumUrlContext, googleUrlContext];
		let url;
		switch(Number(userInputData[0])) {
			case 1 :
				url = urlArray[0]
				break;
			case 2 :
				url = urlArray[1] + '/197/0/1/' + Number(userInputData[3]) + '/' + x + '/' + y + '/bl_st_bg';
				break;
			case 3 :
				url = urlArray[2]
				break;
			case 4 :
				url = urlArray[3]
				break;
		}
		return url;
    },
}
