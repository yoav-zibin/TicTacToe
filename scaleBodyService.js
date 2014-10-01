'use strict';

angular.module('myApp.scaleBodyService', [])
  .service('scaleBodyService', function($window, $log) {
    var doc = $window.document;
    var body = doc.body;
    var gameSize = null;

    function scaleBody(_gameSize) {
      gameSize = _gameSize;
      rescale();
    }

    function rescale() {
      if (gameSize === null) {
        return;
      }
      $log.info(["Scaling the body to size: ", gameSize]);
      var myGameWidth = gameSize.width;
      var myGameHeight = gameSize.height;
      var scaleX = $window.innerWidth / myGameWidth;
      var scaleY = $window.innerHeight / myGameHeight;
      var scale = Math.min(scaleX, scaleY);
      var tx = (window.innerWidth / scale - myGameWidth) / 2;
      var ty = (window.innerHeight / scale - myGameHeight) / 2;
      var transformString = "scale(" + scale + "," + scale + ")  translate(" + tx + "px, " + ty + "px)";
      body.style['transform'] = transformString;
      body.style['-o-transform'] = transformString;
      body.style['-webkit-transform'] = transformString;
      body.style['-moz-transform'] = transformString;
      body.style['-ms-transform'] = transformString;
      var transformOriginString = "top left";
      body.style['transform-origin'] = transformOriginString;
      body.style['-o-transform-origin'] = transformOriginString;
      body.style['-webkit-transform-origin'] = transformOriginString;
      body.style['-moz-transform-origin'] = transformOriginString;
      body.style['-ms-transform-origin'] = transformOriginString;
    }

    $window.onresize = rescale;
    $window.onorientationchange = rescale;
    doc.addEventListener("orientationchange", rescale);

    this.scaleBody = scaleBody;
  });
