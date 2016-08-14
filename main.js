var fs = require('fs-extra'),
	glob = require("glob"),
	moment = require('moment'),
	path = require("path"),
	exec = require('child_process').exec,
	easyimg = require('easyimage');
	var phantom = require('phantom');
	var _ph, _page, _outObj;

module.exports = function(app, io){

	console.log("main module initialized");
	
	io.on("connection", function(socket){

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

		// socket.on('savePDF', createPDF);
		socket.on('generate', generatePdf);

		// DODOC part
		socket.on("newMedia", onNewMedia);
		socket.on("deleteMedia", onDeleteMedia);

	});


// ------------- F U N C T I O N S -------------------
	
	// ------------- SYNCHRONISE FUNCTIONS -------------
	function onZoom(zoom){
		io.sockets.emit('zoomEvents', zoom);
	}

	function onMove(posX, posY){
		io.sockets.emit('moveEvents', posX, posY);
	}

	function onWordSpacing(space){
		io.sockets.emit('wordSpacingEvents', space);
	}

	function onCountImages(clonecount){
		var files = readImagesDir('content/images');
		var countImg = files.length;
		io.sockets.emit('nbImages', countImg, clonecount);
	}

	function onGlitch(clonecount, pos, height, index){
		var files = readImagesDir('content/images');
		io.sockets.emit('glitchEvents', clonecount,files, pos, height, index);
	}

	function onGlitchRemove(){
		io.sockets.emit('glitchRemEvents');
	}

	function onChangeText(prevIndex, dir, element){
		var textArray = [];
    var arrayOfFiles = fs.readdirSync(dir);

    arrayOfFiles.forEach( function (file) {
      var textInFile = fs.readFileSync(dir+'/'+file, 'utf8');
      textArray.push(textInFile);
    });
    io.sockets.emit('changeTextEvents', textArray, prevIndex, element);
	} 

	function onChangeImages(prevIndex, dir, element){
		var files = readImagesDir(dir);
    io.sockets.emit('changeImagesEvents', files, prevIndex, element);
	}

	function onChangeFont(words){
		io.sockets.emit('changeFontEvents', words);
	}

	function onRemoveFont(words){
		io.sockets.emit('removeFontEvents');
	}

	function readImagesDir(dir){
		var fileType = '.jpg',
        files = [];
    var arrayOfFiles = fs.readdirSync(dir);
    arrayOfFiles.forEach( function (file) {
      if(path.extname(file) === fileType) {
        files.push(file); //store the file name into the array files
      }
    });
    return files;
	}

	//------------- PDF -------------------
	function generatePdf(html){	

		var date = getCurrentDate();
		// console.log(date);

		phantom.create([
	  '--ignore-ssl-errors=yes',
	  '--load-images=yes',
	  '--local-to-remote-url-access=yes'
		]).then(function(ph) {
		  ph.createPage().then(function(page) {
		  	page.open('http://localhost:8080/')
		  	.then(function(){
		  		return page.property('content')
		    	.then(function() {
			      setTimeout(function(){
				      page.render('pdf/'+date+'.pdf').then(function() {
				      	console.log('success');
				      	page.close();
					    	ph.exit();
				      });
			     	}, 2000)
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

		var mediaPath = 'content/images';
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
		var pathToMediaFolder = 'content/images';
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
