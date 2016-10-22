/* VARIABLES */
var socket = io.connect();
var dataTextLong;
var converter = new showdown.Converter();

var chapterFolder = settings.folder;
var contentFolder = "content/";
var longFolder = "long";
var shortFolder = "short";
var pdfFolder = "pdf";

var pageFolder = contentFolder+chapterFolder;

var longFolderPath = pageFolder + longFolder;
var shortFolderPath = pageFolder + shortFolder;
var pdfFolderPath = pageFolder + pdfFolder;

// html elements
var $text = $(".text-content");

/* sockets */
function onSocketConnect() {
	sessionId = socket.io.engine.id;
	console.log('Connected ' + sessionId);
	socket.emit('listFiles');
};

function onSocketError(reason) {
	console.log('Unable to connect to server', reason);
};

/* sockets */
socket.on('connect', onSocketConnect);
socket.on('error', onSocketError);

socket.on('displayPageEvents', onDisplayPage);

socket.on('zoomEvents', function(data){ 
	var $element = $(".page-wrapper").find("[data-folder='" + data.slugFolderName + "']");
	console.log($element, data.zoom);
	$element.zoom(data.zoom);
	localStorage.setItem('data', JSON.stringify(data));
	console.log(data);
});

socket.on('moveEvents', function(data){

	var $element = $(".page-wrapper").find("[data-folder='" + data.slugFolderName + "']");

	$element.move(data.xPos, data.yPos);
	localStorage.setItem('data', JSON.stringify(data));
	console.log(data);
});

socket.on('wordSpacingEvents', function(space){
	$text.css('word-spacing', ''+space +'px'); 
});

socket.on('changeTextEvents', function(data){

	var $textEl = $(".page-wrapper").find("[data-folder='" + data.slugFolderName + "']");
	// var $textEl = $('.content[data-folder="'+data.slugFolderName+'"]');
	console.log($textEl);
	var newText = data.text;
	var newIndex = data.index;

	$textEl
	.attr('data-index', newIndex)
	.html(converter.makeHtml(newText));
	
	localStorage.setItem('data', JSON.stringify(data));

	// // display the right index
	$('.meta-data .file-select').html((parseInt(data.index))+'/'+ data.nbOfFiles);
	
});

socket.on('changeFontEvents', function(wordsCount){
	$('p').wrapInTag({
	  tag: 'span',
	  class: 'change-font',
	  words: wordsCount
	});
});

socket.on('removeFontEvents', function(){
	$('p').find('.change-font').attr("class","normal-font");
});

socket.on('pdfIsGenerated', function(){
	location.reload();
});


jQuery(document).ready(function($) {
	$(document).foundation();
	// init();
	gridDisplayer();

});


