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
		var fileType = '.jpg',
        files = [];
    var arrayOfFiles = fs.readdirSync(dir);
    arrayOfFiles.forEach( function (file) {
      if(path.extname(file) === fileType) {
        files.push(file); //store the file name into the array files
      }
    });
    io.sockets.emit('changeImagesEvents', files, prevIndex, element);
	}

	//------------- PDF -------------------
	function generatePdf(html){	

		var date = getCurrentDate();
		var css = fs.readFileSync('public/css/style.css', 'utf8');


		console.log(date);

		exec('screencapture -R 140,0,1010,715 -x pdf/'+date+'.png',function(error, stdout, stderr){ //Pour OSX
			console.log(error);
			console.log('success screencapture');
			// easyimg.resize({src:'pdf/'+date+'.png', dst: 'pdf/'+date+'-resize.png', width:3840, height:2160}).then(function (file) {
			// 	console.log('file resized');
   //    });
		});

		// phantom.create([
	 //  '--ignore-ssl-errors=yes',
	 //  '--load-images=yes',
	 //  '--local-to-remote-url-access=yes'
		// ]).then(function(ph) {
		//   ph.createPage().then(function(page) {
		//   	// page.open('http://localhost:8080/')
		//   	// .then(function(){
		//   		// console.log(html);
		//   		// return page.property('content')
		//   		var doc = '<html><head><script>'+css+'</script></head><body>'+html+'</body></html>'
		//   		return page.property('content', doc)
		//     	// page.property('content', '<html><head><link rel="stylesheet" href="public/css/style.css"</head><body>'+html+'</body></html>')
		//     	.then(function() {
		//     		// page.property('zoomFactor', 0.5);
		//     		// page.property('viewportSize', {width: 1280, height: 800});
	 //    			// page.property('paperSize', {format: 'A4', orientation: 'landscape'});
		// 	      setTimeout(function(){
		// 	      	// page.property('viewportSize', {width: 10, height: 718});
		// 	      	page.property('paperSize', {format: 'A4', orientation: 'landscape'}).then(function() {
		// 	      		// page.property('viewportSize', {width: 1280, height: 800});
		// 	      	// page.property('paperSize', {format: 'A4', orientation: 'landscape'});
		// 			      page.render('pdf/'+date+'.pdf').then(function() {
		// 			      	console.log('success');
		// 			      	page.close();
		// 				    	ph.exit();
		// 			      });
		// 			    });
		// 	     	}, 2000)
		// 	     });
		//     // });
		//   });
		// });

		// phantom.create().then(ph => {
	 //    _ph = ph;
	 //    return _ph.createPage();
		// }).then(page => {
		//     _page = page;
		//     // return _page.open('http://localhost:8080/');
		// })
		// .then(status => {
		//   console.log(status);
		//   // return _page.content = html;
		//   var doc = '<html><head><script>'+css+'</script></head><body>'+html+'</body></html>'
		//   return page.property('content', doc)
		// })
		// .then(content => {
		//     console.log(content);
		//     setTimeout(function(){
		// 	   	_page.property('paperSize', {format: 'A4', orientation: 'landscape', margin: '0.5cm'});
		// 	    _page.render('pdf/'+date+'.pdf');
		// 	    _page.close();
		// 	    _ph.exit();
		//     }, 2000);
		// });
	}
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
	
	// function createPDF(){
	// 	var _ph, _page, _outObj;
	// 	var url = 'http://localhost:8080/',
 // 				pdf = 'pdf/'+getCurrentDate()+'.pdf';
 // 				console.log('create PDF');
	// 	phantom.create().then(ph => {
	//     _ph = ph;
	//     return _ph.createPage();
	// 	}).then(page => {
	//     _page = page;
	//     return _page.open(url);
	// 	}).then(status => {
	//     // console.log(status);
	//     return _page.property('content');
	// 	}).then(content => {
	//     // console.log(content);
	//     _page.property('paperSize', {format: 'A4', orientation: 'landscape', margin: '0.5cm'});
	//     _page.render(pdf);
	//     _page.close();
	//     _ph.exit();
	// 	});
	// }

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
