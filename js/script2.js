{
	const body = document.body;

	// helper functions
	const MathUtils = {
		lerp: (a, b, n) => (1 - n) * a + n * b,
		distance: (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1),
	};

	// get the mouse position
	const getMousePos = (ev) => {
		let posx = 0;
		let posy = 0;
		if (!ev) ev = window.event;
		if (ev.pageX || ev.pageY) {
			posx = ev.pageX;
			posy = ev.pageY;
		} else if (ev.clientX || ev.clientY) {
			posx = ev.clientX + body.scrollLeft + docEl.scrollLeft;
			posy = ev.clientY + body.scrollTop + docEl.scrollTop;
		}
		return { x: posx, y: posy };
	};

	let mousePos = (lastMousePos = cacheMousePos = { x: 0, y: 0 });

	// update the mouse position
	window.addEventListener("mousemove", (ev) => (mousePos = getMousePos(ev)));
	window.addEventListener("touchmove", (ev) => {	mousePos = getMousePos(ev); });

	imgObj = null

	window.addEventListener("keydown", (ev) => {

				   if (ev.keyCode == 37)  { // LEFT KEY

								 oldPos = imgObj.imgPosition - 1;

								 oldPos = oldPos >= 0 ? oldPos : imgObj.imagesTotal - 1;

								 imgObj.images[oldPos].DOM.el.style.opacity = 0;

								 imgObj.imgPosition--;

								 imgObj.imgPosition = imgObj.imgPosition >= 0 ? imgObj.imgPosition : imgObj.imagesTotal - 1;

				   }

	})

	const getMouseDistance = () =>
		MathUtils.distance(mousePos.x, mousePos.y, lastMousePos.x, lastMousePos.y);

	class Image {
		constructor(el) {
			this.DOM = { el: el };
			this.defaultStyle = {
				scale: 1,
				x: 0,
				y: 0,
				opacity: 0,
			};
			this.getRect();
		}

		getRect() {
			this.rect = this.DOM.el.getBoundingClientRect();
		}
		isActive() {
			return TweenMax.isTweening(this.DOM.el) || this.DOM.el.style.opacity != 0;
		}
	}

	class ImageTrail {
		constructor() {
			this.DOM = { content: document.querySelector(".content") };
			this.images = [];
			[...this.DOM.content.querySelectorAll("img")].forEach((img) =>
				this.images.push(new Image(img))
			);
			this.imagesTotal = this.images.length;
			this.imgPosition = 0;
			this.zIndexVal = 1;
			this.threshold = 1;
			requestAnimationFrame(() => this.render());
		}
		render() {
			let distance = getMouseDistance();
			cacheMousePos.x = MathUtils.lerp(
				cacheMousePos.x || mousePos.x,
				mousePos.x,
				0.1 //die Bilder kommen zufällig, bei hohen Werten
			);
			cacheMousePos.y = MathUtils.lerp(
				cacheMousePos.y || mousePos.y,
				mousePos.y,
				0.1  //die Bilder kommen von oben...
			);

			if (distance > this.threshold) {
				this.showNextImage();

				++this.zIndexVal;
				this.imgPosition =
					this.imgPosition < this.imagesTotal - 1 ? this.imgPosition + 1 : 0; //hier passiert nichts

				lastMousePos = mousePos;
			}

			let isIdle = true;
			for (let img of this.images) {
				if (img.isActive()) {
					isIdle = false;
					break;
				}
			}
			if (isIdle && this.zIndexVal !== 1) { //nichts
				this.zIndexVal = 1;//nichts
			}

			requestAnimationFrame(() => this.render());
		}
		showNextImage() {
			const img = this.images[this.imgPosition];
			TweenMax.killTweensOf(img.DOM.el);

			new TimelineMax()
				.set(
					img.DOM.el,
					{
						startAt: { opacity: 0, scale: 1 },//nichts
						opacity: 1, //transparent
						scale: 2, //scale der Bilder (1)
						zIndex: this.zIndexVal,
						x: cacheMousePos.x - img.rect.width / 2, //nichts
						y: cacheMousePos.y - img.rect.height / 2, //nichts
					},
					0 //macht die Bilder zufällig UND BLEIBEND (0) 1 interessant
				)
				.to(
					img.DOM.el,
					0.9, // macht es smoother
					{
						ease: Expo.easeOut,
						x: mousePos.x - img.rect.width / 2, //verzieht dei Bilder merkwürdig
						y: mousePos.y - img.rect.height / 2, //verzieht dei Bilder merkwürdig
					},
					0  //rausbeweg
				)
				// .to(
				// 	img.DOM.el,
				// 	0, //!!!!!!! Zeit bis die Hintenbilder weg sind (1)
				// 	{
				// 		ease: Power1.easeOut,
				// 		opacity: 0,
				// 	},
				// 	0.4
				// )
				.to(
					img.DOM.el,
					1, //geschwindikeit der nach hintenbewegung
					{
						ease: Quint.easeOut,
						scale: 2, //!!!Skalierung der Hintenbilder (0.2)
					},
					0.4 //ob die Bilder nach hinten gehen
				);
		}
	}

	// preload images
	const preloadImages = () => {
		return new Promise((resolve, reject) => {
			imagesLoaded(document.querySelectorAll(".content__img"), resolve);
		});
	};

	
preloadImages().then(() => {

	imgObj = new ImageTrail();

});
}




