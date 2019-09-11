import React, {Component} from 'react';

export default class VideoEmbed extends Component {
    constructor(props) {
        super(props);
        this.state = {
            thumb: null,
            imageLoaded: true,
            showingVideo: false,
        };

        this.handlePlayVideo = this.handlePlayVideo.bind(this);
    }

    renderIframe() {
        var embedStyle = {
            display: 'block',
            width: '100%',
            height: '100%'
        };
        return (
            <div className='video-embed' style={embedStyle}>
                <iframe frameBorder='0' src={this.getIframeUrl()}></iframe>
            </div>
        );
    }

    handlePlayVideo(ev) {
        ev.preventDefault();
    }

    getIframeUrl() {
        let converted = this.props.video.split("v=")[1].substring(0, 11);
        return `//youtube.com/embed/${converted}?autoplay=0&showinfo=0&iv_load_policy=3&rel=0`
    }

    render() {
        return (
            <div className={this.props.className}>
                {!this.state.imageLoaded && (
                    <div className="loading center">
                        <span className="dots"/>
                        <span className="dots"/>
                        <span className="dots"/>
                    </div>
                )}
                {this.renderIframe()}
            </div>
        );
    }
}