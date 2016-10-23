/* VARIABLES */
var socket = io.connect();
var dataTextLong;
var converter = new showdown.Converter();

var countRegex = 0;
var grid = false;


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

socket.on('wordSpacingEvents', function(data){
	var $element = $(".page-wrapper").find("[data-folder='" + data.slugFolderName + "']");

	$element.wordSpacing(data.wordSpace);
	localStorage.setItem('data', JSON.stringify(data));

});

socket.on('changeTextEvents', function(data){

	var $textEl = $(".page-wrapper").find("[data-folder='" + data.slugFolderName + "']");
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

});


function init(){

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
		
		// CALL FUNCTION YOU NEED HERE 
		// CHANGE THE KEYPRESS CODE IN EACH FUNCTION
		changeText(data, code);
		zoomEvents(data, code);
		moveEvents(data, code);
		wordSpacing(data, code);
		changeFontFamily(data, code);
		generatePDF(data, code);

		gridDisplayer(code);
		
		e.preventDefault(); // prevent the default action (scroll / move caret)
	});


	// $(document).on('keypress', function(e){
	// 	// console.log(e.keyCode);
	// 	var code = e.keyCode;
	// 	console.log('plop', code);

	// 	switch(code){

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

	// press "o" to go to next part to change
	var nextKey = 111; 
	// press "p" to go to next part to change
	var submitKey = 112;

	if(code == nextKey){
		socket.emit('changeText', data);
	}

	if(code == submitKey){
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
	var zoomInKey = 117; 
	//zoomOut press "space"
	var zoomOutKey = 32; 

	if(code == zoomInKey){
		console.log(data.zoom);
		socket.emit("zoomIn", data);
	}
	
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

// ------   W O R D    S P A C I N G  ------ 
function wordSpacing(data, code){

	//press "y" to add space between each words
	var increaseKey = 121;
	//press "r" to decrease space between each words
	var decreaseKey = 114;

	if(code == increaseKey){
		console.log('plop');
		socket.emit('increaseWordSpacing', data);
	}

	if(code == decreaseKey){
		socket.emit('decreaseWordSpacing', data);
	}
}

// ------   C H A N G E    F O N T    F A M I L Y  ------ 
function changeFontFamily(data, code){
	// "e" press -> change font-family 
	var fontKey = 101;
	var words = settings.words;
	var text = data.text;

	if(code == fontKey){

		if(countRegex < words.length -1){
			// console.log(text.indexOf(words[countRegex]));
			if(text.indexOf(words[countRegex]) != -1){
			  console.log(words[countRegex] + " found");
			  socket.emit('changeFont', data, words[countRegex]);
			  countRegex ++;
			}
			else{
				countRegex ++;
				console.log(words[countRegex] + " not found");
			}
			
		}
		else{
			countRegex = 0;
			socket.emit('removeFont', data);
		}
		// for(var i in words){
		// 	// console.log(words[i]);
		// 	if(text.indexOf(words[i]) != -1){
		// 	  console.log(words[i] + " found");
		// 	}
		// }
		// var str1 = "Lorem ipsum youpi blablabla ";
		// var str2 = "Lorem";
		// if(str1.indexOf(str2) != -1){
		//     console.log(str2 + " found");
		// }

		// socket.emit('changeFont', data);
	}

}

// ------   G E N E R A T E      P D F ------ 
function generatePDF(data, code){

	// press "t" to generate pdf
	var pdf = 116;
	
	if(code == pdf){
		socket.emit('generate');	
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


function gridDisplayer(code){

	//press > to display / hide grid
	var gridKey = 60;
	
	if(code == gridKey){
		if(grid == true){
			$('.grid').hide();
			grid = false;
		}
		else{
			$('.grid').show();
			grid = true;
		}
	}
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






