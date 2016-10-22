var fs = require('fs-extra'),
	glob = require("glob"),
	moment = require('moment'),
	path = require("path"),
	exec = require('child_process').exec,
	parsedown = require('woods-parsedown'),
	phantom = require('phantom');

	var _ph, _page, _outObj;
	var settings  = require('./content/settings.js');

	var chapterFolder = settings.folder;
	var contentFolder = "content/";
	// var imagesFolder = "images";
	var longFolder = "long";
	var shortFolder = "short";
	var pdfFolder = "pdf";

	// var imageFolderPath = contentFolder+chapterFolder+imagesFolder;
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
		createDataFile(socket);
		socket.on( 'listFiles', function (data){ onListFolders(socket); });
		
		socket.on('changeText', onChangeText);

		socket.on('zoomIn', onZoomIn);
		socket.on('zoomOut', onZoomOut);
		
		socket.on('moveRight', onMoveRight);
		socket.on('moveLeft', onMoveLeft);
		socket.on('moveDown', onMoveDown);
		socket.on('moveUp', onMoveUp);



		socket.on('wordSpacing', onWordSpacing);
		
		// socket.on('changeImages', onChangeImages);
		// socket.on('countImages', onCountImages);
		// socket.on('glitch', onGlitch);
		// socket.on('glitchRemove', onGlitchRemove);
		socket.on('changeFont', onChangeFont);
		socket.on('removeFont', onRemoveFont);
		// socket.on('changeFontColor', onChangeFontColor);

		socket.on('reset', onReset);

		socket.on('generate', generatePdf);;

	});


// ------------- F U N C T I O N S -------------------
	function onListFolders( socket){
		console.log( "EVENT - onListFolders");
    listAllFolders().then(function( allFoldersData) {
    	// console.log(allFoldersData)
      sendEventWithContent( 'displayPageEvents', allFoldersData, socket);
    }, function(error) {
      console.error("Failed to list folders! Error: ", error);
    });
	}

	// save data in json file
	function createDataFile(socket){
		var jsonFile = "data.json";

		for(var i in settings.architecture){
			var folder = contentFolder+chapterFolder+settings.architecture[i][0];
			if(settings.architecture[i][1] == 'text'){
				var txt = readTxtDir(folder);
				var folderObj = {
					path: folder,
					txt : txt[txt.length-1],
					index : txt.length,
					zoom : 1,
					xPos : 0,
					yPos : 0,
					wordSpace : 0, 
					nbOfFiles : txt.length, 
					fontwords: settings.words
				}
				createNewData(folderObj).then(function(newpdata) {
					console.log('newpdata: '+newpdata);
		      sendEventWithContent('displayPageEvents', newpdata);
		    }, function(errorpdata) {
		      console.log(errorpdata);

		    });
			}
		}
	}

	// reset 
	function onReset(){
		var jsonFile = "data.json";
		fs.unlinkSync(jsonFile);

		io.sockets.emit('pdfIsGenerated');

	}
	
	function onChangeText(element){
		var textArray = [];
		var dir = element.path;
    var arrayOfFiles = fs.readdirSync(dir);
    var prevIndex = parseInt((element.index)-1);
    console.log("ON CHANGE TEXT EVENTS");

    if(prevIndex < 0){
    	prevIndex = arrayOfFiles.length - 1;
    }

    if(arrayOfFiles[prevIndex] == settings.confMetafilename + settings.metaFileext){
    	prevIndex = prevIndex - 1;
    	if(prevIndex < 0){
	    	prevIndex = arrayOfFiles.length - 1;
	    }
    }

    console.log(prevIndex, element.index);

    var newData = {
    	'text': fs.readFileSync(dir+'/'+arrayOfFiles[prevIndex], 'utf8'),
    	'index': prevIndex,
    	"slugFolderName" : element.slugFolderName
    }

    updateFolderMeta(newData).then(function( currentDataJSON) {
    	console.log(currentDataJSON);
      sendEventWithContent( 'changeTextEvents', currentDataJSON);
    }, function(error) {
      console.error("Failed to update a folder! Error: ", error);
    });
	}

// -------  Z O O M     F U N C T I O N S ----------- 
	
	function onZoomIn(data){
		console.log("ON ZOOM IN");
		var newZoom = zoomIn(parseFloat(data.zoom));
		

    var newData = {
    	'zoom': newZoom, 
    	"slugFolderName" : data.slugFolderName
    }

    updateFolderMeta(newData).then(function( currentDataJSON) {
      sendEventWithContent( 'zoomEvents', currentDataJSON);
    }, function(error) {
      console.error("Failed to update a folder! Error: ", error);
    });

	}

	function onZoomOut(data){
		console.log("ON ZOOM OUT");
		var zoom = zoomOut(parseFloat(data.zoom));

    var newData = {
    	'zoom': zoom,
    	"slugFolderName" : data.slugFolderName
    }

    updateFolderMeta(newData).then(function( currentDataJSON) {
      sendEventWithContent( 'zoomEvents', currentDataJSON);
    }, function(error) {
      console.error("Failed to update a folder! Error: ", error);
    });

	}

	function zoomIn(zoom){
	  var maxZoom = settings.maxZoom,
	      zoomStep = settings.zoomStep;
	  
	  if(zoom > maxZoom){
	  	zoom = zoom;
	  }
	  else{ 
	  	zoom += zoomStep;
	  }
	  return zoom;
	}

	function zoomOut(zoom){
	  var minZoom = settings.minZoom, 
	      zoomStep = settings.zoomStep;

	  if(zoom < minZoom) zoom = zoom; 
	  else zoom -= zoomStep; 
	  return zoom;
	}

