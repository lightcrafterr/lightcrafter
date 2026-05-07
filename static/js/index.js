window.HELP_IMPROVE_VIDEOJS = false;

var INTERP_BASE = "./static/interpolation/stacked";
var NUM_INTERP_FRAMES = 240;

var interp_images = [];
function preloadInterpolationImages() {
  for (var i = 0; i < NUM_INTERP_FRAMES; i++) {
    var path = INTERP_BASE + '/' + String(i).padStart(6, '0') + '.jpg';
    interp_images[i] = new Image();
    interp_images[i].src = path;
  }
}

function setInterpolationImage(i) {
  var image = interp_images[i];
  image.ondragstart = function() { return false; };
  image.oncontextmenu = function() { return false; };
  $('#interpolation-image-wrapper').empty().append(image);
}


$(document).ready(function() {
    // Check for click events on the navbar burger icon
    $(".navbar-burger").click(function() {
      // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
      $(".navbar-burger").toggleClass("is-active");
      $(".navbar-menu").toggleClass("is-active");

    });

    var options = {
			slidesToScroll: 1,
			slidesToShow: 3,
			loop: true,
			infinite: true,
			autoplay: false,
			autoplaySpeed: 3000,
    }

		// Initialize all div with carousel class
    var carousels = bulmaCarousel.attach('.carousel', options);

    // Loop on each carousel initialized
    for(var i = 0; i < carousels.length; i++) {
    	// Add listener to  event
    	carousels[i].on('before:show', state => {
    		console.log(state);
    	});
    }

    // Access to bulmaCarousel instance of an element
    var element = document.querySelector('#my-element');
    if (element && element.bulmaCarousel) {
    	// bulmaCarousel instance is available as element.bulmaCarousel
    	element.bulmaCarousel.on('before-show', function(state) {
    		console.log(state);
    	});
    }

    /*var player = document.getElementById('interpolation-video');
    player.addEventListener('loadedmetadata', function() {
      $('#interpolation-slider').on('input', function(event) {
        console.log(this.value, player.duration);
        player.currentTime = player.duration / 100 * this.value;
      })
    }, false);*/
    preloadInterpolationImages();

    $('#interpolation-slider').on('input', function(event) {
      setInterpolationImage(this.value);
    });
    setInterpolationImage(0);
    $('#interpolation-slider').prop('max', NUM_INTERP_FRAMES - 1);

    bulmaSlider.attach();

    // ----- Synchronize videos within the same comparison/gallery row -----
    // Each `.comparison-card > .columns` or `.gallery-card > .columns` is a
    // group whose videos should loop in lockstep. We:
    //   1. wait for all videos in the group to reach `loadedmetadata`,
    //   2. once ready, lock their currentTime to the first video's currentTime
    //      every animation frame so playback stays in sync,
    //   3. when one video reaches its end (and it loops), seek every sibling
    //      back to 0 so we don't drift.
    function syncVideoGroup(groupRoot) {
      var videos = Array.prototype.slice.call(
        groupRoot.querySelectorAll('video.comparison-video, video.gallery-video')
      );
      if (videos.length < 2) return;

      videos.forEach(function (v) {
        v.muted = true;
        v.playsInline = true;
        v.loop = true;
      });

      function ready(v) {
        return v.readyState >= 1;  // HAVE_METADATA
      }

      function whenAllReady(cb) {
        if (videos.every(ready)) { cb(); return; }
        videos.forEach(function (v) {
          if (!ready(v)) {
            v.addEventListener('loadedmetadata', function once() {
              v.removeEventListener('loadedmetadata', once);
              if (videos.every(ready)) cb();
            });
          }
        });
      }

      whenAllReady(function () {
        var anchor = videos[0];
        anchor.currentTime = 0;
        videos.forEach(function (v) { v.currentTime = 0; });
        videos.forEach(function (v) { v.play().catch(function () { /* ignore autoplay errors */ }); });

        // Re-sync every animation frame using the first video as the master clock.
        function tick() {
          var t = anchor.currentTime;
          videos.forEach(function (v, idx) {
            if (idx === 0) return;
            var drift = Math.abs(v.currentTime - t);
            if (drift > 0.12) v.currentTime = t;
          });
          requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    }

    document.querySelectorAll('.comparison-card, .gallery-card').forEach(function (card) {
      syncVideoGroup(card);
    });
})
