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
};

function onSocketError(reason) {
	console.log('Unable to connect to server', reason);
};

/* sockets */
socket.on('connect', onSocketConnect);
socket.on('error', onSocketError);

socket.on('displayPageEvents', onDisplayPage);

socket.on('zoomEvents', function(zoom, element){ 
	console.log(element);
	$(element).zoom(zoom);
});

socket.on('moveEvents', function(posX, posY, count){
	console.log(count);
	if(count == 0){
		$('.left .text-content').css({
			'left': posX+'cm',
			'top':posY+'cm',
		});
	}
	if(count == 1){
		// $cell.css({
		// 	'left': posX+'cm',
		// 	'top':posY+'cm',
		// });
	}
	if(count == 2){
		$('.right .small-text-content').css({
			'left': posX+'cm',
			'top':posY+'cm',
		});
	}
});

socket.on('wordSpacingEvents', function(space){
	$text.css('word-spacing', ''+space +'px'); 
});

socket.on('changeTextEvents', function(textArray, index, element){
	var $textEl = $(element);
	var newFile = textArray[index];

	// display the right index
	$('.meta-data .file-select').html((index+1)+'/'+ textArray.length );
	
	$textEl.attr('data-index', index);
	$textEl.html(converter.makeHtml(newFile));
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


function init(data){

	// C H A N G E    C O N T E N T 
	var partCount = 0;
	var elObj = [];
	// push element into array
	$('.--js-content-el').each(function(i){
		elObj[i] = $(this);
		return elObj;
	});
	
	// Z O O M  var
	var zoom = data.zoom,
			minZoom = 0.3,
			maxZoom = 3,
			zoomStep = 0.07;

	// M O V E  var
	var imgPosX  = data.imgPosX,
			imgPosY = data.imgPosY,
			longPosX  = data.longPosX,
			longPosY = data.longPosY,
			shortPosX  = data.shortPosX,
			shortPosY = data.shortPosY,
			maxX = 15,
			minX = -20,
			xStep = 0.4,
			maxY = 18,
			minY = -12,
			yStep = 0.5;

	// W O R D   S P A C I N G var
	var space= data.space,
			spacePlus = 5,
			spaceMoins = 3;

	// G L I T C H  var
	var clonecount =0;

	// C H A N G E  F O N T   var
	var countRegex = 0;
	var arrayWords = settings.words;
	var wordsCount = [];

	//Reset keypress
	reset();


	$(document).on('keypress', function(e){
		// console.log(e.keyCode);
		var code = e.keyCode;

		switch(code){
		
		// ------   C H A N G E   C O N T E N T ---------

			// v2 press "o" to change content (go prev)
			case 111:
				for(i in elObj){
					if(partCount == i){
						var folderName = elObj[i].attr('data-folder');
						var folder = pageFolder + folderName;
						prevContent(elObj[i], folder, 'changeText');
					}
				}
				break;

			// v2 press "p" to go to next part to change
			case 112:
				if(partCount < elObj.length-1){
					partCount ++;
				}
				else{ partCount = 0; }

				for(i in elObj){
					if(partCount == i){
						var type = elObj[i].attr('data-folder');
						$('.meta-data .block-select').html(type + ' text');
						if(type == 'long'){
							$('.meta-data .file-select').html((data.longIndex+1) + '/' + (data.nbOfLong+1));
						}
						if(type == 'short'){
							$('.meta-data .file-select').html((data.shortIndex+1) + '/' + (data.nbOfShort+1));
						}
					}
				}
				break;



		// ------   Z O O M -----------
			
			//zoomIn press "u"
			case 117:
				for(i in elObj){
					if(partCount == i){
						var elementClass = '.'+elObj[i].attr('class').toString().split(' ')[0];
						zoom = zoomIn(zoom, maxZoom, zoomStep);
						socket.emit("zoom", zoom, elementClass);
					}
				}
				break;
			
			//zoomOut press "space"
			case 32:
				for(i in elObj){
					if(partCount == i){
						var elementClass = '.'+elObj[i].attr('class').toString().split(' ')[0];
						zoom = zoomOut(zoom, minZoom, zoomStep);
						socket.emit("zoom", zoom, elementClass);
					}
				}
				break;

		// ------   M O V E    E L E M E N T S -----------
		  //press "l" to move image on the right
			case 113:
				// if(posX < maxX){
					if(partCount == 0){
						longPosX += xStep;
						socket.emit("move", longPosX, longPosY, partCount);
					}
					if(partCount == 1){
						// imgPosX += xStep;
						// socket.emit("move", imgPosX, imgPosY, partCount);
					}
					if(partCount == 2){
						shortPosX += xStep;
						socket.emit("move", shortPosX, shortPosY, partCount);
					}
					// posX += xStep;
					// socket.emit("move", posX, posY, partCount);
	      // }
				break;
			//press "j" to move image on the left
			case 97:
				// if(posX >= minX){
					if(partCount == 0){
						longPosX -= xStep;
						socket.emit("move", longPosX, longPosY, partCount);
					}
					if(partCount == 1){
						// imgPosX -= xStep;
						// socket.emit("move", imgPosX, imgPosY, partCount);
					}
					if(partCount == 2){
						shortPosX -= xStep;
						socket.emit("move", shortPosX, shortPosY, partCount);
					}
					// posX -= xStep;
					// socket.emit("move", posX, posY, partCount);
				// }
				break;
			//press "k" to move image down
			case 119:
				// if(posY < maxY){
					if(partCount == 0){
						longPosY += yStep;
						socket.emit("move", longPosX, longPosY, partCount);
					}
					if(partCount == 1){
						// imgPosY += yStep;
						// socket.emit("move", imgPosX, imgPosY, partCount);
					}
					if(partCount == 2){
						shortPosY += yStep;
						socket.emit("move", shortPosX, shortPosY, partCount);
					}
					// posY += yStep;
					// socket.emit("move", posX, posY, partCount);
				// }
				break;
			//press "i" to move image up
			case 115:
				// if(posY >= minY){
					if(partCount == 0){
						longPosY -= yStep;
						socket.emit("move", longPosX, longPosY, partCount);
					}
					if(partCount == 1){
						// imgPosY -= yStep;
						// socket.emit("move", imgPosX, imgPosY, partCount);
					}
					if(partCount == 2){
						shortPosY -= yStep;
						socket.emit("move", shortPosX, shortPosY, partCount);
					}
					// posY -= yStep;
					// socket.emit("move", posX, posY, partCount);
				// }
			break;

		// ------   G L I T C H    I M A G E S -----------
			// on "n" press glitch images
			case 105:

				break; 

		// ------   C H A N G E    F O N T  ------ 

			// "c" press -> change font-family 
			case 101:
				countRegex ++;
				if(countRegex <= arrayWords.length){
					for(var a =0; a<countRegex; a++){
						wordsCount.push(arrayWords[a]);
						console.log(arrayWords[a]);
					}
					socket.emit('changeFont', wordsCount);
				}
				else{
					socket.emit('removeFont');
					countRegex = 0;
					wordsCount = [];
				}
				break;

		// ------   W O R D    S P A C I N G  ------ 
		 
		  //press "s" to add space between each words
			case 121:
				space += spacePlus;
				socket.emit('wordSpacing', space);
				break;
			
			//press "q" to decrease space between each words
			case 114:
				space -= spaceMoins;
		    socket.emit('wordSpacing', space);
				break;

		// ------   G E N E R A T E     P D F  ------ 
			
			//Press T and generate PDF
			case 116:
				// var page = $('body').html();
				// $('.page').css('border', 'none');
				// $('.right').css('border', 'none');
				// socket.emit('removeBorders');
				socket.emit('generate');
				break;
		}
		e.preventDefault(); // prevent the default action (scroll / move caret)
	});
	
}


function onDisplayPage(data){

	init(data);

	// Meta-data
	$('.meta-data .block-select').html('long text');
	$('.meta-data .file-select').html((data.longIndex+1)+"/"+(data.nbOfLong+1));

	// Content
	$('.left .text-content')
	.html(converter.makeHtml(data.txtlong))
	.attr("data-index", data.longIndex);
	$('.right .small-text-content')
	.html(converter.makeHtml(data.txtshort))
	.attr("data-index", data.shortIndex);
	// $('.right .image-content img')
	// .attr('src', 'images/'+data.image);
	// $('.right .image-content').attr("data-index", data.imageIndex);

	// Zoom 
	$text.zoom(data.zoom);
	// $cell.css('transform', 'scale('+data.zoom+')');

	// ImagePos
	// $cell.css({
	// 	'left': data.imgPosX+'cm',
	// 	'top':data.imgPosY+'cm',
	// });

	$('.right .small-text-content').css({
			'left': data.shortPosX+'cm',
			'top':data.shortPosY+'cm',
	});

	$('.left .text-content').css({
		'left': data.longPosX+'cm',
		'top':data.longPosY+'cm',
	});

	// Word spacing
	$text.css('word-spacing', ''+data.space +'px'); 

	// change font
	if(data.fontwords.length != 0){
		$('p').wrapInTag({
		  tag: 'span',
		  class: 'change-font',
		  words: data.fontwords
		});
	}

	// console.log('black '+data.black);
	// change font color
	if(data.black == true){
		$('.text-content').addClass('black-color').removeClass('white-color');
    $('.small-text-content').addClass('black-color').removeClass('white-color');

  }
  else{
  	$('.text-content').addClass('white-color').removeClass('black-color');
    $('.small-text-content').addClass('white-color').removeClass('black-color');
  }

	// glitch images
	// if(data.imagesglitch.length !=0){
	// 	// console.log(data.imagesglitch);
	// 	for(var a=0; a<data.imagesglitch.length; a++){
	// 		// console.log(data.imagesglitch[a]);
	// 		var glitch = data.imagesglitch[a];
	// 		$('.right .image-wrapper').prepend('<div class="image-content wrapper'+glitch.count+' glitch"><img src="images/'+glitch.image+'"/></div>'); 
	// 		$('.wrapper'+glitch.count).css({
	// 			'top': glitch.pos+'px',
	// 			'height':glitch.height+'px',
	// 			'z-index':glitch.count +2
	// 		}).find('img').css({
	// 			'position':'absolute',
	// 			'top': -glitch.pos+'px'
	// 		});
	// 	}
	// }
	// else{
	// 	$('.glitch').remove();
	// }

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






