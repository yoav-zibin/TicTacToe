'use strict';

// The files we want to cache
var urlsToCache = [
  '//yoav-zibin.github.io/TicTacToe/dist/index.min.html',

  // Same list as in Gruntfile.js (for AppCache)
  '//yoav-zibin.github.io/TicTacToe/dist/js/everything.min.js',
  '//yoav-zibin.github.io/TicTacToe/dist/css/everything.min.css',
];
var CACHE_NAME = 'cache-v<REPLACE_WITH_DATE_IN_GRUNT>';

self.addEventListener('activate', function(event) {
  event.waitUntil(
      caches.keys().then(function(cacheNames) {
        return Promise.all(
            cacheNames.map(function(cacheName) {
              if (cacheName != CACHE_NAME) {
                return caches.delete(cacheName);
              }
            })  
        );
      })
  );
});

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
        if (response) {
          console.log('Service-worker: Cache hit for request ', event.request);
          return response;
        }
        //return fetch(event.request);

        console.log('Service-worker: Cache miss (fetching from internet) for request ', event.request);
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
                console.log('Service-worker: Storing in cache request ', event.request);
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
    );
});