// -------  E N D       Z O O M     F U N C T I O N S ----------- 

// -------  M O V E     F U N C T I O N S ----------- 

	function onMoveRight(data){
		console.log("ON MOVE RIGHT");
		var xStep = settings.xStep;

		var newXPos = parseFloat(data.xPos) + xStep;

    var newData = {
    	'xPos': newXPos, 
    	"slugFolderName" : data.slugFolderName
    }

    updateFolderMeta(newData).then(function( currentDataJSON) {
      sendEventWithContent( 'moveEvents', currentDataJSON);
    }, function(error) {
      console.error("Failed to update a folder! Error: ", error);
    });

	}

	function onMoveLeft(data){
		console.log("ON MOVE RIGHT");
		var xStep = settings.xStep;

		var newXPos = parseFloat(data.xPos) - xStep;

    var newData = {
    	'xPos': newXPos, 
    	"slugFolderName" : data.slugFolderName
    }

    updateFolderMeta(newData).then(function( currentDataJSON) {
      sendEventWithContent( 'moveEvents', currentDataJSON);
    }, function(error) {
      console.error("Failed to update a folder! Error: ", error);
    });
	}

	function onMoveDown(data){
		console.log("ON MOVE RIGHT");
		var yStep = settings.yStep;

		var newYPos = parseFloat(data.yPos) + yStep;

    var newData = {
    	'yPos': newYPos, 
    	"slugFolderName" : data.slugFolderName
    }

    updateFolderMeta(newData).then(function( currentDataJSON) {
      sendEventWithContent( 'moveEvents', currentDataJSON);
    }, function(error) {
      console.error("Failed to update a folder! Error: ", error);
    });

	}

	function onMoveUp(data){
		console.log("ON MOVE RIGHT");
		var yStep = settings.yStep;

		var newYPos = parseFloat(data.yPos) - yStep;

    var newData = {
    	'yPos': newYPos, 
    	"slugFolderName" : data.slugFolderName
    }

    updateFolderMeta(newData).then(function( currentDataJSON) {
      sendEventWithContent( 'moveEvents', currentDataJSON);
    }, function(error) {
      console.error("Failed to update a folder! Error: ", error);
    });

	}

