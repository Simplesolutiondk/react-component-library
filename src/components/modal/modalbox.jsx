import React, {Component} from 'react';
import AsyncImage from '../../elements/asyncimage';
import AsyncIframe from '../../elements/asynciframe';

class ModalBox extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activeIndex: 0
        };
        this.navigateToCart = this.navigateToCart.bind(this);
        this.prevImage = this.prevImage.bind(this);
        this.nextImage = this.nextImage.bind(this);
        this.handleMailchimpSubmit = this.handleMailchimpSubmit.bind(this);
        this.handleLogin = this.handleLogin.bind(this);
    }

    navigateToCart() {
        return window.location.href = '/cart';
    }

    navigateToShop(shopUrl) {
        return window.location.href = shopUrl;
    }

    navigateToOverview() {
        return window.location.href = window.location.origin;
    }

    prevImage() {
        if (this.state.activeIndex === 0) {
            this.setState({
                activeIndex: this.state.activeIndex + this.props.data.gallery.length - 1
            });
        } else {
            this.setState({
                activeIndex: this.state.activeIndex - 1
            });
        }
        this.props.data.image = this.props.data.gallery[this.state.activeIndex].popup;
        this.forceUpdate();
    }

    nextImage() {
        if (this.state.activeIndex == this.props.data.gallery.length - 1) {
            this.setState({
                activeIndex: this.state.activeIndex - this.props.data.gallery.length + 1
            });
        } else {
            this.setState({
                activeIndex: this.state.activeIndex + 1
            });
        }
        this.props.data.image = this.props.data.gallery[this.state.activeIndex].popup;
        this.forceUpdate();
    }

    setActiveIndex({target}) {
        if (this.state.activeIndex !== parseInt(target.dataset.index)) {
            this.setState({
                activeIndex: parseInt(target.dataset.index)
            });
        }
    }

    componentWillMount() {
        this.setState({activeIndex: 0});
    }

    componentWillReceiveProps(props) {
        const _this = this;

        this.setState({
            isGallery: (props.data.type == 'gallery')
                ? true
                : false,
            showCloseButton: (props.data.hideCloseButton)
                ? false
                : true,
            activeIndex: (props.data.index)
                ? props.data.index
                : 0,
            mailchimpResponse: {},
            loginResponse: {}
        });
    }

    _onAddExternal(link) {
        const _this = this;
        return fetch(link, {
            method: 'get',
            credentials: "same-origin",
            mode: 'no-cors',
            headers: {
                "Content-type": "text/html"
            }
        }).then(res => res.text()).then(data => _this.setState({externalData: data})).catch(error => {
            console.log(error)
        });
    }

    handleMailchimpSubmit(e) {
        e.preventDefault();
        const formData = {};
    }

    handleLogin(e) {
        e.preventDefault();
        const formData = {};
    }

    serialize(obj) {
        const _this = this;
        const str = [];
        for (const p in obj) {
            if (obj.hasOwnProperty(p)) {
                str.push(`${encodeURIComponent(p)}=${encodeURIComponent(obj[p])}`);
            }
        }
        return str.join("&");
    }

    render() {
        const _this = this;
        if (this.props.isOpen) {

            let renderCloseButton;
            if (this.state.showCloseButton && this.props.data.type != 'login') {
                renderCloseButton = (<div className="close" onClick={this.props.close}>
                    <span className={this.props.data.closeButtonIcon || "ico ico-cross"}></span>
                </div>)
            }

            let renderIcon;
            if (this.props.data.icon) {
                renderIcon = (<div className="icon">
                    <i className={this.props.data.icon}></i>
                </div>)
            }

            let renderTitle;
            renderTitle = (<div className="title">
                <h3>{this.props.data.title}</h3>
            </div>)

            let renderText;
            if (this.props.data.text) {
                renderText = (<div className="text" dangerouslySetInnerHTML={{
                    __html: this.props.data.text
                }}/>)
            }

            let renderImage;
            if (this.props.data.image && !this.state.isGallery) {
                renderImage = (<div className="images">
                    <AsyncImage src={this.props.data.image}/>
                </div>)
            } else if (this.state.isGallery && this.props.data.gallery.length > 1) {

                let renderImageDots;
                if (this.props.data.dots) {
                    let imageDots = this.props.data.gallery.map((image, index) => <li className={(
                        this.state.activeIndex == index)
                        ? "active"
                        : ""} key={index} onClick={this.setActiveIndex.bind(this)} data-index={index}>{index}</li>)
                        renderImageDots = (<ul className="dots">
                        {imageDots}
                    </ul>)
                }

                let renderImageDesc;
                if (this.props.data.gallery[this.state.activeIndex].desc.title_text) {
                    renderImageDesc = (<div className="desc">
                        {this.props.data.gallery[this.state.activeIndex].desc.title_text}
                    </div>)
                }

                renderImage = (<div className="images">
                    <AsyncImage src={this.props.data.gallery[this.state.activeIndex].popup}
                                alt={this.props.data.gallery[this.state.activeIndex].desc.alt_text}/> {renderImageDesc}
                    <div className="actions">
                        <button className="prev" onClick={this.prevImage}>
                            <span className={this.props.data.arrowLeft || "ico ico-arrow-left"}></span>
                        </button>
                        <button className="next" onClick={this.nextImage}>
                            <span className={this.props.data.arrowRight || "ico ico-arrow-right"}></span>
                        </button>
                        {renderImageDots}
                    </div>
                </div>)
            }

            let renderButtons;
            if (!this.state.isGallery) {
                if (this.props.data.type == 'cart') {
                    renderButtons = (<div className="buttons">
                        <div className="grid-row">
                            <div className="xs-6-cl flex-end">
                                <button className={this.props.data.buttonCloseClass || "btn btn--primary-outline"}
                                        onClick={this.props.close}>{this.props.data.buttonCloseText || reactLocale.string("modal_shopmore")}</button>
                            </div>
                            <div className="xs-6-cl flex-start">
                                <button className={this.props.data.buttonCartClass || "btn btn--primary"}
                                        onClick={this.navigateToCart}>{this.props.data.buttonCartText || reactLocale.string("modal_tocart")}</button>
                            </div>
                        </div>
                    </div>)
                } else if (this.props.data.type == 'quote') {
                    renderButtons = false
                } else {
                    renderButtons = (<div className="buttons">
                        <button className={this.props.data.buttonCloseClass || "btn btn--primary"}
                                onClick={this.props.close}>{this.props.data.buttonCloseText || reactLocale.string("modal_close")}</button>
                    </div>)
                }
            }

            let renderShippingStatus;
            if (this.props.data.type == 'cart') {
                renderShippingStatus = (<div className="shipping">{this.props.data.freeshipping}</div>)
            }

            if (this.props.data.type == 'gallery' || this.props.data.type == 'image') {
                if (this.props.data.layout == 'large') {
                    return (<div className="box">
                        {renderCloseButton}
                        <div className={this.props.data.modalClassName || "layout-large"}>
                            <div className="row no-gutters">
                                <div className="col-sm-6 order-2 order-sm-1">
                                    <div className="gallery">
                                        {renderImage}
                                    </div>
                                </div>
                                <div className="col-sm-6 order-1 order-sm-2">
                                    <div className="information">
                                        {renderTitle}
                                        {renderText}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>)
                } else {
                    return (<div className="box">
                        {renderCloseButton}
                        <div className={this.props.data.modalClassName || "gallery"}>
                            {renderImage}
                        </div>
                    </div>)
                }
            } else if (this.props.data.type == 'external') {
                if (this.props.data.link) {
                    this._onAddExternal(this.props.data.link);
                    return (<div className="box">
                        {renderCloseButton}
                        <div className={_this.props.data.modalClassName || "external"} dangerouslySetInnerHTML={{
                            __html: this.state.externalData
                        }}/>
                    </div>)
                }
            } else if (this.props.data.type == 'youtube') {
                if (this.props.data.code) {

                    return (<div className="box">
                        {renderCloseButton}
                        <div className="embed-responsive embed-responsive-16by9">
                            <AsyncIframe className="embed-responsive-item"
                                         src={`https://www.youtube.com/embed/${this.props.data.code}${this.props.data.options
                                             ? `?${this.serialize(this.props.data.options)}`
                                             : ''}`} allowFullScreen="allowfullscreen"/>
                        </div>
                    </div>);
                }
            } else if (this.props.data.type == 'quote') {
                return (<div className="box">
                    {renderCloseButton}
                    <div className={this.props.data.modalClassName} dangerouslySetInnerHTML={{__html: this.props.data.text}}>
                    </div>
                </div>)
            } else if (this.props.data.type == 'mailchimp') {
                return (<div className="box">
                    {renderCloseButton}
                    <div className={this.props.data.modalClassName || "mailchimp p-4"}>
                        {renderTitle}
                        {renderText}
                        <form onSubmit={this.handleMailchimpSubmit} className="mt-3">
                            <div className="form-group">
                                <input ref="name" className="form-control name" type='text' name="name"
                                       placeholder={this.props.data.inputNameText || "Name"}/>
                            </div>
                            <div className="form-group">
                                <input ref="email" className="form-control email" type='email' name="email"
                                       placeholder={this.props.data.inputEmailText || "Email"}/>
                            </div>
                            <div className="form-group">
                                <button type="submit"
                                        className="btn btn-primary">{this.props.data.submitText || "Submit"}</button>
                            </div>
                            {
                                this.state.mailchimpResponse && <div className="response">
                                    {
                                        this.state.mailchimpResponse.error && <div className="error">
                                            {this.props.data.failed}
                                        </div>
                                    }
                                    {
                                        this.state.mailchimpResponse.status && <div className="success">
                                            {this.props.data.success}
                                        </div>
                                    }
                                </div>
                            }
                        </form>
                    </div>
                </div>)
            } else if (this.props.data.type == 'login') {
                return (<div className="box">
                    {renderCloseButton}
                    <div className={this.props.data.modalClassName || "login"}>
                        {renderTitle}
                        {renderText}
                        <form className="login__form">
                            <div className="form-group">
                                <input ref="username" className="form-control name" type="text" name="username"
                                       placeholder={this.props.data.userText || "Indtast Username"}/>
                            </div>
                            <div className="form-group">
                                <input ref="code" className="form-control name" type='password' name="code"
                                       placeholder={this.props.data.userPass || "Indtast Kode"}/>
                            </div>
                            <div className="form-group">
                                <button type="button" className="btn btn--primary"
                                        onClick={this.handleLogin}>{this.props.data.submitText || "Submit"}</button>
                            </div>
                            {
                                this.state.loginResponse && <div className="response">
                                    {
                                        this.state.loginResponse.error && <div className="error">
                                            {this.state.loginResponse.message}
                                        </div>
                                    }
                                    {
                                        this.state.loginResponse.success && <div className="success">
                                            {this.state.loginResponse.message}
                                        </div>
                                    }
                                </div>
                            }
                        </form>
                        <div className="login__description copy">
                            <p>{login}</p>
                        </div>
                        <div className="login__cta_text copy">
                            <p className="text" dangerouslySetInnerHTML={{
                                __html: reactLocale.string("modal_login_footer_text")
                            }}/>
                        </div>
                    </div>
                </div>)
            } else {
                return (<div className="box">
                    {renderCloseButton}
                    <div className={this.props.data.modalClassName || "simple"}>
                        {renderIcon}
                        {renderTitle}
                        {renderText}
                        {renderImage}
                        {renderShippingStatus}
                        {renderButtons}
                    </div>
                </div>)
            }
        } else {
            return null;
        }
    }
}

export default ModalBox;
