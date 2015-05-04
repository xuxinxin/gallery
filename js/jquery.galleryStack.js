;(function($, window, undefined){

    // ======================= imagesLoaded Plugin ===============================
	// https://github.com/desandro/imagesloaded

	// $('#my-container').imagesLoaded(myFunction)
	// execute a callback when all images have loaded.
	// needed because .load() doesn't work on cached images

	// callback function gets image collection as argument
	//  this is the container

	// original: mit license. paul irish. 2010.
	// contributors: Oren Solomianik, David DeSandro, Yiannis Chatzikonstantinou

	// blank image data-uri bypasses webkit log warning (thx doug jones)
	var BLANK = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';

	$.fn.imagesLoaded = function( callback ) {
		var $this = this,
			deferred = $.isFunction($.Deferred) ? $.Deferred() : 0,
			hasNotify = $.isFunction(deferred.notify),
			$images = $this.find('img').add( $this.filter('img') ),
			loaded = [],
			proper = [],
			broken = [];

		// Register deferred callbacks
		if ($.isPlainObject(callback)) {
			$.each(callback, function (key, value) {
				if (key === 'callback') {
					callback = value;
				} else if (deferred) {
					deferred[key](value);
				}
			});
		}

		function doneLoading() {
			var $proper = $(proper),
				$broken = $(broken);

			if ( deferred ) {
				if ( broken.length ) {
					deferred.reject( $images, $proper, $broken );
				} else {
					deferred.resolve( $images );
				}
			}

			if ( $.isFunction( callback ) ) {
				callback.call( $this, $images, $proper, $broken );
			}
		}

		function imgLoaded( img, isBroken ) {
			// don't proceed if BLANK image, or image is already loaded
			if ( img.src === BLANK || $.inArray( img, loaded ) !== -1 ) {
				return;
			}

			// store element in loaded images array
			loaded.push( img );

			// keep track of broken and properly loaded images
			if ( isBroken ) {
				broken.push( img );
			} else {
				proper.push( img );
			}

			// cache image and its state for future calls
			$.data( img, 'imagesLoaded', { isBroken: isBroken, src: img.src } );

			// trigger deferred progress method if present
			if ( hasNotify ) {
				deferred.notifyWith( $(img), [ isBroken, $images, $(proper), $(broken) ] );
			}

			// call doneLoading and clean listeners if all images are loaded
			if ( $images.length === loaded.length ){
				setTimeout( doneLoading );
				$images.unbind( '.imagesLoaded' );
			}
		}

		// if no images, trigger immediately
		if ( !$images.length ) {
			doneLoading();
		} else {
			$images.bind( 'load.imagesLoaded error.imagesLoaded', function( event ){
				// trigger imgLoaded
				imgLoaded( event.target, event.type === 'error' );
			}).each( function( i, el ) {
				var src = el.src;

				// find out if this image has been already checked for status
				// if it was, and src has not changed, call imgLoaded on it
				var cached = $.data( el, 'imagesLoaded' );
				if ( cached && cached.src === src ) {
					imgLoaded( el, cached.isBroken );
					return;
				}

				// if complete is true and browser supports natural sizes, try
				// to check for image status manually
				if ( el.complete && el.naturalWidth !== undefined ) {
					imgLoaded( el, el.naturalWidth === 0 || el.naturalHeight === 0 );
					return;
				}

				// cached images don't fire load sometimes, so we reset src, but only when
				// dealing with IE, or image is complete (loaded) and failed manual check
				// webkit hack from http://groups.google.com/group/jquery-dev/browse_thread/thread/eee6ab7b2da50e1f
				if ( el.readyState || el.complete ) {
					el.src = BLANK;
					el.src = src;
				}
			});
		}

		return deferred ? deferred.promise( $this ) : $this;
	};




	$.GalleryStack = function(options,element){
		this.$el = $(element);
		this._init(options);
	}

	$.GalleryStack.defaults = {
		//default options here
	}

	$.GalleryStack.prototype = {
		_init : function(options){
			this.options = $.extend(true, {}, $.GalleryStack.defaults, options);
			this.$items = this.$el.find('li');
			this.itemsCount = this.$items.length;
			this.zindex = 0;
			if(this.itemsCount == 0){
				return false;
			}
			// current image index
			this.current = 0;

			// control if the slicebox is animating
			this.isAnimating = false;

			// control if slicebox is ready (all images loaded)
			this.isReady = false;

			// preload the images
			var self = this;
			this.$el.imagesLoaded(function(){
				for (var i = self.itemsCount - 1; i >= 0; i--) {
					if(i != self.current){
						var r = Math.floor(Math.random()*41)-20;
						self.$items.eq(i).css({
							'transition': 'transform 2s',
							'transform' : 'rotate('+r+'deg)',
							'z-index'   : '-'+i
						});
					}
				};
				self.$items.eq(this.current).css({
					'transition': 'transform 1.2s',
					'transform' : 'rotate('+0+'deg)',
					'z-index'   : '-'+0
				});
				self.zindex = -self.itemsCount;
				self.options.onReady();

				self.isReady = true;

			});



		},
		_navigate : function(dir, pos) {
			if( this.isAnimating || !this.isReady || this.itemsCount<2){
				return false;
			}
			this.isAnimating = true;

			//current item's index
			this.prev        = this.current;

			if(dir === "next"){
				this.current = this.current < this.itemsCount-1 ? this.current+1 : 0;
			}else if(dir === "prev"){
				console.log('prev click');
				this.current = this.current > 0 ? this.current-1 : this.itemsCount-1;
			}
			//test support
			//callback trigger
			this._move(dir);
		},
		_move : function(dir){
			console.log('move enter');
			var r  = Math.floor(Math.random()*41)-20,
				rh = Math.floor(Math.random()*720)-360,
				rr = Math.floor(Math.random()*100)-50,
				$current = this.$items.eq(this.prev),
				$next    = this.$items.eq(this.current),
				self = this;
			if(rh*rr<0){
				rh = -rh;
			}
			if(dir === "next"){
				$current.css({
					'transform':'translate(-600px,' +rh+'px)' + ' rotate('+rr+'deg)'
				});
				setTimeout(function(){
					$current.css({
						'z-index': ''+this.zindex,
						'transform': 'translate(0,0) '+'rotate('+r+'deg)'
					});
					console.log(this.zindex);
					this.zindex = this.zindex-1;
					$next.css({
						'transform':'rotate(0)'
					});
					this.isAnimating = false;
				}.bind(this),2000)
			}else if(dir == 'prev'){
				this.zindex = this.zindex+1;
				$next.css({
					'transform':'translate(-600px, 360px)'
				});
				setTimeout(function(){
					$next.css({
						'z-index': 100+this.zindex,
					}).css({
						'transform': 'translate(0,0)'
					});
					console.log(this.zindex);
					$current.css({
						'transform':'rotate('+r+'deg)'
					});
					this.isAnimating = false;
				}.bind(this),2000)
			}
		},
		next : function(){
			console.log('next button click');
			this._navigate('next');
		},
		previous : function(){
			console.log('prev button click');
			this._navigate('prev');
		}
	}
	$.fn.galleryStack = function(options){
		var self = $.data( this, 'galleryStack');

		this.each(function(){
			if(self){
				self._init();
			}else{
				self = $.data(this, 'galleryStack', new $.GalleryStack(options, this));
			}
		});
		return self;
	};
})(jQuery, window);