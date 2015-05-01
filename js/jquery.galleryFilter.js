;(function(){
	$.fn.galleryFilter = function(options){
		options = $.extend({
			current  : 0,
			autoPlay : false,
			sec		 : 3
		},options);
		return this.each(function(){

			//初始化
			var $this = $(this),
				$slides = $('.gallery__item'),
				//$canvases = $('<canvas />').prependTo($slides),
				slidesLength = $slides.length,
				$nav  = $('.gallery__nav'),
				$images = $slides.find('img'),
				current = options.current,
				supportCanvas = true,
				filter = options.filter || 'default';
			processImage();
			function processImage(){
				$images.each(function(){
					createCanvasOverlay(this);
				});
			}
			function createCanvasOverlay(image){
				var canvas			= image.previousSibling || document.createElement('canvas'),
					canvasContext	= canvas.getContext("2d");

				// Make it the same size as the image
				canvas.width = $images[0].width;
				canvas.height = $images[0].height;

				// Drawing the default version of the image on the canvas:
				canvasContext.drawImage(image,0,0, canvas.width, canvas.height);

				try	{
					var imageData	= canvasContext.getImageData(0,0,canvas.width,canvas.height),
					data		= imageData.data;
				}catch(e){
					supportCanvas = false;
					return false;
				}
				// Taking the image data and storing it in the imageData array:
				var imageData	= canvasContext.getImageData(0,0,canvas.width,canvas.height),
					data		= imageData.data;

				// Loop through all the pixels in the imageData array, and modify
				// the red, green, and blue color values.
				if(filter == "default"){
					data = filterDefault(data);
				}else if(filter == 'greyscale'){
					data = filterGrayscale(data);
				}else if(filter == 'brighter'){
					data = filterBrighten(data);
				}else if(filter == 'threshold'){
					filterThreshold(data);
				}
				// Putting the modified imageData back to the canvas.
				canvasContext.putImageData(imageData,0,0);
				
				// Inserting the canvas in the DOM, before the image:
				image.parentNode.insertBefore(canvas,image);
			}

			$(window).load(function(){
				var _time = {};
				$('.gallery__control a').on('click', function(){
					$('.gallery__control a').removeClass('control--active');
					$(this).addClass('control--active');
					if (filter == $(this).html()) return false;
					filter = $(this).html();
					processImage();
				});
				$nav.on('click', function() {
					if(_time['navclick']) return false;
					var $current = $slides.eq(current),
						$canvas  = $current.find('canvas'),
						nextIndex = 0;

					if($(this).hasClass('nav--next')){
						nextIndex = (current >= slidesLength-1 ? 0 : current+1);
					}else{
						nextIndex = (current <= 0 ? slidesLength-1 :current-1);
					}

					var $next = $slides.eq(nextIndex);
					if(supportCanvas){
						$canvas.fadeIn(function(){
							$next.show();
							$current.fadeOut(function(){
								$current.removeClass('gallery--current');
								$canvas.hide();
								$next.addClass('gallery--current');
							});
						});
					}else{
						$next.addClass('gallery--current').fadeIn();
						$current.removeClass('gallery--current').fadeOut();
					}
					current = nextIndex;
					_time['navclick'] = true;
					setTimeout(function(){
						delete _time['navclick'];
					},800);
				});
			});

			/* Filters the given pixels
			 *
			 * Arguments:
			 * pixels -- an array of pixel values
			 */
			function filterDefault (pixels) {
				for(var i = 0,z=pixels.length;i<z;i++){

						// The values for red, green and blue are consecutive elements
						// in the imageData array. We modify the three of them at once:

						pixels[i] = ((pixels[i] < 128) ? (2*pixels[i]*pixels[i] / 255) : (255 - 2 * (255 - pixels[i]) * (255 - pixels[i]) / 255));
						pixels[++i] = ((pixels[i] < 128) ? (2*pixels[i]*pixels[i] / 255) : (255 - 2 * (255 - pixels[i]) * (255 - pixels[i]) / 255));
						pixels[++i] = ((pixels[i] < 128) ? (2*pixels[i]*pixels[i] / 255) : (255 - 2 * (255 - pixels[i]) * (255 - pixels[i]) / 255));

						// After the RGB elements is the alpha value, but we leave it the same.
						++i;
					}
			}


			/* Filters the given pixels to grayscale.
			 *
			 * Arguments:
			 * pixels -- an array of pixel values
			 */
			function filterGrayscale(pixels) {
			  for (var i = 0; i < pixels.length; i += 4) {
			    // use average as grayscale value
			    var grayscale = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;

			    // when all rgb components are the same, the color is grayscale
			    pixels[i] = grayscale;
			    pixels[i + 1] = grayscale;
			    pixels[i + 2] = grayscale;
			  }

			  return pixels;
			}

			/* Brightens the given pixels.
			 *
			 * Arguments:
			 * pixels -- an array of pixel values
			 */
			function filterBrighten(pixels) {
			  for (var i = 0; i < pixels.length; i += 4) {
			    // add constant adjustment value to all components to increase brightness
			    pixels[i] += 40;
			    pixels[i + 1] += 40;
			    pixels[i + 2] += 40;
			  }

			  return pixels;
			}

			/* Applies a threshold filter to the given pixels. Makes all pixels above
			 * the threshold black and all pixels below the threshold white.
			 *
			 * Arguments:
			 * pixels -- an array of pixel values
			 */
			function filterThreshold(pixels) {
			  for (var i = 0; i < pixels.length; i += 4) {
			    var red = pixels[i];
			    var green = pixels[i + 1];
			    var blue = pixels[i + 2];

			    // get cartesian distance from black at (0, 0, 0)
			    var distance = Math.sqrt(red * red + green * green + blue * blue);

			    if (distance < 150) {
			      // pixel meets threshold and is close to black; set it to black
			      pixels[i] = 0;
			      pixels[i + 1] = 0;
			      pixels[i + 2] = 0;
			    } else {
			      // pixel exceeds threshold; set it to white
			      pixels[i] = 255;
			      pixels[i + 1] = 255;
			      pixels[i + 2] = 255;
			    }
			  }

			  return pixels;
			}

			
		})
	}
})();