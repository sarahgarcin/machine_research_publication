

/* VARIABLES */
var socket = io.connect();

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
socket.on('mediaCreated', onMediaCreated);
// socket.on('stopMotionDirectoryCreated', function(d) { stopMotionMode.onStopMotionDirectoryCreated( d); });
// socket.on('newStopmotionImage', function(d) { stopMotionMode.onNewStopmotionImage( d); });

jQuery(document).ready(function($) {

	$(document).foundation();
	init();
});

function init(){

  /******************************************************/
  boitierExterne.init();
  photoDisplay();
  currentStream.init()
    .then( function() {
      $('.js--modeSelector[data-mediatype="photo"]').trigger( 'click');
    }, function(err) {
      console.log("failed to init : " + err);
    });

  // delete file
  $('body').on('click', '.js--delete-media-capture', function(){
    var mediaToDelete =
    {
      "mediaName" : $(document).data('lastCapturedMediaName'),
      "mediaFolderPath" : $(document).data('lastCapturedMediaFolderPath'),
    }
    sendData.deleteMedia( mediaToDelete);
    backAnimation();

  });

  // fullscreen();

}

var sendData = {

  createNewMedia : function( mediaData) {
    socket.emit( 'newMedia', mediaData);
  },
  editMedia : function( mediaData) {
    socket.emit( 'editMediaMeta', mediaData);
  },

  deleteMedia : function( mediaData) {
    socket.emit( 'deleteMedia', mediaData);
  },

}

function photoDisplay(){
  $(document)
    .data('currentMode', 'photo')

  $(".preview_image").show();

  $('.photo-capture').fadeIn(1000);

  $('#video').show();
  $(".image-choice").show();
  $("body").attr("data-mode", "photo");

  currentStream.startCameraFeed().then( function() {
    $(".image-choice").fadeOut('slow');
    imageMode.init();

  }, function(err) {
    console.log( "Failed to start camera feed for photo : " + err);
  });
}

var currentStream = (function(context) {

  var videoElement = document.querySelector('#video');
  var videoStream;


  function errorCallback(error) {
    console.log('navigator.getUserMedia error: ', error);
  }

  function getCameraFeed() {
    return new Promise(function(resolve, reject) {
      console.log( "Getting camera feed");

      navigator.getUserMedia(
        {
          video: true,
          audio: false
        },
        function (stream) {
          resolve( stream);
        },
        function(err) {
          alert('\n\n error: ' + JSON.stringify(err));
        }
      );
    });
  }

  

  // déclaration des fonctions accessibles de l'extérieur ici
  return {

    init : function() {

      return new Promise(function(resolve, reject) {
        navigator.mediaDevices.enumerateDevices(), function(err) {
            reject("Failed to init stream : " + err);
          };
      });
    },

    getVideoFrame : function() {
      return videoElement;
    },

    stopAllFeeds : function() {
      if( !videoElement.paused)
        videoElement.pause();

      imageMode.stop();
    },

    startCameraFeed : function() {
      return new Promise(function(resolve, reject) {
        currentStream.stopAllFeeds();
        getCameraFeed()
          .then( function( stream) {
            videoStream = stream;
            if (navigator.mozGetUserMedia) {
              videoElement.mozSrcObject = stream;
            } else {
              var vendorURL = window.URL || window.webkitURL;
              videoElement.src = vendorURL.createObjectURL(stream);
            }
            videoElement.play();
            resolve();
          }, function(err) {
            console.log( " failed to start camera feed: " + err);
            reject();
          });
      });
    },

  }

})();

function onMediaCreated( image){

  var cameraPreview = document.getElementById('video-stream');

  console.log(image);
  $(document)
    .data('lastCapturedMediaName', image.file)
    .data('lastCapturedMediaFolderPath', image.path)
    ;

  imageMode.showImagePreview( 'images/'+image.file+'.jpg');
  animateWindows();
}


//animation des fenêtres à la capture
function animateWindows(){
  $(document).trigger('close_settings_pane');
	$('body').attr('data-state', 'expanded');
}

//fenêtre de preview retourne au center
function backAnimation(){
	$('body').attr('data-state', '');
}

function justCaptured() {
  // passer le body en "data-justcaptured=yes" pendant un temps
  $('body').attr('data-justcaptured', 'yes');
  setTimeout( function() {
    $('body').attr('data-justcaptured', '');
  }, 400);
}

function mediaJustCaptured() {
  return $('body').attr('data-justcaptured') === 'yes';
}


// function saveFeedback(icone){

//   var $iconeFeedback = $("<div class='icone-feedback'><img src='"+icone+"'></div>");
//   $("body").append( $iconeFeedback );
//   setTimeout(function(){
//     $iconeFeedback.fadeIn('slow').velocity({"top":"25px", "left":$(window).width() - 50, "width":"20px"},1000, "ease", function(){
//       $(this).fadeOut('slow', function(){
//         $(this).remove();
//         $(".count-add-media.plus-media").fadeIn('slow', function(){
//           $(this).fadeOut('slow');
//         });
//       });
//     });
//   }, 500);
// }

// function fullscreen(){
//   var target = $('.captureLeft')[0]; // Get DOM element from jQuery collection
//   $('.js--goFullscreen').on('click', function(){
//     if (screenfull.enabled) {
//       screenfull.request(target);
//     }
//   });
//   $('.js--leaveFullscreen').on('click', function(){
//     screenfull.exit();
//   });

//   if (screenfull.enabled) {
//       document.addEventListener(screenfull.raw.fullscreenchange, function () {
//           if( screenfull.isFullscreen)
//             $('body').addClass('is--fullscreen');
//           else
//             $('body').removeClass('is--fullscreen');
//       });
//   }
// }