function init(){

	// // M O V E  var
	// var imgPosX  = data.imgPosX,
	// 		imgPosY = data.imgPosY,
	// 		longPosX  = data.longPosX,
	// 		longPosY = data.longPosY,
	// 		shortPosX  = data.shortPosX,
	// 		shortPosY = data.shortPosY,
	// 		maxX = 15,
	// 		minX = -20,
	// 		xStep = 0.4,
	// 		maxY = 18,
	// 		minY = -12,
	// 		yStep = 0.5;

	// // W O R D   S P A C I N G var
	// var space= data.space,
	// 		spacePlus = 5,
	// 		spaceMoins = 3;

	// // G L I T C H  var
	// var clonecount =0;

	// // C H A N G E  F O N T   var
	// var countRegex = 0;
	// var arrayWords = settings.words;
	// var wordsCount = [];

	// //Reset keypress
	// reset();

	$(document).on('keypress', function(e){
		var code = e.keyCode;
		console.log(code);
		// Retrieve the object from storage
		var retrievedObject = localStorage.getItem('data');
		var data = JSON.parse(retrievedObject);
		// console.log('retrievedObject: ', JSON.parse(retrievedObject));
		
		// ------   C H A N G E   C O N T E N T ---------
		changeText(data, code);
		zoomEvents(data, code);
		moveEvents(data, code);
		
		e.preventDefault(); // prevent the default action (scroll / move caret)
	});


	// $(document).on('keypress', function(e){
	// 	// console.log(e.keyCode);
	// 	var code = e.keyCode;
	// 	console.log('plop', code);

	// 	switch(code){
		

	// 	// ------   M O V E    E L E M E N T S -----------
	// 	  //press "l" to move image on the right
	// 		case 113:
	// 			for(i in elObj){
	// 				// if(partCount == i){

	// 				// }
	// 				if(partCount == 0){
	// 					longPosX += xStep;
	// 					socket.emit("move", longPosX, longPosY, partCount);
	// 				}
	// 				if(partCount == 2){
	// 					shortPosX += xStep;
	// 					socket.emit("move", shortPosX, shortPosY, partCount);
	// 				}
	// 			}
	// 			break;
	// 		//press "j" to move image on the left
	// 		case 97:
	// 			// if(posX >= minX){
	// 				if(partCount == 0){
	// 					longPosX -= xStep;
	// 					socket.emit("move", longPosX, longPosY, partCount);
	// 				}
	// 				if(partCount == 1){
	// 					// imgPosX -= xStep;
	// 					// socket.emit("move", imgPosX, imgPosY, partCount);
	// 				}
	// 				if(partCount == 2){
	// 					shortPosX -= xStep;
	// 					socket.emit("move", shortPosX, shortPosY, partCount);
	// 				}
	// 				// posX -= xStep;
	// 				// socket.emit("move", posX, posY, partCount);
	// 			// }
	// 			break;
	// 		//press "k" to move image down
	// 		case 119:
	// 			// if(posY < maxY){
	// 				if(partCount == 0){
	// 					longPosY += yStep;
	// 					socket.emit("move", longPosX, longPosY, partCount);
	// 				}
	// 				if(partCount == 1){
	// 					// imgPosY += yStep;
	// 					// socket.emit("move", imgPosX, imgPosY, partCount);
	// 				}
	// 				if(partCount == 2){
	// 					shortPosY += yStep;
	// 					socket.emit("move", shortPosX, shortPosY, partCount);
	// 				}
	// 				// posY += yStep;
	// 				// socket.emit("move", posX, posY, partCount);
	// 			// }
	// 			break;
	// 		//press "i" to move image up
	// 		case 115:
	// 			// if(posY >= minY){
	// 				if(partCount == 0){
	// 					longPosY -= yStep;
	// 					socket.emit("move", longPosX, longPosY, partCount);
	// 				}
	// 				if(partCount == 1){
	// 					// imgPosY -= yStep;
	// 					// socket.emit("move", imgPosX, imgPosY, partCount);
	// 				}
	// 				if(partCount == 2){
	// 					shortPosY -= yStep;
	// 					socket.emit("move", shortPosX, shortPosY, partCount);
	// 				}
	// 				// posY -= yStep;
	// 				// socket.emit("move", posX, posY, partCount);
	// 			// }
	// 		break;

	// 	// ------   G L I T C H    I M A G E S -----------
	// 		// on "n" press glitch images
	// 		case 105:

	// 			break; 

	// 	// ------   C H A N G E    F O N T  ------ 

	// 		// "c" press -> change font-family 
	// 		case 101:
	// 			countRegex ++;
	// 			if(countRegex <= arrayWords.length){
	// 				for(var a =0; a<countRegex; a++){
	// 					wordsCount.push(arrayWords[a]);
	// 					console.log(arrayWords[a]);
	// 				}
	// 				socket.emit('changeFont', wordsCount);
	// 			}
	// 			else{
	// 				socket.emit('removeFont');
	// 				countRegex = 0;
	// 				wordsCount = [];
	// 			}
	// 			break;

	// 	// ------   W O R D    S P A C I N G  ------ 
		 
	// 	  //press "s" to add space between each words
	// 		case 121:
	// 			space += spacePlus;
	// 			socket.emit('wordSpacing', space);
	// 			break;
			
	// 		//press "q" to decrease space between each words
	// 		case 114:
	// 			space -= spaceMoins;
	// 	    socket.emit('wordSpacing', space);
	// 			break;

	// 	// ------   G E N E R A T E     P D F  ------ 
			
	// 		//Press T and generate PDF
	// 		case 116:

	// 			// var page = $('body').html();
	// 			// $('.page').css('border', 'none');
	// 			// $('.right').css('border', 'none');
	// 			// socket.emit('removeBorders');
	// 			socket.emit('generate');
	// 			break;
	// 	}
	// 	e.preventDefault(); // prevent the default action (scroll / move caret)
	// });
	
}
// C H A N G E     T E X T     C O N T E N T
function changeText(data, code){
	var partCount = parseInt($('.page-wrapper').attr('data-part'));
	var retrievedObject = localStorage.getItem('foldersdata');
	var foldersdata = JSON.parse(retrievedObject);

	if(code == 111){
		socket.emit('changeText', data);
	}

	// v2 press "p" to go to next part to change
	if(code == 112){
		if(partCount < foldersdata.length-1){
			partCount ++;
			$('.page-wrapper').attr('data-part', partCount);
		}
		else{ 
			partCount = 0; 
			$('.page-wrapper').attr('data-part', partCount);
		}
		localStorage.setItem('data', JSON.stringify(foldersdata[partCount]));
		var data = JSON.parse(localStorage.getItem('data'))
		var type = data.slugFolderName;
		$('.meta-data .block-select').html(type + ' text');
		$('.meta-data .file-select').html((parseInt(data.index)+1) + '/' + parseInt(data.nbOfFiles));
	}
}

