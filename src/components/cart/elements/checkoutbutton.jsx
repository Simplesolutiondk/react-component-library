import React, {Component} from 'react';

export default class CheckoutButton extends Component {
    constructor(props) {
        super(props);
        this.state = {
        }

        // Bindings
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidMount() {
        var _this = this;
        Emitter.listen('onResetSubmitButton', function() {
            _this.refs.submit_button.disabled = false;
            _this.refs.submit_button.innerHTML = reactLocale.string("cart_button_gotopayment");
        });

        Emitter.listen('onClickSubmitButton', function() {
            _this.refs.submit_button.disabled = false;
            _this.refs.submit_button.innerHTML = reactLocale.string("cart_button_gotopayment");
            _this.refs.submit_button.click();
        });
    }

    handleSubmit(evt) {
        var target = evt.target || evt.srcElement;
        target.disabled = true;
        target.innerHTML = reactLocale.string("cart_button_loading");
        // Send event to mainframe
        return Emitter.broadcast('onBeforeSubmitForm', {
            // void
        });
    }

    render() {
        return (
            <div className="CheckoutButton">
                <button ref="submit_button" id="confirm" className="btn btn--primary" onClick={this.handleSubmit} onTouchEnd={this.handleSubmit}>{reactLocale.string("cart_button_gotopayment")}</button>
                {!this.props.read_only && <div className="security-text">{reactLocale.string("cart_secure_text")}</div>}
            </div>
        );
    }
}
