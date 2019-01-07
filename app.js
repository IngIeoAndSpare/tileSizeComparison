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
	'API Key를 입력해 주세요. => ',
	'요청할 가로축 타일 갯수를 입력해 주세요. => ',
	'요청할 세로축 타일 갯수를 입력해 주세요. => '
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

// fileSize value
var maxSize = 0,
	minSize = 1000,
	totalSize = 0,
	imageCount = 0,
	createFileLength = 0,
	totalFileLength = 0;

// get file errer text 
var requestFailList = '';

module.exports = {
    initAppHandler : function () {
        const thisApp = this;
		this.getUserInput();  // input user select
		// setting coordinate 
		let coordinateX = Number(userInputData[1]),
			coordinateY = Number(userInputData[2]),
			getNumberX = Number(userInputData[6]),
			getNumberY = Number(userInputData[7])
			vender = mapVender[Number(userInputData[0]) - 1] + '_' + userInputData[4];
		// check dir and mkdir
		this.checkDirectory(vender);
		// set request tile Count
		totalFileLength = getNumberX * getNumberY;

		//다운 받을 지도 타일에 따라 x, y축 속성이 다르다.
		let venderFlag = (userInputData[0] == 4 ? true : false);
		// request image tile loop getNumberX x getNumberY size
		for(let x = coordinateX; x < coordinateX + getNumberX; x++) {
			// google map 만 위도 계산이 다르기에 google map 인 경우 y++ 로 실시한다.
			for(let y = coordinateY; (venderFlag ? y < coordinateY + getNumberY : y > coordinateY - getNumberY); (venderFlag ? y++ : y--)){
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
			requestFailList += 'fail request tile => x: ' + tileInfo.coordinateSet.x + '  y: ' + tileInfo.coordinateSet.y + '  zoom: ' + tileInfo.zoomLevel + '\n';
			console.log('get tile data err =>  x: ' + tileInfo.coordinateSet.x + '  y: ' + tileInfo.coordinateSet.y + '  zoom: ' + tileInfo.zoomLevel);
			console.log(err);
			createFileLength++;
        });
    },
    saveTile : function (data, tileInfo) {
		const thisApp = this;
		let imageName = tileInfo.coordinateSet.x + '_' + tileInfo.coordinateSet.y + '_' + tileInfo.zoomLevel + '.jpg',
			folderPath = './' + tileInfo.vender;
		//create tile image file
		fs.writeFile(folderPath + '/' + imageName , data, {encoding : 'base64'}, function (err) {
			if(!err) {
				createFileLength++;
				console.log(imageName + ' fileCreate');
				console.log('remain file count => ' + (totalFileLength - createFileLength));
				// add file size
				thisApp.getFileSize(folderPath, imageName);
			} else {
				createFileLength++;
				console.log(err);
				requestFailList += 'create file fail => ' + imageName;
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
	getFileSize : function (folderPath, imageName) {
		let path = folderPath + '/' + imageName;
		const thisApp = this;
		checkSize(path, (err, size) => {
			let checkImageFlag = true;
			console.log('check => ' + createFileLength);
			if(err) {
				console.log(path + 'file read size err. check file');
				console.log(err);
			} else {
				let fileSize = (size/1024).toFixed(2);
				if(fileSize < 0.2) {
					// not error code but file is not jpg
					requestFailList += imageName + ' not image. please check. \n';
					checkImageFlag = false;
				} else if(fileSize > maxSize) {
					maxSize = fileSize;
				} else if (fileSize < minSize) {
					minSize = fileSize;
				}
				if(checkImageFlag) {
					imageCount++;
					totalSize += Number(fileSize);
					console.log(fileSize + 'KB');
				}
			}
			if(totalFileLength == createFileLength) {
				totalSize = totalSize.toFixed(2); 
				let averageSize = (totalSize / imageCount).toFixed(2),
					convertTotalSize = (totalSize / 1024).toFixed(2);
				console.log('===================== result ==================');
				console.log('create imageFile => ' + imageCount);
				console.log('max File size => ' + maxSize + 'KB');
				console.log('min File size => ' + minSize + 'KB');
				console.log('total Tile size => ' + convertTotalSize + 'MB');
				console.log('average tile Size => ' + averageSize + 'KB');

				// create result txt file
				let result = 'create Image file => ' + imageCount + '\n'  +
				'max File size => ' + maxSize + 'KB \n' +
				'min File size => ' + minSize + 'KB \n' +
				'total Tile size => ' + convertTotalSize + 'MB \n'+
				'average tile Size => ' + averageSize + 'KB';			
				thisApp.createTextFile(folderPath, result, 'result.txt');
				// create fail list txt file
				thisApp.createTextFile(folderPath, requestFailList, 'failList.txt');
			}
		});
	},
	closeFs: function () {
		fs.close();
	},
	createTextFile : function (filePath, text, name) {
		let buffer = new Buffer(text);
		fs.writeFile(filePath + '/' + name, buffer, (err) => {
			if(err) {
				console.log( name +' create err. check err.');
				console.log(err);
			} else {
				console.log('create '+ name +' text file');
			}
		});
		this.closeFs();
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
