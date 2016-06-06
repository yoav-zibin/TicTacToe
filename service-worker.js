'use strict';

// The files we want to cache
var urlsToCache = [
  '//yoav-zibin.github.io/TicTacToe/dist/index.min.html',

  // Same list as in Gruntfile.js (for AppCache)
  '//yoav-zibin.github.io/TicTacToe/dist/js/everything.min.js',
  '//yoav-zibin.github.io/TicTacToe/dist/css/everything.min.css',
  '//yoav-zibin.github.io/TicTacToe/dist/imgs/HelpSlide1.png',
  '//yoav-zibin.github.io/TicTacToe/dist/imgs/HelpSlide2.png',
  '//yoav-zibin.github.io/angular-material-with-sourceMappingURL/angular.min.js',
  '//yoav-zibin.github.io/angular-material-with-sourceMappingURL/angular-touch.min.js',
  '//cdnjs.cloudflare.com/ajax/libs/angular-ui-bootstrap/0.12.1/ui-bootstrap-tpls.min.js',
  '//maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css',
  // glyphicons for the carousel
  '//maxcdn.bootstrapcdn.com/bootstrap/3.3.1/fonts/glyphicons-halflings-regular.woff',
  '//maxcdn.bootstrapcdn.com/bootstrap/3.3.1/fonts/glyphicons-halflings-regular.ttf',
  '//yoav-zibin.github.io/emulator/dist/turnBasedServices.3.min.js',
  '//yoav-zibin.github.io/emulator/main.css',
];
var CACHE_NAME = 'cache-v1';

self.addEventListener('install', function(event) {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        if (response) {
          return response;
        }
        //return fetch(event.request);

        // Cache miss - fetch from the internet and put in cache (for things like avatars from FB).

        // IMPORTANT: Clone the request. A request is a stream and
        // can only be consumed once. Since we are consuming this
        // once by cache and once by the browser for fetch, we need
        // to clone the response
        var fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          function(response) {
            // Check if we received a valid response
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have 2 stream.
            var responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
    );
});