// -------  E N D       M O V E     F U N C T I O N S ----------- 


	
	// function onMove(posX, posY, count){
	// 	// save pos in json
	// 	var obj = JSON.parse(fs.readFileSync('data.json', 'utf8'));
	// 	console.log(count, posX, posY);
	// 	if(count == 0){
	// 		obj.longPosX = posX;
	// 		obj.longPosY = posY;
	// 	}
	// 	if(count == 1){
	// 		obj.imgPosX = posX;
	// 		obj.imgPosY = posY;
	// 	}
	// 	if(count == 2){
	// 		obj.shortPosX = posX;
	// 		obj.shortPosY = posY;
	// 	}

	// 	fs.writeFileSync('data.json', JSON.stringify(obj,null, 4));

	// 	// send to everyone
	// 	io.sockets.emit('moveEvents', posX, posY, count);
	// }

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




	function onChangeImages(prevIndex, dir, element){
		var files = readImagesDir(dir);

		// save new text in json
		var obj = JSON.parse(fs.readFileSync('data.json', 'utf8'));
		obj.image = files[prevIndex];
		obj.imageIndex = prevIndex;
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
		  		page.property('paperSize', {width: 1120, height: 792})
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

	}

	function listAllFolders() {
    return new Promise(function(resolve, reject) {
  		fs.readdir(settings.contentDir, function (err, filenames) {
        if (err) return console.log( 'Couldn\'t read content dir : ' + err);

        var folders = filenames.filter( function(slugFolderName){ return new RegExp("^([^.]+)$", 'i').test( slugFolderName); });
  	    console.log( "Number of folders in " + settings.contentDir + " = " + folders.length + ". Folders are " + folders);

  	    var foldersProcessed = 0;
  	    var allFoldersData = [];
  		  folders.forEach( function( slugFolderName) {
  		    if( new RegExp("^([^.]+)$", 'i').test( slugFolderName) && slugFolderName != 'pdf'){
          	var fmeta = getFolderMeta( slugFolderName);
          	fmeta.slugFolderName = slugFolderName;
            allFoldersData.push( fmeta);
          }

          foldersProcessed++;
          if( foldersProcessed === folders.length && allFoldersData.length > 0) {
            console.log( "- - - - all folders JSON have been processed.");
            resolve( allFoldersData);
          }
  		  });
  		});
    });
	}

	// Folders method !!
	function createNewData(folderData) {
    return new Promise(function(resolve, reject) {
    	console.log("COMMON — create data file of folder");
    	var path =  folderData.path;
			var txt = folderData.txt;
			var index = folderData.index;

			fs.access(getMetaFileOfFolder(path), fs.F_OK, function( err) {
				if (err) {
					console.log("New data file created");
					var fmeta =
		      {
		        "path" : path,
		        "index" : index,
		        "zoom" : folderData.zoom,
						"xPos" : folderData.xPos,
						"yPos" : folderData.yPos,
						"wordSpace" : folderData.wordSpace, 
						"nbOfFiles" : folderData.nbOfFiles, 
						"fontwords": folderData.fontwords,
		        "text" : txt
		      };
		      storeData( getMetaFileOfFolder(path), fmeta, "create").then(function( meta) {
		      	// console.log('sucess ' + meta)
		        resolve( meta);
		      });
		    } else {
          // if there's already something at path
          reject( 'data file already exist');
        }
      });

    });
  }

  function updateFolderMeta( folderData) {
    return new Promise(function(resolve, reject) {
      console.log( "COMMON — updateFolderMeta");
      // console.log(folderData);
      var slugFolderName = folderData.slugFolderName;
      var folderPath = getFullPath( slugFolderName);
      var newText = folderData.text;
      var newIndex = folderData.index;
      var newZoom = folderData.zoom;
      var newXPos = folderData.xPos;
      var newYPos = folderData.yPos;

      // récupérer les infos sur le folder
      var fmeta = getFolderMeta( slugFolderName);
      if(newText != undefined)
      	fmeta.text = newText;
      if(newIndex != undefined)
      	fmeta.index = newIndex;
      if(newZoom != undefined)
      	fmeta.zoom = newZoom;
      if(newXPos != undefined)
      	fmeta.xPos = newXPos;
      if(newYPos != undefined)
      	fmeta.yPos = newYPos;
      // console.log(fmeta);

      // envoyer les changements dans le JSON du folder
      storeData( getMetaFileOfFolder( folderPath), fmeta, "update").then(function( ufmeta) {
        ufmeta.slugFolderName = slugFolderName;
        resolve( ufmeta);
      });
    });
  }

  function textifyObj( obj) {
    var str = '';
    console.log( '1. will prepare string for storage');
    for (var prop in obj) {
      var value = obj[prop];
      console.log('2. value ? ' + value);
      // if value is a string, it's all good
      // but if it's an array (like it is for medias in publications) we'll need to make it into a string
      if( typeof value === 'array')
        value = value.join(', ');
      // check if value contains a delimiter
      if( typeof value === 'string' && value.indexOf('\n----\n') >= 0) {
        console.log( '2. WARNING : found a delimiter in string, replacing it with a backslash');
        // prepend with a space to neutralize it
        value = value.replace('\n----\n', '\n ----\n');
      }
      str += prop + ': ' + value + settings.textFieldSeparator;
    }
    console.log( '3. textified object : ' + str);
    return str;
  }

  function storeData( mpath, d, e) {
    return new Promise(function(resolve, reject) {
      console.log('Will store data', mpath);
      var textd = textifyObj(d);
      if( e === "create") {
        fs.appendFile( mpath, textd, function(err) {
          if (err) reject( err);
          resolve(parseData(textd));
        });
      }
		  if( e === "update") {
        fs.writeFile( mpath, textd, function(err) {
        if (err) reject( err);
          resolve(parseData(textd));
        });
      }
    });
	}

	function getFolderMeta( slugFolderName) {
		console.log( "COMMON — getFolderMeta");

    var folderPath = getFullPath( slugFolderName);
  	var folderMetaFile = getMetaFileOfFolder( folderPath);

		var folderData = fs.readFileSync( folderMetaFile, settings.textEncoding);
		var folderMetadata = parseData( folderData);

    return folderMetadata;
  }

	function getMetaFileOfFolder( folderPath) {
    return folderPath + '/' + settings.confMetafilename + settings.metaFileext;
  }

	function sendEventWithContent( sendEvent, objectContent, socket) {
    io.sockets.emit( sendEvent,objectContent);
  }

  function getFullPath( path) {
    return settings.contentDir + "/" + path;
  }

	function getCurrentDate() {
    return moment().format("YYYYMMDD_HHmmss");
  }

  function parseData(d) {
  	var parsed = parsedown(d);
		return parsed;
	}

	 // C O M M O N     F U N C T I O N S
  function eventAndContent( sendEvent, objectJson) {
    var eventContentJSON =
    {
      "socketevent" : sendEvent,
      "content" : objectJson
    };
    return eventContentJSON;
  }

  function sendEventWithContent( sendEvent, objectContent, socket) {
    var eventAndContentJson = eventAndContent( sendEvent, objectContent);
    console.log("eventAndContentJson " + JSON.stringify( eventAndContentJson, null, 4));
    if( socket === undefined)
      io.sockets.emit( eventAndContentJson["socketevent"], eventAndContentJson["content"]);
    else
      socket.emit( eventAndContentJson["socketevent"], eventAndContentJson["content"]);
  }


// - - - END FUNCTIONS - - - 
};
