import React, { Component } from "react";
import { wcApi } from '../../../../utils';

export default class React360 extends Component {
    constructor( props ) {
        super( props );
        this.state = {
            dragging: false,
            imageIndex: 0,
            dragStartIndex: 0,
            imageArray: null,
        };
        // debugger;

        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);

    };

    componentDidMount() {
        let tempArray = [];

        for (let i = 0; i < this.props.images.length; i++) {
            tempArray.push(this.props.images[i].src);
        }

        this.setState({
            imageArray: tempArray,
        });

        document.addEventListener("mousemove", this.handleMouseMove, false);

        document.addEventListener("mouseup", this.handleMouseUp, false);
    };

    componentWillUnmount() {
        document.removeEventListener("mousemove", this.handleMouseMove, false);
        document.removeEventListener("mouseup", this.handleMouseUp, false);
    };

    handleMouseDown(e) {
        e.persist();
        this.setState(state => ({
            dragging: true,
            dragStart: e.screenX,
            dragStartIndex: state.imageIndex
        }));
    };

    handleMouseUp() {
        this.setState({ dragging: false });
    };

    updateImageIndex(currentPosition) {
        // You can play with this to adjust the sensitivity
        // higher values make mouse less sensitive
        const pixelsPerDegree = 4;

        const { dragStart, imageIndex, dragStartIndex } = this.state;

        let numImages = this.props.images.length;

        const pixelsPerImage = pixelsPerDegree * (360 / numImages);

        // pixels moved
        let dx = (currentPosition - dragStart) / pixelsPerImage;

        let index = Math.floor(dx) % numImages;

        if (index < 0) {
            index = numImages + index - 1;
        }

        index = (index + dragStartIndex) % numImages;

        if (index !== imageIndex) {
            this.setState({ imageIndex: index });
        }
    };

    handleMouseMove(e) {
        if ( this.state.dragging ) {
            this.updateImageIndex(e.screenX);
        }
    };

    preventDragHandler(e) {
        e.preventDefault();
    };

    renderImage() {
        const { imageIndex, imageArray } = this.state;

        if (this.state.imageArray !== null && typeof this.state.imageArray !== "undefined") {
            return (
                <img
                    onMouseDown={this.handleMouseDown}
                    onDragStart={this.preventDragHandler}
                    className="react-360-img"
                    alt=""
                    src={imageArray[imageIndex]}
                />
            );
        }
        return null;
    };

    render() {

        return (
            <React.Fragment>
                { this.renderImage() }
            </React.Fragment>
        );
    };
}
