import React, {Component} from 'react';
import ValidateError from './error/validate';

export default class OptForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            coupon: '',
            note: '',
            terms: (!!this.props.terms) || false,
            newsletter: (!!this.props.newsletter) || false
        }

        // Bindings
        this.handleCoupon = this.handleCoupon.bind(this);
        this.handleCouponDelete = this.handleCouponDelete.bind(this);
        this.handleCouponValue = this.handleCouponValue.bind(this);
        this.handleModal = this.handleModal.bind(this);
        this.handleNewsletterChange = this.handleNewsletterChange.bind(this);
        this.handleNoteValue = this.handleNoteValue.bind(this);
        this.handleTermsChange = this.handleTermsChange.bind(this);
    }

    componentDidMount() {
        const _this = this;
        // onInitProductForm
        Emitter.listen('onInitProductForm', props => _this.setState({
            mounted: true,
            coupon: props.coupon || "",
            note: props.note || "",
            terms: props.terms || false,
            newsletter: props.newsletter || false,
            validateCouponVisible: false,
            validateCouponMessage: ""
        }));
        // onValidateInputs
        Emitter.listen('onValidateTerm', fields => {
            if (!_this.state.terms) {
                return _this.setState({
                    validateVisible: (!_this.state.terms),
                    validateMessage: (!_this.state.terms) ? reactLocale.string("cart_terms_invalid") : ""
                })
            }
        });
        // onValidateCoupon
        Emitter.listen('onValidateCoupon', message => {
            _this.setState({
                validateCouponVisible: true,
                validateCouponMessage: message.error
            });
        });
    }

    handleCoupon(changeEvent) {
        // Emit change to mainframe
        Emitter.broadcast('onBeforeAddCouponCode', this.state.coupon);
    }

    handleCouponDelete(changeEvent) {
        this.setState({
            coupon: ""
        }, () => {
            // Emit change to mainframe
            Emitter.broadcast('onBeforeRemoveCouponCode', this.state.coupon);
        });
    }

    handleCouponValue(changeEvent) {
        this.setState({coupon: changeEvent.target.value});
    }

    handleModal(changeEvent) {
        // Prevent default
        changeEvent.preventDefault();
        changeEvent.stopPropagation();
        // Emit (modal, text mode)
        /*
        Emitter.broadcast('onModal', {
            type: 'external',
            link: changeEvent.target.href
        });
        */

        window.open(reactLocale.string("cart_terms_link"));
    }

    handleNewsletterChange(changeEvent) {
        // Prevent default
        changeEvent.preventDefault();
        this.setState({
            newsletter: !this.refs.newsletter.checked
        })
        // Handle add
        Emitter.broadcast('onHandleNewsletter', !this.refs.newsletter.checked);
    }

    handleNoteValue(changeEvent) {
        this.setState({note: changeEvent.target.value});
        // Handle add
        Emitter.broadcast('onHandleNoteAdd', changeEvent.target.value);
    }

    handleTermsChange(changeEvent) {
        // Prevent default
        changeEvent.preventDefault();

        this.setState({
            terms: !this.refs.terms.checked,
            validateVisible: this.refs.terms.checked,
            validateMessage: this.refs.terms.checked ? reactLocale.string("cart_terms_invalid") : ""
        })
        // Handle add
        Emitter.broadcast('onHandleTerms', !this.refs.terms.checked);
    }

    render() {
        return (
            <div className="OptForm">
                <div id="coupon">
                    <div data-toggle="collapse" data-target="#coupon-input" className="expandingdivs collapsed"
                         aria-expanded="false">{reactLocale.string("cart_feature_coupon_giftcard")}</div>
                    <div id="coupon-input" className="form-group collapse">
                        <div className="grid-row">
                            <div className="xs-8-cl sm-9-cl">
                                <div className="input-group add-on">
                                    <input id="field-coupon" type="text"
                                           placeholder={reactLocale.string("cart_feature_coupon_giftcard_placeholder")}
                                           className="form-control" onChange={this.handleCouponValue}
                                           value={this.state.coupon || ""}/>
                                    {this.state.coupon &&
                                    <div className="remove">
                                        <span className="ico ico-cross" onClick={this.handleCouponDelete}/>
                                    </div>
                                    }
                                </div>
                            </div>
                            <div className="xs-4-cl sm-3-cl">
                                <a className="btn btn--primary"
                                   onClick={this.handleCoupon}>{reactLocale.string("cart_feature_add")}</a>
                            </div>
                            <div className="col">
                                <ValidateError visible={this.state.validateCouponVisible}
                                               validateMessage={this.state.validateCouponMessage}/>
                            </div>
                        </div>
                    </div>
                </div>
                <div id="note">
                    <div data-toggle="collapse" data-target="#note-input" className="expandingdivs collapsed"
                         aria-expanded="false">{reactLocale.string("cart_feature_comment")}</div>
                    <div id="note-input" className="form-group collapse">
                        <textarea id="order-note" className="form-control" rows="3"
                                  placeholder={reactLocale.string("cart_feature_comment_placeholder")}
                                  value={this.state.note || ""} onChange={this.handleNoteValue}/>
                    </div>
                </div>
                <div id="options">
                    {/*
                    <div className="option">
                        <input name="newsletter" id="option-newsletter" ref="newsletter" type="checkbox" checked={this.state.newsletter}/>
                        <label htmlFor="option-newsletter" onClick={this.handleNewsletterChange}>{reactLocale.string("cart_feature_newsletter")}</label>
                    </div>
                    */}
                    <div className="option">
                        <input name="terms" id="option-terms" ref="terms" type="checkbox" checked={this.state.terms}/>
                        <label htmlFor="terms" onClick={this.handleTermsChange}>{reactLocale.string("cart_terms")} <a
                            href="index.php?option=com_mijoshop&view=information&information_id=5&tmpl=component"
                            onClick={this.handleModal}>{reactLocale.string("cart_terms_button")}</a></label>
                        <ValidateError visible={this.state.validateVisible}
                                       validateMessage={this.state.validateMessage}/>
                    </div>
                </div>
            </div>
        );
    }
}