// ------   Z O O M -----------
function zoomEvents(data, code){

	//zoomIn press "u"
	if(code == 117){
		console.log(data.zoom);
		socket.emit("zoomIn", data);
	}
	
	//zoomOut press "space"
	if(code == 32){
		socket.emit("zoomOut", data);
	}

}

// ------   M O V E    E L E M E N T S -----------
function moveEvents(data, code){
	
	//press "q" to move image on the right
	var right = 113;
	//press "a" to move image on the left
	var left = 97; 
	//press "w" to move image down
	var down = 119;
	//press "s" to move image up
	var up = 115;

  
	if(code == right){
		console.log('plop');
		socket.emit("moveRight", data);
	}
	
	if(code == left){
		socket.emit("moveLeft", data);
	}

	if(code == down){
		socket.emit("moveDown", data);
	}

	if(code == up){
		socket.emit("moveUp", data);
	}
}


function onDisplayPage(foldersData){
	$.each( foldersData, function( index, fdata) {
  	var $folderContent = makeFolderContent( fdata);
    return insertOrReplaceFolder( fdata.slugFolderName, $folderContent);
  });

  var firstIndex = parseInt(foldersData[0].index) + 1;
  var firstNbOfFiles= foldersData[0].nbOfFiles;

  // Meta-data
	$('.meta-data .block-select').html("text " + foldersData[0].slugFolderName);
	$('.meta-data .file-select').html(firstIndex+"/"+firstNbOfFiles);

	var partCount = parseInt($('.page-wrapper').attr('data-part'));
// console.log(partCount, foldersData);
	data = foldersData[partCount];

	// Put the object into storage
	localStorage.setItem('foldersdata', JSON.stringify(foldersData));
	localStorage.setItem('data', JSON.stringify(data));

	init();
}

function insertOrReplaceFolder( slugFolderName, $folderContent) {
  $(".page-wrapper").append( $folderContent);

  return "inserted";
}

// Display elements in HTML
function makeFolderContent( projectData){

	console.log(projectData)
	
	var index = projectData.index;
	var folder = projectData.slugFolderName;
	var txt = projectData.text;


	var newFolder = $(".js--templates > .content").clone(false);

	// customisation du projet
	newFolder
	  .attr( 'data-index', index)
	  .attr( 'data-folder', folder)
	  .html(converter.makeHtml(txt))
	  .css({
	  	'transform': 'scale('+projectData.zoom+')',
	  	'left': projectData.xPos+'cm',
			'top':projectData.yPos+'cm',
			'word-spacing': projectData.wordSpace +'px'
	  })
  ;

  // change font
	// if(projectData.fontwords.length != 0){
	// 	newFolder.wrapInTag({
	// 	  tag: 'span',
	// 	  class: 'change-font',
	// 	  words: projectData.fontwords
	// 	});
	// }

	return newFolder;


}


// not working
function reset(){
	// press o and p in the same time
	var down = {};
	$(document).keydown(function(e) {
		down[e.keyCode] = true;
	}).keyup(function(e) {
		if (down[79] && down[80]) {
      console.log('Double key Press');
      socket.emit('reset');
    }
    down[e.keyCode] = false;
	});
}


function gridDisplayer(){
	var grid = true;
	$(document).on('keypress',function(e){
		// console.log(grid);
		if(e.keyCode == '60'){
			if(grid == true){
				$('.page').css('border', 'none');
				$('.page-wrapper').css('border', 'none');
				$('.page-wrapper .left').css('border', 'none');
				$('.page-wrapper .right').css('border', 'none');
				grid = false;
			}
			else{
				$('.page').css('border', '1px solid #000');
				$('.page-wrapper').css('border', '1px solid #E100B6');
				$('.page-wrapper .left').css('border-right', '1px solid #00E17B');
				$('.page-wrapper .right').css('border-left', '1px solid #00E17B');
				grid = true;
			}
		}
	});
}

$.fn.wrapInTag = function(opts) {

  var tag = opts.tag, 
  words = opts.words || [],
  regex = RegExp(words.join('|'), 'gi'), // case insensitive
  classname = opts.class || 'none',
  replacement = '<'+ tag +' class="'+classname+'">$&</'+ tag +'>';

  return this.html(function() {
    return $(this).text().replace(regex, replacement);
  });
};






