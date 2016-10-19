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

		socket.on('zoom', onZoom);
		socket.on('move', onMove);
		socket.on('wordSpacing', onWordSpacing);
		socket.on('changeText', onChangeText);
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
					index : i,
					zoom : 1,
					xPos : 0,
					yPos : 0,
					wordSpace : 0, 
					nbOfFiles : txt.length, 
					fontwords: settings.words
				}
				createNewData(folderObj).then(function(newpdata) {
					console.log('newpdata: '+newpdata);
		      // sendEventWithContent('displayPageEvents', newpdata);
		    }, function(errorpdata) {
		      console.log(errorpdata);

		    });
			}
		}

		// var jsonObject = {
		// 	zoom : 1,
		// 	imgPosX : 0,
		// 	imgPosY: 0,
		// 	longPosX : 2,
		// 	longPosY: 1,
		// 	shortPosX : 0,
		// 	shortPosY: 11,
		// 	space: 0,
		// 	// image: lastImg,
		// 	// imageIndex:indexImg,
		// 	// nbOfImg : indexImg,
		// 	// imagesglitch: [],
		// 	txtlong: lastlong,
		// 	longIndex:indexLong,
		// 	nbOfLong : indexLong,
		// 	txtshort: lastshort,
		// 	shortIndex:indexShort,
		// 	nbOfShort : indexShort,
		// 	fontwords: [],
		// 	black: true
		// }

		// if (! fs.existsSync(jsonFile)){
		// 	console.log("File does not exist!");
		// 	var dataToWrite = JSON.stringify(jsonObject, null, 4);//,null,4);
		// 	try {
		// 	  fs.writeFileSync(jsonFile, dataToWrite);
		// 	  console.log("JSON saved to " + jsonFile);
		// 	} 
		// 	catch (err) {
		// 	  return console.log(err);
		// 	}
		// }
		// else{
		// 	var obj = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
		// 	io.sockets.emit('displayPageEvents', obj);
		// }
	}

	// reset 
	function onReset(){
		var jsonFile = "data.json";
		fs.unlinkSync(jsonFile);

		io.sockets.emit('pdfIsGenerated');

	}
	
	// ------------- SYNCHRONISE FUNCTIONS -------------
	function onZoom(zoom, element){
		// save zoom in json
		var obj = JSON.parse(fs.readFileSync('data.json', 'utf8'));
		obj.zoom = zoom;

		fs.writeFileSync('data.json', JSON.stringify(obj,null, 4));
		
		// send to everyone
		io.sockets.emit('zoomEvents', zoom, element);

	}

	function onMove(posX, posY, count){
		// save pos in json
		var obj = JSON.parse(fs.readFileSync('data.json', 'utf8'));
		console.log(count, posX, posY);
		if(count == 0){
			obj.longPosX = posX;
			obj.longPosY = posY;
		}
		if(count == 1){
			obj.imgPosX = posX;
			obj.imgPosY = posY;
		}
		if(count == 2){
			obj.shortPosX = posX;
			obj.shortPosY = posY;
		}

		fs.writeFileSync('data.json', JSON.stringify(obj,null, 4));

		// send to everyone
		io.sockets.emit('moveEvents', posX, posY, count);
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

    if(prevIndex < 0){
    	prevIndex = arrayOfFiles.length - 1;
    }

    // save new text in json
		var obj = JSON.parse(fs.readFileSync('data.json', 'utf8'));
		if(dir == longFolderPath){
			obj.txtlong = textArray[prevIndex];
			obj.longIndex = prevIndex;
		}
		if(dir == shortFolderPath){
			obj.txtshort = textArray[prevIndex];
			obj.shortIndex = prevIndex;
		}
		fs.writeFileSync('data.json', JSON.stringify(obj,null, 4));

    io.sockets.emit('changeTextEvents', textArray, prevIndex, element);
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
    	// console.log(fileType.indexOf(path.extname(file))>-1, file);
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
			console.log(folderData.nbOfFiles);

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
