class TheFinalGallery {
	constructor({destination, slides, infinite = true, adaptive, contriols}) {
		this.destination = destination
		this.slides = slides
		this.infinite = infinite
		this.adaptive = adaptive
		this.controls = controls

		this.init()
	}

	debounce(func, timeout) {
		let timer
		return () => {
			clearTimeout(timer)
			timer = setTimeout(func, timeout)
		}
	}

	init() {
		const slides = this.slides.map(item => {
			const root = document.querySelector(item.root)
			const transforming = root.querySelector("div > div")
			const slide = root.querySelector(item.slide)

			Array.from(root.querySelectorAll("div[data-original]")).map(div => {
				div.style.backgroundImage = `url('${div.getAttribute("data-original")}')`
			})

			transforming.querySelector("div").style.backgroundColor = "transparent"

			const pureId = item.root.replace("#", "")
			root.classList.add(pureId)
			const style = root.querySelector("style")
			style.innerHTML = style.innerHTML
				.replace(new RegExp(item.root, "g"), `.${pureId}`)
				.replace(/;/g, "!important;")

			const wrapper = document.createElement("div")
			Object.assign(wrapper.style, {
				position: "relative",
				display: "flex",
				justifyContent: "center",
			})

			const cropper = document.createElement("div")
			const setSize = overflow => {
				const slideRect = slide.getBoundingClientRect()
				Object.assign(cropper.style, {
					position: "relative",
					overflow: overflow || "hidden",
					width: px(slideRect.width),
					height: px(slideRect.height),
				})
				Object.assign(transforming.style, {
					transform: `translateX(calc(-50% + ${px(slideRect.width / 2)}))`,
					width: px(document.body.clientWidth),
				})
			}
			setSize()

			const onResizeEnd = () => {
				requestAnimationFrame(() => setSize("hidden"))
			}
			const onResizeEndDebounce = debounce(onResizeEnd, 1500)
			window.addEventListener("resize", () => {
				requestAnimationFrame(() => setSize("unset"))
				onResizeEndDebounce()
			})

			root.after(wrapper)
			wrapper.appendChild(cropper)
			cropper.appendChild(root)

			return {
				wrapper,
				root,
				slide,
				transforming,
			}
		})

		const carousel = document.querySelector(this.destination)
		carousel.style.backgroundColor = "unset"
		carousel.innerHTML = ""
		Object.assign(carousel.style, {
			position: "relative",
			display: "block",
			boxSizing: "border-box",
			//width: "100%",
			//height: px(_zeroBlocks),
		})
		//slides[0].wrapper.before(carousel)
		slides.forEach(item => carousel.appendChild(item.wrapper))
		const carouselZeroBlock = $(carousel).parents("[id^='rec']")
		const options = {
			infinite: this.infinite,
			slidesToShow: 1,
			//centerMode: true,
			adaptiveHeight: true,
			nextArrow: carouselZeroBlock.find(this.controls.next),
			prevArrow: carouselZeroBlock.find(this.controls.prev),
			//lazyLoad: "progressive",
			responsive: this.adaptive.map(item => ({
				breakpoint: item.breakpoint,
				settings: {
					slidesToShow: item.slides,
				},
			})),
		}
		let currentSlide = 0
		$(carousel).slick(options)
		$(carousel).on("afterChange", function (e, slick, _currentSlide) {
			currentSlide = _currentSlide
		})
		const onResize = () => {
			requestAnimationFrame(() => $(carousel).slick("unslick"))
			options.initialSlide = currentSlide
			requestAnimationFrame(() => $(carousel).slick(options))
		}
		const onResizeDebounce = this.debounce(onResize, 2000)
		window.addEventListener("resize", onResizeDebounce)
	}
}
