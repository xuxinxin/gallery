/* jquery.galllery3d.js - 2012©yamoo9.com */
;(function(){
	$.fn.gallery3d = function(options){
		options = $.extend({
			current  : 0,
			autoPlay : false,
			sec		 : 1
		},options)
		return this.each(function(){
			/*初始化*/
			var $this = $(this),
				$links = $this.find('> div'),
				$container = $('<div class="gallery3d__container" />').prependTo($this),
				linksLength = $links.length,
				$nav,$navPrev,$navNext,
				current = options.current,
				clear_autoPlay;

			$this.addClass('gallery3d');

			$container.append($links);
			$links.find('img').addClass('gallery3d__img');
			$links.find('img+p').addClass('gallery3d__imgdesc');

			if(linksLength > 2){
				$nav = $('<nav class="gallery3d__nav" />').appendTo($this);
				createBtn($nav, 'gallery3d__nav--prev', '');
				createBtn($nav, 'gallery3d__nav--next', '');
				$navPrev = $nav.find('#gallery3d__nav--prev').append('<i class="fa fa-angle-left"></i>');
				$navNext = $nav.find('#gallery3d__nav--next').append('<i class="fa fa-angle-right"></i>');

				setImg();
				setNav();



				setTimeout(autoPlay, options.sec*1000);

			}//If linksLength <3 need more process

			function createBtn(parent, IDName, text){//DRY 2btn
				$('<button/>', {
					'type': 'button',
					'id': IDName,
					'text': text
				}).appendTo(parent);
			}

			/*
			 *  set current,prev,next image rely on direction and current
			 *  @direction: set next or perv
			 */
			function setImg (direction) {
				var $current, $prev, $next, $others;
				var backsrc;
					imgName = ['a','b','c','d','e','f','g','h','i','g','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
				backsrc = "images/"+imgName[Math.round(Math.random()*25)]+".jpg";
				console.log(backsrc);

				if(current < 0) current = linksLength-1;
				if(current > linksLength-1) current = 0;

				$current = $links.eq(current);
				$prev = (current == 0) ? $links.eq(linksLength-1) : $links.eq(current-1);
				$next = (current == linksLength-1) ? $links.eq(0) : $links.eq(current+1);

				$current.add($prev).add($next).find('.gallery3d--backimg').remove();

				if(!direction){ //without button click
					$current.addClass('gallery3d--center');
					$prev.addClass('gallery3d--prev');
					$next.addClass('gallery3d--next');
				} else if(direction == "prev"){
					$prev.addClass('gallery3d--prev').fadeTo(200, 1);
					$current.removeClass('gallery3d--prev').addClass('gallery3d--center');
					$next.removeClass('gallery3d--center').addClass('gallery3d--next');
				} else{
					$next.addClass('gallery3d--next').fadeTo(200,1);
					$current.removeClass('gallery3d--next').addClass('gallery3d--center');
					$prev.removeClass('gallery3d--center').addClass('gallery3d--prev');
				}
				$others = $links.not($prev).not($current).not($next);
				$others.removeClass().fadeTo(1,0);


				$backImage = $('<img class="gallery3d--backimg">').appendTo($current);
				$backImage.attr("src", backsrc);

			}

			/*
			 *  bind click event to button
			 */
			function setNav () {
				$navPrev.on('click', prevSlide);
				$navNext.on('click', nextSlide);
				if(options.autoplay){
					$navPrev.add($navNext).on('click', function(){
						options.autoPlay = false;
					});
				}
			}
			/*Prevent user click too fast*/
			function clickFast () {
				//$navPrev.add($navNext).unbind('click');
				$.unbind('click');
				setTimeout(function(){
					$navPrev.on('click', prevSlide);
					$navNext.on('click', nextSlide);
				}, 500);
			}

			function prevSlide () {
				current--;
				setImg('prev');
				clickFast();
			}

			function nextSlide () {
				current++;
				setImg('next');
				clickFast();
			}

			function autoPlay () {
				if(options.autoPlay){
					current++;
					setImg('next');
					clear_autoPlay = setTimeout(autoPlay, options.sec*1000)
				}else{
					clearTimeout(clear_autoPlay);
					delete clear_autoPlay;
				}
			}

			function clearFlip(){
				$links.find('.flip').removeClass('flip');
			}
		})
	}
})();