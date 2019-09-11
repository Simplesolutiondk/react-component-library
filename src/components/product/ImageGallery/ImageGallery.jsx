import React, { Component } from 'react';
import { wcApi } from '../../../utils';
import React360 from './React360/React360';
// import ReactImageMagnify from 'react-image-magnify';
import Magnifier from 'react-magnifier';
import Turn from './turn.js';
import Arrow from './arrow.js';
/**
 * Magnifier settings:
 * https://github.com/samuelmeuli/react-magnifier#configuration
 */
export default class ImageGallery extends Component {
	constructor(props) {
		super(props);
		this.state = {
			productID: postid,
			productName: null,
			imageArray360: null,
			thumbnailImageArray: null,
			lowResImageArray: null,
			highResImageArray: null,
			activeSlide: '',
			firstZoomSlide: false,
			activeSlideIndex: 0,
		};
	}

	componentWillMount() {
		wcApi.get(
			`products/${this.state.productID}`,
			(error, data, response) => {
				const product = JSON.parse(response);
				let tempHRImageArray = [];
				let tempLRImageArray = [];
				let tempThumbImageArray = [];
				let images_custom = product.product_images_custom;
				let activeSlide = '';
				if (product['360_images'].length > 0) {
					tempThumbImageArray.push(product['360_images'][0].src);
					activeSlide = '360';
				} else {
					activeSlide = 'zoom';
				}

				for (let i = 0; i < images_custom.length; i++) {
					tempHRImageArray.push(images_custom[i].full);
					tempLRImageArray.push(images_custom[i].medium);
					tempThumbImageArray.push(images_custom[i].thumbnail);
				}

				this.setState({
					productName: product.name,
					imageArray360: product['360_images'],
					thumbnailImageArray: tempThumbImageArray,
					lowResImageArray: tempLRImageArray,
					highResImageArray: tempHRImageArray,
					activeSlide: activeSlide,
				});
			},
		);
	}

	render360image() {
		const { imageArray360 } = this.state;

		return <React360 images={imageArray360} />;
	}

	renderZoomImages() {
		const {
			lowResImageArray,
			highResImageArray,
			activeSlideIndex,
			productName,
		} = this.state;

		return (
			<React.Fragment>
				{/* <ReactImageMagnify
					{...{
						smallImage: {
							alt: productName,
							isFluidWidth: true,
							height: 800,
							width: 786,
							src: lowResImageArray[activeSlideIndex],
						},
						// largeImage is the second window / The zoomed window
						largeImage: {
							src: highResImageArray[activeSlideIndex],
							height: 2500,
							width: 2000,
							alt: productName,
						},
						enlargedImagePosition: 'over',
						enlargedImageContainerDimensions: {width: '100%', height: '100%'},
						isHintEnabled: true,
						shouldHideHintAfterFirstActivation: false,
						hintTextMouse: 'Hover for Zoom',
						isActivatedOnTouch: true,
						isEnlargedImagePortalEnabledForTouch: true,
						hintTextTouch: 'Touch and hold for Zoom',
					}}
				/> */}
				<Magnifier
					src={highResImageArray[activeSlideIndex]}
					// Image settings:
					// height={'800px'}
					width={'100%'}
					// Magnifier settings:
					mgShape={'square'}
					mgWidth={300}
					mgHeight={300}
					// Zoom effect settings:
					zoomFactor={0.5}
				/>
			</React.Fragment>
		);
	}

	renderListItems() {
		const { activeSlide } = this.state;

		if (activeSlide === '360') {
			return this.render360image();
		} else if (activeSlide === 'zoom') {
			return this.renderZoomImages();
		}
	}

	renderThumbnails() {
		const { thumbnailImageArray, productName, imageArray360 } = this.state;

		return thumbnailImageArray.map((thumb, index) => {
			return (
				<div key={index} className={'xs-12-cl sm-6-cl'}>
					<img
						src={thumb}
						alt={productName}
						className={'thumbnail-image'}
						onClick={() => this.updateFromThumbnail(index)}
					/>
				</div>
			);
		});
	}

