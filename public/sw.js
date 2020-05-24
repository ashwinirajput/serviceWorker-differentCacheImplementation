var CACHE_STATIC_NAME = "static-v2";
var CACHE_DYNAMIC_NAME = "dynamic-v1";
var STATICFILES = [
  "/",
  "/index.html",
  "/src/css/app.css",
  "/src/css/main.css",
  "/src/js/main.js",
  "/src/js/material.min.js",
  "https://fonts.googleapis.com/css?family=Roboto:400,700",
  "https://fonts.googleapis.com/icon?family=Material+Icons",
  "https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css"
];
self.addEventListener("install", function(event) {
  event.waitUntil(
    caches.open(CACHE_STATIC_NAME).then(function(cache) {
      cache.addAll(STATICFILES);
    })
  );
});

self.addEventListener("activate", function(event) {
  event.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(
        keyList.map(function(key) {
          if (key !== CACHE_STATIC_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
});

// self.addEventListener('fetch', function(event) {
//   event.respondWith(
//     caches.match(event.request)
//       .then(function(response) {
//         if (response) {
//           return response;
//         } else {
//           return fetch(event.request)
//             .then(function(res) {
//               return caches.open(CACHE_DYNAMIC_NAME)
//                 .then(function(cache) {
//                   cache.put(event.request.url, res.clone());
//                   return res;
//                 });
//             })
//             .catch(function(err) {

//             });
//         }
//       })
//   );
// });

//network only strategy
// self.addEventListener("fetch", event => {
//   event.respondWith(
//     fetch(event.request)
//   );
// });
//cache only
// self.addEventListener("fetch", event => {
//   event.respondWith(caches.match(event.request));
// });

//Network, cache fallback (bad if netwok has issue and takes time to fail like taking more than 2 min at that time nothing will display on screen)
// self.addEventListener("fetch", event => {
//   event.respondWith(
//     fetch(event.request)
//       .then(res => {
//         //adding dynamic cacheing here
//         //res.clone() here you consuming the request that's why you can't store in cache
//         return caches.open(CACHE_DYNAMIC_NAME).then(cache => {
//           cache.put(event.request.url, res.clone());
//           return res;
//         });
//       })
//       .catch(error => caches.match(event.request))
//   );
// });
//cache, then network (need to right your code in js and sw)
// self.addEventListener("fetch", event => {
//   event.respondWith(
//     caches.open(CACHE_DYNAMIC_NAME).then(cache => {
//       return fetch(event.request).them(res => {
//         cache.put(event.request.url, res.clone());
//         return res;
//       });
//     })
//   );
//});
matchFun = (array, string) => {
  for (let i = 0; i < array.length; i++) {
    if (array[i] == string) {
      return true;
    }
  }
  return false;
};

self.addEventListener("fetch", event => {
  var url = "https://httpbin.org/ip";
  if (event.request.url.indexOf(url) > -1) {
    //cache the network
    event.respondWith(
      caches.open(CACHE_DYNAMIC_NAME).then(cache => {
        return fetch(event.request).them(res => {
          cache.put(event.request.url, res.clone());
          return res;
        });
      })
    );
  } else if (matchFun(STATICFILES, event.request.url)) {
    self.addEventListener("fetch", event => {
      event.respondWith(caches.match(event.request));
    });
  } else {
    //cache- network fall back
    event.respondWith(
      caches.match(event.request).then(function(response) {
        if (response) {
          return response;
        } else {
          return fetch(event.request)
            .then(function(res) {
              return caches.open(CACHE_DYNAMIC_NAME).then(function(cache) {
                cache.put(event.request.url, res.clone());
                return res;
              });
            })
            .catch(function(err) {});
        }
      })
    );
  }
});
