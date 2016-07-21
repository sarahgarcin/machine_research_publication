var fs = require('fs-extra'),
	glob = require("glob"),
	moment = require('moment'),
	path = require("path"),
	wkhtmltopdf = require('wkhtmltopdf'),
	pdf = require('phantom-html2pdf'),
	phantom = require('phantom');
	// html2pdf = require('html-pdf');

module.exports = function(app, io){

	console.log("main module initialized");

	io.on("connection", function(socket){

		//INDEX
		socket.on( 'listData', function (data){ onListImages( socket); });
		socket.on('savePDF', createPDF);

		// DODOC part
		socket.on("newMedia", onNewMedia);
		socket.on("deleteMedia", onDeleteMedia);

	});


// ------------- F U N C T I O N S -------------------

	// ------------- I N D E X  -------------------
	function onListImages(socket){
		fs.readdir( 'content/images', function (err, images) {
			console.log(images);
		 	if (err) return console.log( 'Couldn\'t read content dir : ' + err);
		 	images.forEach(function(file){
		 		if(file.split('.')[1] == 'jpg'){
			 		socket.emit('sendImages', file);
			 		console.log(file);
			 	}
	 		});
	 	});
	}

	function onListData(socket){
		fs.readdir( 'content/', function (err, dir) {
      if (err) return console.log( 'Couldn\'t read content dir : ' + err);
	 		dir.forEach(function(folder) {
	 			if(folder !='.DS_Store'){
		 			fs.readdir('content/'+folder, function (err, files){
		 				if (err) return console.log( 'Couldn\'t read content dir : ' + err);
		 				files.forEach(function(file){
		 					if(file.split('.')[1] == 'txt'){
		 						fs.readFile('content/'+folder+'/'+file, 'utf8', function(err, data) {
								  if (err) return console.log( 'Couldn\'t read content file : ' + err);
								  // console.log('OK: ' + file);
								  // console.log(data)
								  socket.emit('sendText', data);
								});
		 					}
		 					if(file.split('.')[1] == 'jpg'){
								socket.emit('sendImages', file);
		 					}
		 				});
		 			});
		 		}
	 		});
	 	});
	}

	//------------- PDF -------------------
		// function createPDF(){
		// 	var url = 'http://localhost:8080/',
	 // 				pdf = 'pdf/'+getCurrentDate()+'.pdf';
	 // 				console.log('create PDF');
	 // 		phantom.create().then(function(ph) {
		//     ph.createPage().then(function(page) {
		//     	// console.log(page);
		// 	      page.open(url).then(function(status) {
		// 	       	// console.log(status, page);
		// 		      setTimeout(function() {
		// 	          if (status === 'success') {
		// 	          	console.log(status);
		// 							console.log('wait...');
		// 		      		page.render(pdf);
		// 		      		page.close();
		// 							ph.exit();
		// 	      //     	page.property('content').then(function(content){
		// 							//   console.log("Content: ", content);
		// 							//   page.close();
		// 							//   ph.exit();
		// 							//   fs.writeFile("test.html", content, function(err) {
		// 							// 	  if(err) {
		// 							// 	    return console.log(err);
		// 							// 	    page.close();
		// 							//   		ph.exit();
		// 							// 	  }
		// 							// 	  console.log("The file was saved!");
		// 							// 	  page.close();
		// 							//   	ph.exit();
		// 							// 	}); 
		// 							// 	// wkhtmltopdf(content, {output: 'out.pdf'});

		// 							// });
		// 	          } 
		// 	          else {
		// 	            console.log('some error');
		// 	           	page.close();
		// 	            ph.exit();
		// 	          }
		// 	        }, 3000);
		//       	});
		//     });
		// 	});
		// }
	
	function createPDF(){
		var _ph, _page, _outObj;
		var url = 'http://localhost:8080/',
 				pdf = 'pdf/'+getCurrentDate()+'.pdf';
 				console.log('create PDF');
		phantom.create().then(ph => {
	    _ph = ph;
	    return _ph.createPage();
		}).then(page => {
	    _page = page;
	    return _page.open(url);
		}).then(status => {
	    // console.log(status);
	    return _page.property('content');
		}).then(content => {
	    // console.log(content);
	    _page.property('paperSize', {format: 'A4', orientation: 'landscape', margin: '0.5cm'});
	    _page.render(pdf);
	    _page.close();
	    _ph.exit();
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