	updateFromThumbnail(index) {
		const { activeSlideIndex, imageArray360 } = this.state;

		let newIndex = activeSlideIndex;
		let activeSlide = '';

		if (index === 0) {
			if (imageArray360.length <= 0) {
				newIndex = 0;
				activeSlide = 'zoom';
			} else {
				newIndex = 0;
				activeSlide = '360';
			}
		} else {
			if (imageArray360.length > 0) {
				newIndex = index - 1;
				activeSlide = 'zoom';
			} else {
				newIndex = index;
				activeSlide = 'zoom';
			}
		}
		this.setState({
			activeSlideIndex: newIndex,
			activeSlide: activeSlide,
		});
	}

	updateSlideImage(rotation) {
		const {
			activeSlideIndex,
			highResImageArray,
			firstZoomSlide,
			imageArray360,
		} = this.state;
		let newIndex = activeSlideIndex;
		let activeSlide = '';
		let ZoomSlide = firstZoomSlide;

		// Checks rotation
		if (rotation === 'left') {
			newIndex = activeSlideIndex - 1;
		} else {
			newIndex = activeSlideIndex + 1;
		}

		if (newIndex < 0) {
			newIndex = highResImageArray.length - 1;
		}

		if (newIndex > highResImageArray.length - 1) {
			newIndex = 0;
		}

		if (newIndex === 0 && imageArray360.length > 0) {
			activeSlide = '360';
		} else {
			activeSlide = 'zoom';
		}

		this.setState({
			activeSlide: activeSlide,
			activeSlideIndex: newIndex,
			firstZoomSlide: ZoomSlide,
		});
	}

	render() {
		const {
			thumbnailImageArray,
			lowResImageArray,
			activeSlide,
			imageArray360,
		} = this.state;

		if (imageArray360 !== null && imageArray360.length <= 0) {
			return (
				<React.Fragment>
					<div className="product-image">
						{this.renderListItems()}
						<div className="slider-buttons">
							<a
								className="slider-button slide-left"
								onClick={() => this.updateSlideImage('left')}>
								<Arrow />
							</a>
							<a
								className="slider-button slide-right"
								onClick={() => this.updateSlideImage('right')}>
								<Arrow />
							</a>
						</div>
					</div>
					{thumbnailImageArray !== null && (
						<div className="product-thumbnails grid-row">
							{this.renderThumbnails()}
						</div>
					)}
				</React.Fragment>
			);
		}

		if (lowResImageArray !== null && lowResImageArray.length > 0) {
			return (
				<React.Fragment>
					<div className="product-image">
						{this.renderListItems()}
						{activeSlide === '360' && (
							<div className="turn-360">
								<Turn />
							</div>
						)}
						<div className="slider-buttons">
							<a
								className="slider-button slide-left"
								onClick={() => this.updateSlideImage('left')}>
								<Arrow />
							</a>
							<a
								className="slider-button slide-right"
								onClick={() => this.updateSlideImage('right')}>
								<Arrow />
							</a>
						</div>
					</div>
					{thumbnailImageArray !== null && (
						<div className="product-thumbnails grid-row">
							{this.renderThumbnails()}
						</div>
					)}
				</React.Fragment>
			);
		}

		if (imageArray360 !== null && imageArray360.length > 0) {
			return (
				<React.Fragment>
					<div className="product-image">
						{this.render360image()}
						<div className="turn-360">
							<Turn />
						</div>
					</div>
				</React.Fragment>
			);
		}

		return (
			<div className="product-image">
				<img
					src="https://via.placeholder.com/350x350.png?text=Product+image+coming+soon!"
					alt="Change product image in the admin panel."
				/>
			</div>
		);
	}
}
