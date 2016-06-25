var fs = require('fs-extra'),
	glob = require("glob"),
	moment = require('moment'),
	path = require("path");

module.exports = function(app, io){

	console.log("main module initialized");

	io.on("connection", function(socket){

		//INDEX
		socket.on( 'listData', function (data){ onListData( socket); });

		// DODOC part
		socket.on("newMedia", onNewMedia);
		socket.on("deleteMedia", onDeleteMedia);

	});


// ------------- F U N C T I O N S -------------------

	// ------------- I N D E X  -------------------
	 function onListData(socket){
			fs.readdir( 'content/', function (err, dir) {
	      if (err) return console.log( 'Couldn\'t read content dir : ' + err);
		 		dir.forEach(function(folder) {
		 			fs.readdir('content/'+folder, function (err, files){
		 				if (err) return console.log( 'Couldn\'t read content dir : ' + err);
		 				files.forEach(function(file){
		 					if(file.split('.')[1] == 'txt'){
		 						fs.readFile('content/'+folder+'/'+file, 'utf8', function(err, data) {
								  if (err) return console.log( 'Couldn\'t read content file : ' + err);
								  console.log('OK: ' + file);
								  console.log(data)
								  socket.emit('sendText', data);
								});
		 					}
		 					if(file.split('.')[1] == 'jpg'){
								socket.emit('sendImages', file);
		 					}
		 				});
		 			});
		 		});
		 	});
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
