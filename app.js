// module
var fs = require('fs'),
	readLineSync = require('readline-sync'),
	axios = require('axios'),
    checkSize = require('get-folder-size');

// user input value 16x8 size request
var userInputData = []; // 0. vender 1. coordinateX, 2. coordinateY, 3. zoomLevel, 4. location name ,5. apiKey(option)

// menu text 
const menuText = [
    '지도 종류를 선택해 주세요. (1. vworld, 2. naver, 3. duam, 4. google, 5. vwolrd(2018ver)) => ',
    'x 좌표를 입력해 주세요. => ',
    'y 좌표를 입력해 주세요. => ',
    'zoom level을 입력해 주세요. => ',
	'장소를 입력해 주세요.=> ',
	'API Key를 입력해 주세요. => '
]
const subMenu = [
	'설악산 (x: y: z:), 독도(x: y: z:), 대전 정부청사(x: y: z:)',
	'설악산 (x: y: z:), 독도(x: y: z:), 대전 정부청사(x: y: z:)',
	'설악산 (x: y: z:), 독도(x: y: z:), 대전 정부청사(x: y: z:)',
	'설악산 (x: y: z:), 독도(x: y: z:), 대전 정부청사(x: y: z:)'
]
const mapVender = [
	'vworld', 'naver', 'daum', 'google', 'vworld2018'
]
// url context
var vworldUrlContext = 'http://xdworld.vworld.kr:8080/XDServer/3DData?Version=2.0.0.0&Request=GetLayer&Layer=tile_mo_HD', //Level=12&IDX=34939&IDY=14471&Key=...',
    naverUrlContext = 'https://simg.pstatic.net/onetile/get', //  197/0/1/11/1750/1223/bl_st_bg (x/y)
    daumUrlContext = 'http://map0.daumcdn.net/map_skyview', //  L6/187/130.jpg?v=160114',
	googleUrlContext = 'https://khms0.google.co.kr/kh',  //v=821?x=3499&y=1602&z=12',
	vwolrdUrlContext2018 = 'http://xdworld.vworld.kr:8080/XDServer/requestLayerNode?Layer=2018'; //Level=12&IDX=34939&IDY=14471&APIKey=...';

module.exports = {
    initAppHandler : function () {
        const thisApp = this;
		this.getUserInput();  // input user select
		// setting coordinate 
		let coordinateX = Number(userInputData[1]),
			coordinateY = Number(userInputData[2]),
			vender = mapVender[Number(userInputData[0]) - 1] + '_' + userInputData[4];
		// check dir and mkdir
		this.checkDirectory(vender);

		// request image tile loop 16x8 size
		for(let x = coordinateX; x < coordinateX + 16; x++) {
			for(let y = coordinateY; y < coordinateY + 8; y++) {
				// file metadata setting
				let tileInfo = {
					vender,
					coordinateSet : {
						x, y
					},
					zoomLevel : Number(userInputData[3])
				};
				// request image tile
				thisApp.doRequestMapTile(thisApp.setUrl(x, y), tileInfo);
			}
		}
    },
    doRequestMapTile : function (url,tileInfo) {
		const thisApp = this;
        axios.get(url, {
			responseType : 'arraybuffer'
		}).then(response => {
			// convert response (image => base 64)
			let imageResult = new Buffer(response.data, 'binary').toString('base64');
			thisApp.saveTile(imageResult, tileInfo);
        }).catch(err => {
			console.log('get tile data err =>  x: ' + tileInfo.coordinateSet.x + '  y: ' + tileInfo.coordinateSet.y + '  zoom: ' + tileInfo.zoomLevel);
			console.log(err);
        });
    },
    saveTile : function (data, tileInfo) {
		const thisApp = this;
		let imageName = tileInfo.coordinateSet.x + '_' + tileInfo.coordinateSet.y + '_' + tileInfo.zoomLevel + '.jpg',
			folderPath = './' + tileInfo.vender;

		//create tile image file
		fs.writeFile(folderPath + '/' + imageName , data, {encoding : 'base64'}, function (err) {
			if(!err) {
				console.log(imageName + ' fileCreate');
				// add file size
				thisApp.addFileSize(folderPath + '/' + imageName);
			} else {
				console.log(err);
			}
		});
	},
	checkDirectory : function (vender) {
		// check directory and mkdir
		let mapTileSavePath = './' + vender;
		if(!fs.existsSync(mapTileSavePath)) {
			fs.mkdirSync(mapTileSavePath);
		}
	},
	addFileSize : function (path) {
		checkSize(path, (err, size) => {
			if(err) {
				console.log(path + 'file read size err. check file');
				console.log(err);
			} else {
				let fileSize = (size/2014).toFixed(2);
				console.log(fileSize + 'KB');
			}
		});
	},
    getUserInput : function () {
		for(let consoleLine of menuText) {
			userInputData.push(readLineSync.question(consoleLine));
		}
	},
    setUrl : function (x, y) {
		let url;
		switch(Number(userInputData[0])) {
			case 1 :
				url = vworldUrlContext + '&Level=' + Number(userInputData[3]) + '&IDX=' + x + '&IDY=' + y + '&Key=' + userInputData[5] ;
				break;
			case 2 :
				url = naverUrlContext + '/197/0/1/' + Number(userInputData[3]) + '/' + x + '/' + y + '/bl_st_bg';;
				break;
			case 3 :
				url = daumUrlContext + '/L' + Number(userInputData[3]) + '/' + y + '/' + x + '.jpg?v=160114';
				break;
			case 4 :
				url = googleUrlContext + '/v=821?x=' + x + '&y=' + y + '&z=' + Number(userInputData[3]);
				break;
			case 5 :
				url = vwolrdUrlContext2018 + '&Level=' + Number(userInputData[3]) + '&IDX=' + x + '&IDY=' + y + '&APIKey=' + userInputData[5] ;;
				break;
		}
		return url;
    },
}
