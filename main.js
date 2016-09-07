var fs = require('fs-extra'),
	glob = require("glob"),
	moment = require('moment'),
	path = require("path"),
	exec = require('child_process').exec,
	easyimg = require('easyimage');
	var phantom = require('phantom');
	var _ph, _page, _outObj;
	var frankenstein  = require('./content/settings.js');

	var chapterFolder = frankenstein.folder;
	var contentFolder = "content/";
	var imagesFolder = "images";
	var longFolder = "long";
	var shortFolder = "short";
	var pdfFolder = "pdf";

	var imageFolderPath = contentFolder+chapterFolder+imagesFolder;
	var longFolderPath = contentFolder+chapterFolder+longFolder;
	var shortFolderPath = contentFolder+chapterFolder+shortFolder;
	var pdfFolderPath = contentFolder+chapterFolder+pdfFolder;



module.exports = function(app, io){

	console.log("main module initialized");
	
	io.on("connection", function(socket){

		socket.on('test', function(info){
			console.log(info);
		});
		//INDEX
		socket.on('zoom', onZoom);
		socket.on('move', onMove);
		socket.on('wordSpacing', onWordSpacing);
		socket.on('changeText', onChangeText);
		socket.on('changeImages', onChangeImages);
		socket.on('countImages', onCountImages);
		socket.on('glitch', onGlitch);
		socket.on('glitchRemove', onGlitchRemove);
		socket.on('changeFont', onChangeFont);
		socket.on('removeFont', onRemoveFont);
		socket.on('changeFontColor', onChangeFontColor);

		socket.on('reset', onReset);

		displayPage(socket);

		// socket.on('savePDF', createPDF);
		socket.on('removeBorders', onRemoveBorders);
		socket.on('generate', generatePdf);

		// DODOC part
		socket.on("newMedia", onNewMedia);
		socket.on("deleteMedia", onDeleteMedia);

	});


// ------------- F U N C T I O N S -------------------

	// save data in json file
	function displayPage(socket){
		var jsonFile = "data.json";

		var images = readImagesDir(imageFolderPath);
		var lastImg = images[images.length-1];

		var longtxt = readTxtDir(longFolderPath);
		var lastlong = longtxt[longtxt.length-1];

		var shorttxt = readTxtDir(shortFolderPath);
		var lastshort = shorttxt[shorttxt.length-1];

		var jsonObject = {
			zoom : 1,
			posX : 0,
			posY: 0,
			space: 0,
			image: lastImg,
			imagesglitch: [],
			txtlong: lastlong,
			txtshort: lastshort,
			fontwords: [],
			black: true
		}

		if (! fs.existsSync(jsonFile)){
			console.log("File does not exist!");
			var dataToWrite = JSON.stringify(jsonObject, null, 4);//,null,4);
			try {
			  fs.writeFileSync(jsonFile, dataToWrite);
			  console.log("JSON saved to " + jsonFile);
			} 
			catch (err) {
			  return console.log(err);
			}
		}
		else{
			var obj = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
			io.sockets.emit('displayPageEvents', obj);
		}
	}

	// reset 
	function onReset(){
		var jsonFile = "data.json";

		var images = readImagesDir(imageFolderPath);
		var lastImg = images[images.length-1];

		var longtxt = readTxtDir(longFolderPath);
		var lastlong = longtxt[longtxt.length-1];

		var shorttxt = readTxtDir(shortFolderPath);
		var lastshort = shorttxt[shorttxt.length-1];

		var jsonObject = {
			zoom : 1,
			posX : 0,
			posY: 0,
			space: 0,
			image: lastImg,
			imagesglitch: [],
			txtlong: lastlong,
			txtshort: lastshort,
			fontwords: []
		}
		var dataToWrite = JSON.stringify(jsonObject, null, 4);//,null,4);
		fs.unlinkSync(jsonFile);
		fs.writeFileSync(jsonFile, dataToWrite);
		io.sockets.emit('displayPageEvents', jsonObject);
	}
	
	// ------------- SYNCHRONISE FUNCTIONS -------------
	function onZoom(zoom){
		// save zoom in json
		var obj = JSON.parse(fs.readFileSync('data.json', 'utf8'));
		obj.zoom = zoom;

		fs.writeFileSync('data.json', JSON.stringify(obj,null, 4));
		
		// send to everyone
		io.sockets.emit('zoomEvents', zoom);

	}

	function onMove(posX, posY){
		// save pos in json
		var obj = JSON.parse(fs.readFileSync('data.json', 'utf8'));
		obj.posX = posX;
		obj.posY = posY;

		fs.writeFileSync('data.json', JSON.stringify(obj,null, 4));

		// send to everyone
		io.sockets.emit('moveEvents', posX, posY);
	}

	function onWordSpacing(space){

		// save space in json
		var obj = JSON.parse(fs.readFileSync('data.json', 'utf8'));
		obj.space = space;

		fs.writeFileSync('data.json', JSON.stringify(obj,null, 4));

		io.sockets.emit('wordSpacingEvents', space);
	}

	function onCountImages(clonecount){
		var files = readImagesDir(imageFolderPath);
		var countImg = files.length;
		io.sockets.emit('nbImages', countImg, clonecount);
	}

	function onGlitch(clonecount, pos, height, index){
		var files = readImagesDir(imageFolderPath);
		// save glitch in json
		var obj = JSON.parse(fs.readFileSync('data.json', 'utf8'));
		obj.imagesglitch.push({image: files[index], pos: pos, height:height, count: clonecount });
		fs.writeFileSync('data.json', JSON.stringify(obj,null, 4));

		io.sockets.emit('glitchEvents', clonecount,files, pos, height, index);
	}

	function onGlitchRemove(){
		// save glitch in json
		var obj = JSON.parse(fs.readFileSync('data.json', 'utf8'));
		obj.imagesglitch = [];
		fs.writeFileSync('data.json', JSON.stringify(obj,null, 4));

		io.sockets.emit('glitchRemEvents');
	}

	function onChangeText(prevIndex, dir, element){
		var textArray = [];
    var arrayOfFiles = fs.readdirSync(dir);

    arrayOfFiles.forEach( function (file) {
      var textInFile = fs.readFileSync(dir+'/'+file, 'utf8');
      textArray.push(textInFile);
    });

    // save new text in json
		var obj = JSON.parse(fs.readFileSync('data.json', 'utf8'));
		if(dir == longFolderPath){
			obj.txtlong = textArray[prevIndex];
		}
		if(dir == shortFolderPath){
			obj.txtshort = textArray[prevIndex];
		}
		fs.writeFileSync('data.json', JSON.stringify(obj,null, 4));

    io.sockets.emit('changeTextEvents', textArray, prevIndex, element);
	} 

	function onChangeImages(prevIndex, dir, element){
		var files = readImagesDir(dir);

		// save new text in json
		var obj = JSON.parse(fs.readFileSync('data.json', 'utf8'));
		obj.image = files[prevIndex];
		fs.writeFileSync('data.json', JSON.stringify(obj,null, 4));

    io.sockets.emit('changeImagesEvents', files, prevIndex, element);
	}

	function onChangeFont(words){
		// save change font in json
		var obj = JSON.parse(fs.readFileSync('data.json', 'utf8'));
		obj.fontwords = words;
		fs.writeFileSync('data.json', JSON.stringify(obj,null, 4));

		io.sockets.emit('changeFontEvents', words);
	}

	function onRemoveFont(words){
		// save remove font in json
		var obj = JSON.parse(fs.readFileSync('data.json', 'utf8'));
		obj.fontwords = [];
		fs.writeFileSync('data.json', JSON.stringify(obj,null, 4));

		io.sockets.emit('removeFontEvents');
	}

	function onChangeFontColor(black){
		// save change font color in json
		var obj = JSON.parse(fs.readFileSync('data.json', 'utf8'));
		obj.black = black;
		fs.writeFileSync('data.json', JSON.stringify(obj,null, 4));

		io.sockets.emit('changeFontColorEvents', black);
	}

	function readImagesDir(dir){
		var fileType = ['.jpg', '.jpeg', '.png'],
        files = [];
    var arrayOfFiles = fs.readdirSync(dir);
    arrayOfFiles.forEach( function (file) {
    	console.log(fileType.indexOf(path.extname(file))>-1, file);
      if(fileType.indexOf(path.extname(file))>-1) {
        files.push(file); //store the file name into the array files
      }
    });
    return files;
	}

	function readTxtDir(textDir){
    // List text
    var textArray = [];
    var arrayOfFiles = fs.readdirSync(textDir);

    arrayOfFiles.forEach( function (file) {
      var textInFile = fs.readFileSync(textDir+'/'+file, 'utf8');
      textArray.push(textInFile);
    });
    return textArray;
  }

	//------------- PDF -------------------
	function onRemoveBorders(){
		io.sockets.emit('removingBoders');
	}

	function generatePdf(){	

		var date = getCurrentDate();
		// console.log(date);

		phantom.create([
	  '--ignore-ssl-errors=yes',
	  '--ssl-protocol=any', 
	  '--load-images=yes',
	  '--local-to-remote-url-access=yes'
		]).then(function(ph) {
		  ph.createPage().then(function(page) {
		  	page.open('https://localhost:8080/')
		  	.then(function(){
		  		page.property('viewportSize', {width: 1280, height: 800});
		  		// page.property('paperSize', {format: 'A4', orientation: 'landscape'})
		  		page.property('paperSize', {width: 1125, height: 795})
		  		.then(function() {
			  		return page.property('content')
			    	.then(function() {
				      setTimeout(function(){
					      page.render(pdfFolderPath+'/'+date+'.pdf').then(function() {
					      	console.log('success');
					      	io.sockets.emit('pdfIsGenerated');
					      	page.close();
						    	ph.exit();
					      });
				     	}, 2000)
				    });
				  });
		    });
		  });
		});

	// CODE POUR LA CAPTURE D'ECRAN
		// exec('screencapture -R 140,0,1010,715 -x pdf/'+date+'.png',function(error, stdout, stderr){ //Pour OSX
		// 	console.log(error);
		// 	console.log('success screencapture');
		// 	// easyimg.resize({src:'pdf/'+date+'.png', dst: 'pdf/'+date+'-resize.png', width:3840, height:2160}).then(function (file) {
		// 	// 	console.log('file resized');
  //  //    });
		// });
	}

// ------------- D O D O C -------------------
	function onNewMedia( mediaData) {
		// console.log(mediaData)
		var newFileName = getCurrentDate();
		var pathToFile = '';
		var fileExtension;

		var mediaPath = imageFolderPath;
    pathToFile = mediaPath + '/' + newFileName;

    fileExtension = '.jpg';
    var imageBuffer = decodeBase64Image(mediaData.mediaData);

    fs.writeFile( pathToFile + fileExtension, imageBuffer.data, function(err) {
      if (err) reject( err);
      console.log("Image added at path " + pathToFile);
      sendEventWithContent( 'mediaCreated', {'path':pathToFile, 'file':newFileName});
    });
	}

	function onDeleteMedia( mediaData) {
		console.log(mediaData);

		var mediaName = mediaData.mediaName;
		var pathToMediaFolder = imageFolderPath;
		var filesInMediaFolder = fs.readdirSync( pathToMediaFolder);
		var delDir = pathToMediaFolder+'/deleted';

    if (!fs.existsSync(delDir)){
		  fs.mkdirSync(delDir);
		}
    
    filesInMediaFolder.forEach( function( filename) {
      var fileNameWithoutExtension = new RegExp( "(.+?)(\\.[^.]*$|$)", 'i').exec( filename)[1];
      if( fileNameWithoutExtension === mediaName) {
        var filePath = pathToMediaFolder + '/' + filename;
        var newFilePath = pathToMediaFolder + '/deleted/' + filename;
        fs.renameSync( filePath, newFilePath);
        console.log( "A file will be deleted (actually, renamed but hidden from dodoc) : \n - " + filePath + "\n - " + newFilePath);
      }
    });
	}

	function sendEventWithContent( sendEvent, objectContent, socket) {
    io.sockets.emit( sendEvent,objectContent);
  }

	function getCurrentDate() {
    return moment().format("YYYYMMDD_HHmmss");
  }

  // Décode les images en base64
	// http://stackoverflow.com/a/20272545
	function decodeBase64Image(dataString) {

  	console.log("Decoding base 64 image");

		var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
		response = {};

		if (matches.length !== 3) {
			return new Error('Invalid input string');
		}

		response.type = matches[1];
		response.data = new Buffer(matches[2], 'base64');

		return response;
	}

// - - - END FUNCTIONS - - - 
};
