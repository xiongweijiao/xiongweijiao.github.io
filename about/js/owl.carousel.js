/*
 *	jQuery OwlCarousel v1.31
 *
 *	Copyright (c) 2013 Bartosz Wojciechowski
 *	http://www.owlgraphic.com/owlcarousel/
 *
 *	Licensed under MIT
 *
 */

if ( typeof Object.create !== "function" ) {
	Object.create = function( obj ) {
		function F() {};
		F.prototype = obj;
		return new F();
	};
}
(function( $, window, document, undefined ) {

	var Carousel = {
		init :function(options, el){
			var base = this;

			base.$elem = $(el);

			// options passed via js override options passed via data attributes
			base.options = $.extend({}, $.fn.owlCarousel.options, base.$elem.data(), options);

			base.userOptions = options;
			base.loadContent();
		},

		loadContent : function(){
			var base = this;

			if (typeof base.options.beforeInit === "function") {
				base.options.beforeInit.apply(this,[base.$elem]);
			}

			if (typeof base.options.jsonPath === "string") {
				var url = base.options.jsonPath;

				function getData(data) {
					if (typeof base.options.jsonSuccess === "function") {
						base.options.jsonSuccess.apply(this,[data]);
					} else {
						var content = "";
						for(var i in data["owl"]){
							content += data["owl"][i]["item"];
						}
						base.$elem.html(content);
					}
					base.logIn();
				}
				$.getJSON(url,getData);
			} else {
				base.logIn();
			}
		},

		logIn : function(action){
			var base = this;

			base.$elem.data("owl-originalStyles", base.$elem.attr("style"))
					  .data("owl-originalClasses", base.$elem.attr("class"));

			base.$elem.css({opacity: 0});
			base.orignalItems = base.options.items;
			base.checkBrowser();
			base.wrapperWidth = 0;
			base.checkVisible;
			base.setVars();
		},

		setVars : function(){
			var base = this;
			if(base.$elem.children().length === 0){return false}
			base.baseClass();
			base.eventTypes();
			base.$userItems = base.$elem.children();
			base.itemsAmount = base.$userItems.length;
			base.wrapItems();
			base.$owlItems = base.$elem.find(".owl-item");
			base.$owlWrapper = base.$elem.find(".owl-wrapper");
			base.playDirection = "next";
			base.prevItem = 0;
			base.prevArr = [0];
			base.currentItem = 0;
			base.customEvents();
			base.onStartup();
		},

		onStartup : function(){
			var base = this;
			base.updateItems();
			base.calculateAll();
			base.buildControls();
			base.updateControls();
			base.response();
			base.moveEvents();
			base.stopOnHover();
			base.owlStatus();

			if(base.options.transitionStyle !== false){
				base.transitionTypes(base.options.transitionStyle);
			}
			if(base.options.autoPlay === true){
				base.options.autoPlay = 5000;
			}
			base.play();

			base.$elem.find(".owl-wrapper").css("display","block")

			if(!base.$elem.is(":visible")){
				base.watchVisibility();
			} else {
				base.$elem.css("opacity",1);
			}
			base.onstartup = false;
			base.eachMoveUpdate();
			if (typeof base.options.afterInit === "function") {
				base.options.afterInit.apply(this,[base.$elem]);
			}
		},

		eachMoveUpdate : function(){
			var base = this;

			if(base.options.lazyLoad === true){
				base.lazyLoad();
			}
			if(base.options.autoHeight === true){
				base.autoHeight();
			}
			base.onVisibleItems();

			if (typeof base.options.afterAction === "function") {
				base.options.afterAction.apply(this,[base.$elem]);
			}
		},

		updateVars : function(){
			var base = this;
			if(typeof base.options.beforeUpdate === "function") {
				base.options.beforeUpdate.apply(this,[base.$elem]);
			}
			base.watchVisibility();
			base.updateItems();
			base.calculateAll();
			base.updatePosition();
			base.updateControls();
			base.eachMoveUpdate();
			if(typeof base.options.afterUpdate === "function") {
				base.options.afterUpdate.apply(this,[base.$elem]);
			}
		},

		reload : function(elements){
			var base = this;
			setTimeout(function(){
				base.updateVars();
			},0)
		},

		watchVisibility : function(){
			var base = this;

			if(base.$elem.is(":visible") === false){
				base.$elem.css({opacity: 0});
				clearInterval(base.autoPlayInterval);
				clearInterval(base.checkVisible);
			} else {
				return false;
			}
			base.checkVisible = setInterval(function(){
				if (base.$elem.is(":visible")) {
					base.reload();
					base.$elem.animate({opacity: 1},200);
					clearInterval(base.checkVisible);
				}
			}, 500);
		},

		wrapItems : function(){
			var base = this;
			base.$userItems.wrapAll("<div class="\"owl-wrapper\"">").wrap("<div class="\"owl-item\""></div>");
			base.$elem.find(".owl-wrapper").wrap("<div class="\"owl-wrapper-outer\"">");
			base.wrapperOuter = base.$elem.find(".owl-wrapper-outer");
			base.$elem.css("display","block");
		},

		baseClass : function(){
			var base = this;
			var hasBaseClass = base.$elem.hasClass(base.options.baseClass);
			var hasThemeClass = base.$elem.hasClass(base.options.theme);

			if(!hasBaseClass){
				base.$elem.addClass(base.options.baseClass);
			}

			if(!hasThemeClass){
				base.$elem.addClass(base.options.theme);
			}
		},

		updateItems : function(){
			var base = this;

			if(base.options.responsive === false){
				return false;
			}
			if(base.options.singleItem === true){
				base.options.items = base.orignalItems = 1;
				base.options.itemsCustom = false;
				base.options.itemsDesktop = false;
				base.options.itemsDesktopSmall = false;
				base.options.itemsTablet = false;
				base.options.itemsTabletSmall = false;
				base.options.itemsMobile = false;
				return false;
			}

			var width = $(base.options.responsiveBaseWidth).width();

			if(width > (base.options.itemsDesktop[0] || base.orignalItems) ){
				base.options.items = base.orignalItems;
			}

			if(typeof(base.options.itemsCustom) !== 'undefined' && base.options.itemsCustom !== false){
				//Reorder array by screen size
				base.options.itemsCustom.sort(function(a,b){return a[0]-b[0];});
				for(var i in base.options.itemsCustom){
					if(typeof(base.options.itemsCustom[i]) !== 'undefined' && base.options.itemsCustom[i][0] <= width){="" base.options.items="base.options.itemsCustom[i][1];" }="" else="" {="" if(width="" <="base.options.itemsDesktop[0]" &&="" base.options.itemsdesktop="" !="=" false){="" base.options.itemsdesktopsmall="" base.options.itemstablet="" base.options.itemstabletsmall="" base.options.itemsmobile="" if="" number="" of="" items="" is="" less="" than="" declared="" if(base.options.items=""> base.itemsAmount && base.options.itemsScaleUp === true){
				base.options.items = base.itemsAmount;
			}
		},

		response : function(){
			var base = this,
				smallDelay;
			if(base.options.responsive !== true){
				return false
			}
			var lastWindowWidth = $(window).width();

			base.resizer = function(){
				if($(window).width() !== lastWindowWidth){
					if(base.options.autoPlay !== false){
						clearInterval(base.autoPlayInterval);
					}
					clearTimeout(smallDelay);
					smallDelay = setTimeout(function(){
						lastWindowWidth = $(window).width();
						base.updateVars();
					},base.options.responsiveRefreshRate);
				}
			}
			$(window).resize(base.resizer)
		},

		updatePosition : function(){
			var base = this;
			base.jumpTo(base.currentItem);
			if(base.options.autoPlay !== false){
				base.checkAp();
			}
		},

		appendItemsSizes : function(){
			var base = this;

			var roundPages = 0;
			var lastItem = base.itemsAmount - base.options.items;

			base.$owlItems.each(function(index){
				var $this = $(this);
				$this
					.css({"width": base.itemWidth})
					.data("owl-item",Number(index));

				if(index % base.options.items === 0 || index === lastItem){
					if(!(index > lastItem)){
						roundPages +=1;
					}
				}
				$this.data("owl-roundPages",roundPages)
			});
		},

		appendWrapperSizes : function(){
			var base = this;
			var width = 0;

			var width = base.$owlItems.length * base.itemWidth;

			base.$owlWrapper.css({
				"width": width*2,
				"left": 0
			});
			base.appendItemsSizes();
		},

		calculateAll : function(){
			var base = this;
			base.calculateWidth();
			base.appendWrapperSizes();
			base.loops();
			base.max();
		},

		calculateWidth : function(){
			var base = this;
			base.itemWidth = Math.round(base.$elem.width()/base.options.items)
		},

		max : function(){
			var base = this;
			var maximum = ((base.itemsAmount * base.itemWidth) - base.options.items * base.itemWidth) * -1;
			if(base.options.items > base.itemsAmount){
				base.maximumItem = 0;
				maximum = 0
				base.maximumPixels = 0;
			} else {
				base.maximumItem = base.itemsAmount - base.options.items;
				base.maximumPixels = maximum;
			}
			return maximum;
		},

		min : function(){
			return 0;
		},

		loops : function(){
			var base = this;

			base.positionsInArray = [0];
			base.pagesInArray = [];
			var prev = 0;
			var elWidth = 0;

			for(var i = 0; i<base.itemsamount; i++){="" elwidth="" +="base.itemWidth;" base.positionsinarray.push(-elwidth);="" if(base.options.scrollperpage="==" true){="" var="" item="$(base.$owlItems[i]);" roundpagenum="item.data("owl-roundPages");" if(roundpagenum="" !="=" prev){="" base.pagesinarray[prev]="base.positionsInArray[i];" prev="roundPageNum;" }="" },="" buildcontrols="" :="" function(){="" base="this;" if(base.options.navigation="==" true="" ||="" base.options.pagination="==" base.owlcontrols="$("<div" class="\"owl-controls\"/">").toggleClass("clickable", !base.browser.isTouch).appendTo(base.$elem);
			}
			if(base.options.pagination === true){
				base.buildPagination();
			}
			if(base.options.navigation === true){
				base.buildButtons();
			}
		},

		buildButtons : function(){
			var base = this;
			var buttonsWrapper = $("<div class="\"owl-buttons\"/">")
			base.owlControls.append(buttonsWrapper);

			base.buttonPrev = $("<div>",{
				"class" : "owl-prev",
				"html" : base.options.navigationText[0] || ""
				});

			base.buttonNext = $("<div>",{
				"class" : "owl-next",
				"html" : base.options.navigationText[1] || ""
				});

			buttonsWrapper
			.append(base.buttonPrev)
			.append(base.buttonNext);

			buttonsWrapper.on("touchstart.owlControls mousedown.owlControls", "div[class^=\"owl\"]", function(event){
				event.preventDefault();
			})

			buttonsWrapper.on("touchend.owlControls mouseup.owlControls", "div[class^=\"owl\"]", function(event){
				event.preventDefault();
				if($(this).hasClass("owl-next")){
					base.next();
				} else{
					base.prev();
				}
			})
		},

		buildPagination : function(){
			var base = this;

			base.paginationWrapper = $("<div class="\"owl-pagination\"/">");
			base.owlControls.append(base.paginationWrapper);

			base.paginationWrapper.on("touchend.owlControls mouseup.owlControls", ".owl-page", function(event){
				event.preventDefault();
				if(Number($(this).data("owl-page")) !== base.currentItem){
					base.goTo( Number($(this).data("owl-page")), true);
				}
			});
		},

		updatePagination : function(){
			var base = this;
			if(base.options.pagination === false){
				return false;
			}

			base.paginationWrapper.html("");

			var counter = 0;
			var lastPage = base.itemsAmount - base.itemsAmount % base.options.items;

			for(var i = 0; i<base.itemsamount; i++){="" if(i="" %="" base.options.items="==" 0){="" counter="" +="1;" if(lastpage="==" i){="" var="" lastitem="base.itemsAmount" -="" base.options.items;="" }="" paginationbutton="$("<div/">",{
						"class" : "owl-page"
						});
					var paginationButtonInner = $("<span></span>",{
						"text": base.options.paginationNumbers === true ? counter : "",
						"class": base.options.paginationNumbers === true ? "owl-numbers" : ""
					});
					paginationButton.append(paginationButtonInner);

					paginationButton.data("owl-page",lastPage === i ? lastItem : i);
					paginationButton.data("owl-roundPages",counter);

					base.paginationWrapper.append(paginationButton);
				}
			}
			base.checkPagination();
		},
		checkPagination : function(){
			var base = this;
			if(base.options.pagination === false){
				return false;
			}
			base.paginationWrapper.find(".owl-page").each(function(i,v){
				if($(this).data("owl-roundPages") === $(base.$owlItems[base.currentItem]).data("owl-roundPages") ){
					base.paginationWrapper
						.find(".owl-page")
						.removeClass("active");
					$(this).addClass("active");
				}
			});
		},

		checkNavigation : function(){
			var base = this;

			if(base.options.navigation === false){
				return false;
			}
			if(base.options.rewindNav === false){
				if(base.currentItem === 0 && base.maximumItem === 0){
					base.buttonPrev.addClass("disabled");
					base.buttonNext.addClass("disabled");
				} else if(base.currentItem === 0 && base.maximumItem !== 0){
					base.buttonPrev.addClass("disabled");
					base.buttonNext.removeClass("disabled");
				} else if (base.currentItem === base.maximumItem){
					base.buttonPrev.removeClass("disabled");
					base.buttonNext.addClass("disabled");
				} else if(base.currentItem !== 0 && base.currentItem !== base.maximumItem){
					base.buttonPrev.removeClass("disabled");
					base.buttonNext.removeClass("disabled");
				}
			}
		},

		updateControls : function(){
			var base = this;
			base.updatePagination();
			base.checkNavigation();
			if(base.owlControls){
				if(base.options.items >= base.itemsAmount){
					base.owlControls.hide();
				} else {
					base.owlControls.show();
				}
			}
		},

		destroyControls : function(){
			var base = this;
			if(base.owlControls){
				base.owlControls.remove();
			}
		},

		next : function(speed){
			var base = this;

			if(base.isTransition){
				return false;
			}

			base.currentItem += base.options.scrollPerPage === true ? base.options.items : 1;
			if(base.currentItem > base.maximumItem + (base.options.scrollPerPage == true ? (base.options.items - 1) : 0)){
				if(base.options.rewindNav === true){
					base.currentItem = 0;
					speed = "rewind";
				} else {
					base.currentItem = base.maximumItem;
					return false;
				}
			}
			base.goTo(base.currentItem,speed);
		},

		prev : function(speed){
			var base = this;

			if(base.isTransition){
				return false;
			}

			if(base.options.scrollPerPage === true && base.currentItem > 0 && base.currentItem < base.options.items){
				base.currentItem = 0
			} else {
				base.currentItem -= base.options.scrollPerPage === true ? base.options.items : 1;
			}
			if(base.currentItem < 0){
				if(base.options.rewindNav === true){
					base.currentItem = base.maximumItem;
					speed = "rewind"
				} else {
					base.currentItem =0;
					return false;
				}
			}
			base.goTo(base.currentItem,speed);
		},

		goTo : function(position,speed,drag){
			var base = this;

			if(base.isTransition){
				return false;
			}
			if(typeof base.options.beforeMove === "function") {
				base.options.beforeMove.apply(this,[base.$elem]);
			}
			if(position >= base.maximumItem){
				position = base.maximumItem;
			}
			else if( position <= 0="" 1="" ){="" position="0;" }="" base.currentitem="base.owl.currentItem" =="" position;="" if(="" base.options.transitionstyle="" !="=" false="" &&="" drag="" "drag"="" base.options.items="==" base.browser.support3d="==" true){="" base.swapspeed(0)="" if(base.browser.support3d="==" base.transition3d(base.positionsinarray[position]);="" else="" {="" base.css2slide(base.positionsinarray[position],1);="" base.aftergo();="" base.singleitemtransition();="" return="" false;="" var="" gotopixel="base.positionsInArray[position];" base.iscss3finish="false;" if(speed="==" base.swapspeed("paginationspeed");="" settimeout(function()="" },="" base.options.paginationspeed);="" "rewind"="" base.swapspeed(base.options.rewindspeed);="" base.options.rewindspeed);="" base.swapspeed("slidespeed");="" base.options.slidespeed);="" base.transition3d(gotopixel);="" base.css2slide(gotopixel,="" jumpto="" :="" function(position){="" base="this;" if(typeof="" base.options.beforemove="==" "function")="" base.options.beforemove.apply(this,[base.$elem]);="" if(position="">= base.maximumItem || position === -1){
				position = base.maximumItem;
			}
			else if( position <= 0="" ){="" position="0;" }="" base.swapspeed(0)="" if(base.browser.support3d="==" true){="" base.transition3d(base.positionsinarray[position]);="" else="" {="" base.css2slide(base.positionsinarray[position],1);="" base.currentitem="base.owl.currentItem" =="" position;="" base.aftergo();="" },="" aftergo="" :="" function(){="" var="" base="this;" base.prevarr.push(base.currentitem);="" base.previtem="base.owl.prevItem" base.prevarr[base.prevarr.length="" -2];="" base.prevarr.shift(0)="" if(base.previtem="" !="=" base.currentitem){="" base.checkpagination();="" base.checknavigation();="" base.eachmoveupdate();="" if(base.options.autoplay="" false){="" base.checkap();="" if(typeof="" base.options.aftermove="==" "function"="" &&="" base.currentitem)="" base.options.aftermove.apply(this,[base.$elem]);="" stop="" base.apstatus="stop" ;="" clearinterval(base.autoplayinterval);="" checkap="" if(base.apstatus="" "stop"){="" base.play();="" play="" return="" false;="" base.autoplayinterval="setInterval(function(){" base.next(true);="" },base.options.autoplay);="" swapspeed="" function(action){="" if(action="==" "slidespeed"){="" base.$owlwrapper.css(base.addcssspeed(base.options.slidespeed));="" "paginationspeed"="" base.$owlwrapper.css(base.addcssspeed(base.options.paginationspeed));="" action="" "string"){="" base.$owlwrapper.css(base.addcssspeed(action));="" addcssspeed="" function(speed){="" "-webkit-transition":="" "all="" "+="" speed="" +"ms="" ease",="" "-moz-transition":="" "-o-transition":="" "transition":="" ease"="" };="" removetransition="" "",="" ""="" dotranslate="" function(pixels){="" "-webkit-transform":="" "translate3d("+pixels+"px,="" 0px,="" 0px)",="" "-moz-transform":="" "-o-transform":="" "-ms-transform":="" "transform":="" 0px,0px)"="" transition3d="" function(value){="" base.$owlwrapper.css(base.dotranslate(value));="" css2move="" base.$owlwrapper.css({"left"="" value})="" css2slide="" function(value,speed){="" base.iscssfinish="false;" base.$owlwrapper.stop(true,true).animate({="" "left"="" value="" duration="" ||="" base.options.slidespeed="" ,="" complete="" });="" checkbrowser="" check="" 3d="" support="" translate3d="translate3d(0px, 0px, 0px)" tempelem="document.createElement("div");" tempelem.style.csstext="  -moz-transform:" +="" ";="" -ms-transform:"="" -o-transform:"="" -webkit-transform:"="" transform:"="" translate3d;="" regex="/translate3d\(0px," 0px\)="" g,="" assupport="tempElem.style.cssText.match(regex)," support3d="(asSupport" null="" assupport.length="==" 1);="" istouch="ontouchstart" in="" window="" navigator.msmaxtouchpoints;="" base.browser="{" "support3d"="" support3d,="" "istouch"="" moveevents="" if(base.options.mousedrag="" false="" base.options.touchdrag="" base.gestures();="" base.disabledevents();="" eventtypes="" types="["s","e","x"];" base.ev_types="{};" true="" "touchstart.owl="" mousedown.owl",="" "touchmove.owl="" mousemove.owl",="" "touchend.owl="" touchcancel.owl="" mouseup.owl"="" ];="" "touchstart.owl",="" "touchmove.owl",="" touchcancel.owl"="" "mousedown.owl",="" "mousemove.owl",="" "mouseup.owl"="" base.ev_types["start"]="types[0];" base.ev_types["move"]="types[1];" base.ev_types["end"]="types[2];" disabledevents="" base.$elem.on("dragstart.owl",="" function(event)="" event.preventdefault();});="" base.$elem.on("mousedown.disabletextselect",="" function(e)="" $(e.target).is('input,="" textarea,="" select,="" option');="" gestures="" locals="{" offsetx="" 0,="" offsety="" baseelwidth="" relativepos="" position:="" null,="" minswipe="" maxswipe:="" sliding="" dargging:="" targetelement="" function="" gettouches(event){="" if(event.touches){="" x="" event.touches[0].pagex,="" y="" event.touches[0].pagey="" if(event.pagex="" undefined){="" event.pagex,="" event.pagey="" event.clientx,="" event.clienty="" swapevents(type){="" if(type="==" "on"){="" $(document).on(base.ev_types["move"],="" dragmove);="" $(document).on(base.ev_types["end"],="" dragend);="" "off"){="" $(document).off(base.ev_types["move"]);="" $(document).off(base.ev_types["end"]);="" dragstart(event)="" event="event.originalEvent" window.event;="" if="" (event.which="==" 3)="" if(base.itemsamount="" <="base.options.items){" return;="" if(base.iscssfinish="==" !base.options.dragbeforeanimfinish="" if(base.iscss3finish="==" if(base.browser.istouch="" !base.$owlwrapper.hasclass("grabbing")){="" base.$owlwrapper.addclass("grabbing")="" base.newposx="0;" base.newrelativex="0;" $(this).css(base.removetransition());="" locals.relativepos="position.left;" locals.offsetx="getTouches(event).x" -="" position.left;="" locals.offsety="getTouches(event).y" position.top;="" swapevents("on");="" locals.sliding="false;" locals.targetelement="event.target" event.srcelement;="" dragmove(event){="" locals.offsetx;="" base.newposy="getTouches(event).y" locals.offsety;="" locals.relativepos;="" (typeof="" base.options.startdragging="==" locals.dragging="" 0)="" base.options.startdragging.apply(base,[base.$elem]);="" if(base.newrelativex=""> 8 || base.newRelativeX < -8 && base.browser.isTouch === true){
					event.preventDefault ? event.preventDefault() : event.returnValue = false;
					locals.sliding = true;
				}

				if((base.newPosY > 10 || base.newPosY < -10) && locals.sliding === false){
					$(document).off("touchmove.owl");
				}

				var minSwipe = function(){
					return  base.newRelativeX / 5;
				}
				var maxSwipe = function(){
					return  base.maximumPixels + base.newRelativeX / 5;
				}

				base.newPosX = Math.max(Math.min( base.newPosX, minSwipe() ), maxSwipe() );
				if(base.browser.support3d === true){
					base.transition3d(base.newPosX);
				} else {
					base.css2move(base.newPosX);
				}
			}

			function dragEnd(event){
				var event = event.originalEvent || event || window.event;
				event.target = event.target || event.srcElement;

				locals.dragging = false;

				if(base.browser.isTouch !== true){
					base.$owlWrapper.removeClass("grabbing");
				}

				if(base.newRelativeX<0){ base.dragdirection="base.owl.dragDirection" =="" "left"="" }="" else="" {="" "right"="" if(base.newrelativex="" !="=" 0){="" var="" newposition="base.getNewPosition();" base.goto(newposition,false,"drag");="" if(locals.targetelement="==" event.target="" &&="" base.browser.istouch="" true){="" $(event.target).on("click.disable",="" function(ev){="" ev.stopimmediatepropagation();="" ev.stoppropagation();="" ev.preventdefault();="" $(event.target).off("click.disable");="" });="" handlers="$._data(event.target," "events")["click"];="" owlstopevent="handlers.pop();" handlers.splice(0,="" 0,="" owlstopevent);="" swapevents("off");="" base.$elem.on(base.ev_types["start"],="" ".owl-wrapper",="" dragstart);="" },="" getnewposition="" :="" function(){="" base="this," newposition;="" if(newposition="">base.maximumItem){
				base.currentItem = base.maximumItem;
				newPosition  = base.maximumItem;
			} else if( base.newPosX >=0 ){
				newPosition = 0;
				base.currentItem = 0;
			}
			return newPosition;
		},
		closestItem : function(){
			var base = this,
				array = base.options.scrollPerPage === true ? base.pagesInArray : base.positionsInArray,
				goal = base.newPosX,
				closest = null;

			$.each(array, function(i,v){
				if( goal - (base.itemWidth/20) > array[i+1] && goal - (base.itemWidth/20)< v && base.moveDirection() === "left") {
					closest = v;
					if(base.options.scrollPerPage === true){
						base.currentItem = $.inArray(closest, base.positionsInArray);
					} else {
						base.currentItem = i;
					}
				} 
				else if (goal + (base.itemWidth/20) < v && goal + (base.itemWidth/20) > (array[i+1] || array[i]-base.itemWidth) && base.moveDirection() === "right"){
					if(base.options.scrollPerPage === true){
						closest = array[i+1] || array[array.length-1];
						base.currentItem = $.inArray(closest, base.positionsInArray);
					} else {
						closest = array[i+1];
						base.currentItem = i+1;
					}
				}
			});
			return base.currentItem;
		},

		moveDirection : function(){
			var base = this,
				direction;
			if(base.newRelativeX < 0 ){
				direction = "right"
				base.playDirection = "next"
			} else {
				direction = "left"
				base.playDirection = "prev"
			}
			return direction
		},

		customEvents : function(){
			var base = this;
			base.$elem.on("owl.next",function(){
				base.next();
			});
			base.$elem.on("owl.prev",function(){
				base.prev();
			});
			base.$elem.on("owl.play",function(event,speed){
				base.options.autoPlay = speed;
				base.play();
				base.hoverStatus = "play";
			});
			base.$elem.on("owl.stop",function(){
				base.stop();
				base.hoverStatus = "stop";
			});
			base.$elem.on("owl.goTo",function(event,item){
				base.goTo(item)
			});
			base.$elem.on("owl.jumpTo",function(event,item){
				base.jumpTo(item)
			});
		},
		
		stopOnHover : function(){
			var base = this;
			if(base.options.stopOnHover === true && base.browser.isTouch !== true && base.options.autoPlay !== false){
				base.$elem.on("mouseover", function(){
					base.stop();
				});
				base.$elem.on("mouseout", function(){
					if(base.hoverStatus !== "stop"){
						base.play();
					}
				});
			}
		},

		lazyLoad : function(){
			var base = this;

			if(base.options.lazyLoad === false){
				return false;
			}
			for(var i=0; i<base.itemsamount; i++){="" var="" $item="$(base.$owlItems[i]);" if($item.data("owl-loaded")="==" "loaded"){="" continue;="" }="" itemnumber="$item.data("owl-item")," $lazyimg="$item.find(".lazyOwl")," follow;="" if(="" typeof="" $lazyimg.data("src")="" !="=" "string"){="" $item.data("owl-loaded","loaded");="" undefined){="" $lazyimg.hide();="" $item.addclass("loading").data("owl-loaded","checked");="" if(base.options.lazyfollow="==" true){="" follow="itemNumber">= base.currentItem;
				} else {
					follow = true;
				}
				if(follow && itemNumber < base.currentItem + base.options.items && $lazyImg.length){
					base.lazyPreload($item,$lazyImg);
				}
			}
		},

		lazyPreload : function($item,$lazyImg){
			var base = this,
				iterations = 0;
				if ($lazyImg.prop("tagName") === "DIV") {
					$lazyImg.css("background-image", "url(" + $lazyImg.data("src")+ ")" );
					var isBackgroundImg=true;
				} else {
					$lazyImg[0].src = $lazyImg.data("src");
				}
				checkLazyImage();

			function checkLazyImage(){
				iterations += 1;
				if (base.completeImg($lazyImg.get(0)) || isBackgroundImg === true) {
					showImage();
				} else if(iterations <= 10="" 100){="" if="" image="" loads="" in="" less="" than="" seconds="" settimeout(checklazyimage,100);="" }="" else="" {="" showimage();="" function="" showimage(){="" $item.data("owl-loaded",="" "loaded").removeclass("loading");="" $lazyimg.removeattr("data-src");="" base.options.lazyeffect="==" "fade"="" ?="" $lazyimg.fadein(400)="" :="" $lazyimg.show();="" if(typeof="" base.options.afterlazyload="==" "function")="" base.options.afterlazyload.apply(this,[base.$elem]);="" },="" autoheight="" function(){="" var="" base="this;" $currentimg="$(base.$owlItems[base.currentItem]).find("img");" if($currentimg.get(0)="" !="=" undefined="" ){="" iterations="0;" checkimage();="" addheight();="" checkimage(){="" +="1;" (="" base.completeimg($currentimg.get(0))="" )="" if(iterations="" <="100){" settimeout(checkimage,100);="" base.wrapperouter.css("height",="" "");="" remove="" height="" attribute="" addheight(){="" $currentitem="$(base.$owlItems[base.currentItem]).height();" base.wrapperouter.css("height",$currentitem+"px");="" if(!base.wrapperouter.hasclass("autoheight")){="" settimeout(function(){="" base.wrapperouter.addclass("autoheight");="" },0);="" completeimg="" function(img)="" (!img.complete)="" return="" false;="" (typeof="" img.naturalwidth="" "undefined"="" &&="" 0)="" true;="" onvisibleitems="" if(base.options.addclassactive="==" true){="" base.$owlitems.removeclass("active");="" base.visibleitems="[];" for(var="" i="base.currentItem;" i<base.currentitem="" base.options.items;="" i++){="" base.visibleitems.push(i);="" $(base.$owlitems[i]).addclass("active");="" base.owl.visibleitems="base.visibleItems;" transitiontypes="" function(classname){="" currently="" available:="" "fade","backslide","godown","fadeup"="" base.outclass="owl-" +classname+"-out";="" base.inclass="owl-" +classname+"-in";="" singleitemtransition="" base.istransition="true;" outclass="base.outClass," inclass="base.inClass," $previtem="base.$owlItems.eq(base.prevItem)," prevpos="Math.abs(base.positionsInArray[base.currentItem])" base.positionsinarray[base.previtem],="" origin="Math.abs(base.positionsInArray[base.currentItem])+base.itemWidth/2;" base.$owlwrapper="" .addclass('owl-origin')="" .css({="" "-webkit-transform-origin"="" origin+"px",="" "-moz-perspective-origin"="" "perspective-origin"="" origin+"px"="" });="" transstyles(prevpos,zindex){="" "position"="" "relative",="" "left"="" prevpos+"px"="" };="" animend="webkitAnimationEnd oAnimationEnd MSAnimationEnd animationend" ;="" .css(transstyles(prevpos,10))="" .addclass(outclass)="" .on(animend,="" function()="" base.endprev="true;" $previtem.off(animend);="" base.cleartransstyle($previtem,outclass);="" .addclass(inclass)="" base.endcurrent="true;" $currentitem.off(animend);="" base.cleartransstyle($currentitem,inclass);="" cleartransstyle="" function(item,classtoremove){="" item.css({="" "",="" ""="" })="" .removeclass(classtoremove);="" if(base.endprev="" base.endcurrent){="" base.$owlwrapper.removeclass('owl-origin');="" owlstatus="" base.owl="{" "useroptions"="" base.useroptions,="" "baseelement"="" base.$elem,="" "useritems"="" base.$useritems,="" "owlitems"="" base.$owlitems,="" "currentitem"="" base.currentitem,="" "previtem"="" base.previtem,="" "visibleitems"="" base.visibleitems,="" "istouch"="" base.browser.istouch,="" "browser"="" base.browser,="" "dragdirection"="" base.dragdirection="" clearevents="" base.$elem.off(".owl="" owl="" mousedown.disabletextselect");="" $(document).off(".owl="" owl");="" $(window).off("resize",="" base.resizer);="" unwrap="" if(base.$elem.children().length="" 0){="" base.$owlwrapper.unwrap();="" base.$useritems.unwrap().unwrap();="" if(base.owlcontrols){="" base.owlcontrols.remove();="" base.clearevents();="" base.$elem="" .attr("style",="" base.$elem.data("owl-originalstyles")="" ||="" "")="" .attr("class",="" base.$elem.data("owl-originalclasses"));="" destroy="" base.stop();="" clearinterval(base.checkvisible);="" base.unwrap();="" base.$elem.removedata();="" reinit="" function(newoptions){="" options="$.extend({}," newoptions);="" base.init(options,base.$elem);="" additem="" function(htmlstring,targetposition){="" position;="" if(!htmlstring){return="" false}="" base.$elem.append(htmlstring);="" base.setvars();="" if(targetposition="==" targetposition="==" -1){="" position="-1;" if(position="">= base.$userItems.length || position === -1){
				base.$userItems.eq(-1).after(htmlString)
			} else {
				base.$userItems.eq(position).before(htmlString)
			}

			base.setVars();
		},

		removeItem : function(targetPosition){
			var base = this,
				position;

			if(base.$elem.children().length === 0){return false}
			
			if(targetPosition === undefined || targetPosition === -1){
				position = -1;
			} else {
				position = targetPosition;
			}

			base.unWrap();
			base.$userItems.eq(position).remove();
			base.setVars();
		}

	};

	$.fn.owlCarousel = function( options ){
		return this.each(function() {
			if($(this).data("owl-init") === true){
				return false;
			}
			$(this).data("owl-init", true);
			var carousel = Object.create( Carousel );
			carousel.init( options, this );
			$.data( this, "owlCarousel", carousel );
		});
	};

	$.fn.owlCarousel.options = {

		items : 1,
		itemsCustom : false,
		itemsDesktop : [1199,1],
		itemsDesktopSmall : [979,1],
		itemsTablet : [768,1],
		itemsTabletSmall : false,
		itemsMobile : [479,1],
		singleItem : false,
		itemsScaleUp : false,

		slideSpeed : 200,
		paginationSpeed : 800,
		rewindSpeed : 1000,

		autoPlay : false,
		stopOnHover : false,

		navigation : false,
		navigationText : ["prev","next"],
		rewindNav : true,
		scrollPerPage : false,

		pagination : true,
		paginationNumbers : false,

		responsive : true,
		responsiveRefreshRate : 200,
		responsiveBaseWidth	: window,
		

		baseClass : "owl-carousel",
		theme : "owl-theme",

		lazyLoad : false,
		lazyFollow : true,
		lazyEffect : "fade",

		autoHeight : false,

		jsonPath : false,
		jsonSuccess : false,

		dragBeforeAnimFinish : true,
		mouseDrag : true,
		touchDrag : true,

		addClassActive : false,
		transitionStyle : false,

		beforeUpdate : false,
		afterUpdate : false,
		beforeInit : false,
		afterInit : false,
		beforeMove : false,
		afterMove : false,
		afterAction : false,
		startDragging : false,
		afterLazyLoad: false
		
	};
})( jQuery, window, document );
</=></base.itemsamount;></0){></=></=></base.itemsamount;></div></div></div></div></base.itemsamount;></=></div></div>