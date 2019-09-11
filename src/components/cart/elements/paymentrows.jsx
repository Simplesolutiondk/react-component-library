import React, {Component} from 'react';

export default class PaymentRows extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedOption: null,
            payment_methods: [],
        }

        // Bindings
        this.handleOptionChange = this.handleOptionChange.bind(this);
    }

    componentDidMount() {
        const _this = this;
        // onInitPaymentMethods
        Emitter.listen('onInitPaymentMethods', payload => _this.setState({
            mounted: true,
            payment_methods: payload.payment_methods,
            total: payload.total_price,
            discount: payload.discount,
            inputs: payload.inputs,
            read_only: payload.locked
        }));
    }

    handleOptionChange(changeEvent) {
        const _this = this;

        this.setState({
            index: changeEvent.target.dataset['index'],
            option: changeEvent.target.value
        }, () => {
            // Emit change to mainframe
            Emitter.broadcast('onBeforePaymentChange', _this.state);
        });
    }

    render() {
        const _this = this;
        if (!this.state.mounted || this.state.payment_methods.length == 0) return null;
        let payment_methods = this.state.payment_methods;
        const total_price = parseInt(this.state.total) - parseInt(this.state.discount);
        // Create a pseudo shipping object
        if (total_price <= 0) {
            // Reset
            payment_methods = [];
            const new_payment_method = {
                code: "simplepayment.method_0",
                logo: "",
                name: reactLocale.string("cart_payment_giftcard"),
                selected: 1,
                text: ""
            };
            payment_methods.push(new_payment_method);
        } else {
            payment_methods.forEach((object, index) => {
                if (object !== null) {
                    if (object.code == "simplepayment.method_0") {
                        delete payment_methods[index];
                    }
                }
            });
        }

        const list = payment_methods.map((method, index) => {
            // Skip
            if ((_this.state.inputs.customer_group == undefined || _this.state.inputs.customer_group.value == 1) && method.name.indexOf('tura') > 0) return null;

            const className = classNames(_this.props.className, {
                'payment-item active': method.selected,
                'payment-item': !method.selected
            });

            const checked = _this.state.option === method.code;

            return (
                <div key={index} className={className}>
                    <label>
                        <input type="radio" name="paymentOptions" id="payment-method" value={method.code}
                               checked={checked} onChange={_this.handleOptionChange} data-index={index}
                               data-name={name}/>
                        <div className="logo">
                            {method.logo != "" && <img className="payment-logo" src={method.logo}/>}
                        </div>
                        <div className="details">
                            <span className="name">{method.name}</span>
                        </div>
                    </label>
                </div>
            );
        });
        return (
            <div className="Payment">
                <h5 className="visible-first">
                    <strong>{reactLocale.string("cart_step_3")}</strong>{reactLocale.string("cart_payment")}</h5>
                {list}
            </div>
        );
    }
}