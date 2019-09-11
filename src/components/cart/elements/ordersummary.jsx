import React, {Component} from 'react';
import NumFormat from '../../../elements/utils/numformat';

export default class OrderSummary extends Component {
    constructor(props) {
        super(props);
        this.state = {
            mounted: true,
            total: 0,
            discount: 0,
            discount_type: "",
            shipping_price: 0,
            tax_rate: 0,
            shipping_name: "",
            droppoint: "",
            shipping_droppoint: 0,
            shipping_duty: 0
        }
    }

    componentDidMount() {
        const _this = this;
        Emitter.listen('onInitSummaryForm', payload => {
            let price = 0;
            let tax_skip = 0;
            const discount_skip = 0;
            _this.props.products.map((product, n) => {
                if (product.type === "product") {
                    price += (parseFloat(product.special) < parseFloat(product.price) ? parseFloat(product.special) * product.quantity : parseFloat(product.price) * product.quantity)

                } else {
                    price += parseFloat(product.price);
                    tax_skip += parseFloat(product.price) * payload.tax_rate;
                }
            });

            // Initial total Calculation
            const initialTotal = parseFloat(price).toFixed(2);
            let discount = 0;

            // Discount check
            if (payload.discount != undefined) {
                // Discount Calculation
                discount = ((parseFloat(price) * parseFloat(payload.discount)) / 100).toFixed(2);
            }

            // Shipping
            const shipping = parseFloat(payload.shipping_price).toFixed(2).replace(',', '.');
            const shipping_ex_tax = parseFloat(payload.shipping_price * 0.8).toFixed(2).replace(',', '.');

            // Subtotal
            const subTotal = ((parseFloat(initialTotal) * 0.8).toFixed(2));
            const subtotal_formatted = subTotal.replace('.', ',');

            // Pre calc
            const total_calc = (parseFloat(initialTotal) + parseFloat(shipping)) - parseFloat(discount);

            // Calculate tax
            const tax = (payload.tax_rate == 0 ) ? parseFloat(0).toFixed(2) : parseFloat(total_calc * 0.2 - (tax_skip)).toFixed(2);
            const tax_formatted = tax.replace('.', ',');

            // Total
            const total = (total_calc * 0.8 + parseFloat(tax)).toFixed(2);
            const total_formatted = total.replace('.', ',');

            // Duty
            const duty = payload.shipping_duty != false ? parseFloat(payload.shipping_duty) : parseFloat(0);
            const duty_formatted = duty.toFixed(2).replace('.', ',');

            _this.setState({
                mounted: true,
                shipping_price: shipping_ex_tax,
                shipping_name: payload.shipping_name,
                shipping_droppoint: payload.shipping_droppoint,
                shipping_duty: payload.shipping_duty,
                discount: discount,
                discount_type: payload.discount_type,
                sub_total: subtotal_formatted,
                tax: tax_formatted,
                total: total_formatted,
                duty: duty_formatted
            });
        });

        Emitter.listen('onBeforeShippingState', payload => {
            const shipping = Object.assign({}, payload.shipping);
            _this.setState({
                //shipping_price: shipping.price,
                //shipping_name: shipping.name
            });
        });

        Emitter.listen('onAfterDroppointSelection', payload => {
            _this.setState({
                droppoint: payload.droppoint,
                droppoint_id: payload.droppoint_id
            }, () => {
                Emitter.broadcast('onHandleInputDroppoint', {value: payload.droppoint_id});
            });
        });

        Emitter.listen('onBeforeSummaryFormState', payload => {
            _this.setState({
                updated: true
            }, () => Emitter.broadcast('onAfterSummaryFormState', {state: _this.state}));
        });
    }

    render() {
        if (!this.state.mounted || this.props.products.length < 1) return null;
        // Return null if cart is empty
        if (this.props.products.length < 1) {
            return null;
        }
        return (
            <div className="OrderSummary ">
                <div className="total-item">
                    <div className="grid-row">
                        <div className="xs-6-cl">
                            <p className="name">{reactLocale.string("cart_subtotal")}</p>
                        </div>
                        <div className="xs-6-cl">
                            <p className="price">{this.state.sub_total} DKK</p>
                        </div>
                    </div>
                </div>
                <div className="total-item">
                    <div className="grid-row">
                        <div className="xs-6-cl">
                            <p className="name">{this.state.shipping_name}:</p>
                            {(this.state.droppoint != "" && this.state.shipping_droppoint != 0) ?
                                <span className="name">{this.state.droppoint}</span> : null}
                        </div>
                        <div className="xs-6-cl">
                            <p className="price">{this.state.shipping_price} DKK</p>
                        </div>
                    </div>
                </div>
                {this.state.discount > 0 && <div className="total-item">
                    <div className="grid-row">
                        <div className="xs-6-cl">
                            <p className="name">{(this.state.discount_type == "voucher") ? "Gavekort:" : "Rabat:"}</p>
                        </div>
                        <div className="xs-6-cl">
                            <p className="price">- {this.state.discount} DKK</p>
                        </div>
                    </div>
                </div>}
                <div className="total-item">
                    <div className="grid-row">
                        <div className="xs-6-cl">
                            <p className="name">{reactLocale.string("cart_tax")}</p>
                        </div>
                        <div className="xs-6-cl">
                            <p className="price">{this.state.tax} DKK</p>
                        </div>
                    </div>
                </div>
                {this.state.shipping_duty != false &&
                 <div className="total-item">
                    <div className="grid-row">
                        <div className="xs-6-cl">
                            <p className="name">Duty: </p>
                        </div>
                        <div className="xs-6-cl">
                            <p className="price">{this.state.duty} DKK</p>
                        </div>
                    </div>
                </div>
                }
                <div className="totals">
                    <div className="grid-row">
                        <div className="xs-6-cl">
                            <p className="name">{reactLocale.string("cart_total")}</p>
                        </div>
                        <div className="xs-6-cl">
                            <p className="total-price">{this.state.total} DKK</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
