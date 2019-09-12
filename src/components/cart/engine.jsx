import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {withApi} from '../withapi';
import Mini from './elements/mini';
import TotalSummary from './elements/totalsummary';
import {Container, Error, Checkout} from './elements/tools';
import Right from './elements/right';
import * as utils from './utils/utils';
import Emitter from '../../eventemitter';
import wcApi from '../../utils';

// Globals
window.isSubmitted = false;

const _extends = Object.assign || function (target) {
    for (let i = 1; i < arguments.length; i++) {
        const source = arguments[i];
        for (const key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
                target[key] = source[key];
            }
        }
    }
    return target;
};

/* Cart Engine function providing VM like features */
class Engine extends Component {
    constructor(props) {
        super(props);
        this.state = {
            mounted: false,
            minicart_active: false
        }

        // Create reference
        this.minicartWrapperRef = React.createRef();

        // Bindings
        this._getSelectedTaxRate = this._getSelectedTaxRate.bind(this);
        this._onIncreaseProduct = this._onIncreaseProduct.bind(this);
        this._onHandleEmptyCartButton = this._onHandleEmptyCartButton.bind(this);
        this._onDecreaseProduct = this._onDecreaseProduct.bind(this);
        this._showMiniCartComponent = this._showMiniCartComponent.bind(this);
        this._handleClickOutside = this._handleClickOutside.bind(this);
    }

    componentDidMount() {
        console.log("Engine Mounted");

        // Reference
        const _this = this;

        // Click handler for hiding the minicart
        document.addEventListener('mousedown', this._handleClickOutside);

        // OnInit
        Emitter.listen('onInit', () => {
            _this.setState({
                mounted: true,
                render_main: _this.props.render_main
            }, () => {
                _this._updateStateFromStore();
            });
        });


        wcApi.get('data/countries', (err, data, res) => {
            // Defaults
            _this.setState({
                mounted: true,
                render_main: this.props.render_main,
                products: this.state.products || [],
                errors: this.state.errors || [],
                inputs: this.state.inputs || {},
                customer_groups: this.state.customer_groups || [],
                custom_fields: this.state.custom_fields || {},
                shipping_methods: this.state.shipping_methods || [],
                payment_methods: this.state.payment_methods || [],
                countries: JSON.parse(res),
                droppoints: this.state.droppoints || {},
                use_delivery: this.state.use_delivery || false,
                cart_route: this.state.cart_route,
                minicart_active: false
            }, () => {
                if (this.props.render_main) {
                    // Engine started
                    // Broadcast cart engine init, used for tracking etc
                    Emitter.broadcast('onInitCartEngine', {state: this.state});
                }
            });
        });


        // Update from store
        _this._updateStateFromStore();

        /* Child components, init states */
        // Init mini cart
        Emitter.listen('onInitMiniCart', () => _this.setState({mini_cart_mounted: true}));

        // Init Total Summary
        Emitter.listen('onInitTotalSummary', () => _this.setState({total_summary_mounted: true}));

        /* Input events */
        // Handle an input change
        Emitter.listen('onHandleInputChange', input => _this._onHandleInputChange(input));

        // Handle an input customer group change
        Emitter.listen('onHandleInputCustomerGroupChange', input => _this._onHandleInputCustomerGroupChange(input));

        // Handle an input unmount
        Emitter.listen('onHandleInputUnmount', input => _this._onHandleInputUnmount(input));

        // Handle an input droppoint change
        Emitter.listen('onHandleInputDroppoint', input => _this._onHandleInputDroppoint(input));

        // Handle an input change
        Emitter.listen('onHandleDelivery', state => _this._onHandleDelivery(state));

        // Handle a comment update
        Emitter.listen('onHandleNoteAdd', note => _this._onHandleNoteAdd(note));

        // Handle a newsletter state
        Emitter.listen('onHandleNewsletter', state => _this._onHandleNewsletter(state));

        // Handle a terms state
        Emitter.listen('onHandleTerms', state => _this._onHandleTerms(state));

        Emitter.listen('onHandleNotifyStock', payload => {
            return Emitter.broadcast('onNotifyStock', result);
        });

        /* Checkout events */

        // OnBeforeSubmitForm (checkout button)
        Emitter.listen('onBeforeSubmitForm', () => _this._onBeforeSubmitForm());

        // onAfterSummaryFormState
        Emitter.listen('onAfterSummaryFormState', payload => _this._onAfterSummaryFormState(payload));

        /* Cart events */

        // OnAddToCart (modal, overview)
        Emitter.listen('onAddToCart', payload => {
            // Void
        });

        // OnAfterAddToCart (modal, overview)
        Emitter.listen('onAfterAddToCart', payload => _this._onAddToCart(payload));

        // OnAfterAddToCartCustom (modal, overview)
        Emitter.listen('onAfterAddToCartCustom', payload => _this._onAddCustomProduct(payload));

        // onBeforeShippingChange (summary, credentials, shipping methods)
        Emitter.listen('onBeforeShippingChange', payload => {
            const result = _this._onBeforeShippingChange(payload);
            // Broadcast after event
            return Emitter.broadcast('onAfterShippingChange', result);
        });

        /* Credential form events */
        // onBeforeZipcodeAdd (credentials)
        Emitter.listen('onBeforeZipcodeAdd', payload => {
            const result = _this._onAfterZipcodeAdd(payload);
            // Broadcast after event
            return Emitter.broadcast('onAfterZipcodeChange', result);
        });

        /* Payment methods events */
        // onBeforePaymentChange (summary, credentials, shipping methods)
        Emitter.listen('onBeforePaymentChange', payload => {
            const result = _this._onBeforePaymentChange(payload);
            // Broadcast after event
            return Emitter.broadcast('onAfterPaymentChange', result);
        });

        /* Product Events */
        // OnDeleteProduct (modal, overview)
        Emitter.listen('onProductDelete', payload => {
            _this._onProductDelete(payload);
        });

        // OnProductAmountChange (input element)
        Emitter.listen('onProductAmountChange', payload => {
            _this._onProductAmountChange(payload);
        });

        // Listen to coupon add event
        Emitter.listen('onBeforeAddCouponCode', payload => {
            _this._onBeforeAddCouponCode(payload);
        });

        // Listen to coupon after add event
        Emitter.listen('onAfterAddCouponCode', payload => {
            _this.setState({discount: payload.discount_total});
        });

        // Listen to coupon remove event
        Emitter.listen('onBeforeRemoveCouponCode', payload => {
            _this._onBeforeRemoveCouponCode(payload);
        });

        //  API methods

        // onRequestCartData
        Emitter.listen('onRequestCartData', payload => {
            // Send back the results
            Emitter.broadcast('onReceiveCartData', {
                data: this.state[payload.type]
            });
        });
    }

    // Remove click handler
    componentWillUnmount() {
        document.removeEventListener('mousedown', this._handleClickOutside);
    }

    // Closes the minicart
    _handleClickOutside(event) {
        if (this.state.minicart_active != false && this.minicartWrapperRef != undefined) {
            if (!this.minicartWrapperRef.current.contains(event.target)) {
                this.setState({minicart_active: false});
            }
        }
    }

    /* Updater function */
    componentDidUpdate(prevProps, prevState) {
        // Reference
        const _this = this;

        // Base config
        let inputs = this.state.inputs || {};
        let read_only = false;

        this._getSelectedShipping(prevState).then((shipping) => {

            const shipping_methods = [];
            shipping_methods.push(shipping);

            const total = 0;
            const totals = this._onRecalculateTotals();
            let discount = 0;
            const tax_rate = _this._getSelectedTaxRate();
            const tax_calc = tax_rate == 0
                ? 0.8
                : 1;

            if (this.state.discount) {
                discount = parseFloat(this.state.discount);
            }

            /* Init broadcasters */
            // Broadcast Init state
            Emitter.broadcast('onInitSummaryForm', {
                shipping_methods: shipping_methods,
                shipping_name: shipping.name,
                shipping_price: shipping.price,
                shipping_droppoint: shipping.droppoint,
                shipping_duty: shipping.duty,
                total_quantity: this.state.total_quantity,
                discount: this.state.discount,
                discount_type: this.state.discount_type,
                tax_rate: _this._getSelectedTaxRate()
            });

            // Broadcast Init state
            Emitter.broadcast('onInitInputs', {
                inputs: inputs,
                customer_groups: this.state.customer_groups,
                custom_fields: this.state.custom_fields,
                countries: this.state.countries,
                use_delivery: this.state.use_delivery,
                shipping_method: shipping,
                locked: read_only
            });

            // Broadcast Init state
            Emitter.broadcast('onInitProductForm', {
                coupon: this.state.coupon,
                note: this.state.note,
                newsletter: this.state.newsletter,
                terms: this.state.terms,
                locked: read_only
            });

            // Broadcast Init state
            Emitter.broadcast('onInitShippingMethods', {
                inputs: this.state.inputs,
                shipping_methods: shipping_methods,
                products: this.state.products,
                total_price: totals.total_price,
                droppoints: this.state.droppoints,
                use_delivery: this.state.use_delivery,
                locked: read_only
            });

            // Broadcast Init state
            Emitter.broadcast('onInitPaymentMethods', {
                payment_methods: this.state.payment_methods,
                inputs: this.state.inputs,
                total_price: parseFloat(totals.total_price) * tax_calc,
                discount,
                locked: read_only
            });

            // /* Sub elements */
            if (document.getElementsByClassName('app-mini-cart')[0] != null) {
                let shipping_price = 0;
                // Set selected
                if (this.state.products.length > 0) {
                    shipping_price = shipping.price;
                }
                let total_summary = (parseFloat(totals.total_price) * tax_calc) + parseInt(shipping_price) - discount;
                if (this.state.products.length == 0) {
                    total_summary = 0;
                }

                // Sub components
                ReactDOM.render((<React.Fragment>
                    <div className="status" onClick={this._showMiniCartComponent}>
                        <TotalSummary mounted={true} total_quantity={this.state.total_quantity}/>
                    </div>
                    <div ref={this.minicartWrapperRef} className={"mini-cart" + (
                        this.state.minicart_active
                            ? ' show'
                            : '')}>
                        <Mini state={this.state} increase={this._onIncreaseProduct} decrease={this._onDecreaseProduct}
                              cart_route={this.state.cart_route}
                              total_price={parseFloat(totals.total_price) * tax_calc}/>
                    </div>
                    {this.state.minicart_active &&
                    <div className="close-overlay" onClick={this._showMiniCartComponent}></div>}
                </React.Fragment>), document.getElementsByClassName('app-mini-cart')[0]);
            }

            // Change of shipping method
            if (this.state.shipping_methods[0].name != shipping_methods[0].name
                || this.state.shipping_methods[0].type != shipping_methods[0].type) {
                this.setState({
                    shipping_methods,
                    selected_shipping: shipping_methods[0]
                });
            }
        });

        // Return update
        return true;
    }

    /* Payment select methods */
    _getSelectedPayment() {
        const payment = this.state.payment_methods.filter(payment_method => payment_method.selected == 1)[0];
        if (!payment) {
            return {name: "", settings: ""}
        }
        return {name: payment.name, settings: payment.settings}
    }

    /* Shipping select method */
    _getSelectedShipping(use_discount) {

        const products = this.state.products;
        const country = this._getSelectedCountry();
        const postData = {products, country};

        // Create a promise
        let response = new Promise((resolve, reject) => {
            // WC api call
            wcApi.post('calc_shipping', postData, (err, data, res) => {
                let parsed = JSON.parse(res);
                resolve({
                    name: parsed.params[0].label,
                    price: parsed.params[0].cost,
                    type: parsed.params[0].type,
                    droppoint: parsed.params[0].droppoint,
                    duty: parsed.params[0].duty
                });
            });
        });

        return response;
    }

    // _getSelectedPayment
    _getSelectedTaxRate() {
        // All countrues beside DK are tax deducted
        return this._getSelectedCountry != 'DK' ? 0 : 0.2;
    }

    _getSelectedCountry() {
        let country;
        if (this.state.inputs == undefined) {
            country = 'DK';
        } else {
            // Check for country
            country = (this.state.inputs.payment_country != undefined)
                ? this.state.inputs.payment_country.value
                : 'DK';

            if (this.state.use_delivery == true) {
                country = this.state.inputs.shipment_country != undefined
                    ? this.state.inputs.shipment_country.value
                    : country;
            }
        }

        return country;
    }

    _showMiniCartComponent() {
        if (window.innerWidth < 576) {
            location.href = location.origin + "/cart";
        } else {
            this.setState({
                minicart_active: (!this.state.minicart_active)
                    ? true
                    : false
            })
        }
    }

    // onHandleSubmit event
    _handleSubmitEpay(order_id) {
        // Remove previous frames, forced
        const iframes = document.querySelectorAll('iframe');
        for (let i = 0; i < iframes.length; i++) {
            iframes[i].parentNode.removeChild(iframes[i]);
        }
        // Settings
        const payment_settings = this._getSelectedPayment().settings;
        // Temp override, force invoice
        if (parseInt(payment_settings.paymentcollection) == 3) {
            return this._handleSubmitInvoicePayment(order_id);
        }
        let parsed_total = this.state.summary.state.total;
        parsed_total = parsed_total.replace(/,/g, '');
        const paymentwindow = new PaymentWindow({
            'merchantnumber': this.state.epay_merchant_number,
            'paymentcollection': parseInt(payment_settings.paymentcollection),
            'splitpayment': parseInt(payment_settings.splitpayment),
            'amount': parsed_total,
            'orderid': order_id,
            'currency': "DKK",
            'windowstate': "1",
            'ownreceipt': parseInt(payment_settings.ownreceipt),
            "callbackurl": `${window.location.protocol}//${window.location.host}/`,
            "accepturl": `${window.location.protocol}//${window.location.host}/`
        });
        paymentwindow.open();
        // Broadcast init event (tracking)
        return Emitter.broadcast('onOpenPaymentMethod', {products: this.state.products});
    }

    // onHandleSubmit event
    _handleSubmitFreePayment(order_id) {
        // Broadcast init event (tracking)
        Emitter.broadcast('onOpenPaymentMethod', {products: this.state.products});
        window.location.href = `${window.location.protocol}//${window.location.host}/`;
    }

    // onHandleSubmit event
    _handleSubmitInvoicePayment(order_id) {
        // Broadcast init event (tracking)
        Emitter.broadcast('onOpenPaymentMethod', {products: this.state.products});
        setTimeout(() => {
            window.location.href = `${window.location.protocol}//${window.location.host}/`;
        }, 1000);
    }

    // onAddCustomProduct method (voucher etc)
    _onAddCustomProduct(object) {
        // New product
        const newProduct = {
            type: "voucher",
            image: "",
            name: reactLocale.string("cart_giftcard"),
            model: "",
            option: object.settings.description,
            price: parseFloat(object.settings.amount),
            product_id: 0,
            sku: 0,
            quantity: 1,
            stock: 0,
            backorder: 0,
            special: null,
            url: "",
            settings: object.settings,
            plugins: [],
            onBeforeRenderPlugin: () => {
                return this;
            },
            onAfterRenderPlugin: () => {
                return this;
            }
        };

        this.state.products.unshift(newProduct);
        this.setState({
            total_quantity: this.state.total_quantity + 1
        }, () => {
            return this._updateStoreAndState();
        });
    }

    // onAddNewProduct method
    _onAddNewProduct(object) {
        let quantity = object.quantity;
        if (quantity < 1)
            quantity = 1;
        const fallback_price = object.product_info.price * 1.25;
        if (object.product_info.discounts != undefined) {
            if (object.product_info.discounts.length > 0) {
                const discounts = object.product_info.discounts;
                product.special = object.product_info.price;
                const goal = parseInt(quantity) || 1;
                const closest = discounts.reduce(
                    (previous, current) => Math.abs(current.quantity - goal) < Math.abs(previous.quantity - goal)
                        ? current
                        : previous);
                if (parseInt(parseInt(quantity)) >= parseInt(closest.quantity)) {
                    object.product_info.price = closest.price;
                }
            }
        }
        // New product
        const newProduct = {
            type: "product",
            producttype: object.product_info.producttype,
            image: object.product_info.image,
            name: object.product_info.name,
            model: object.product_info.model,
            option: object.product_info.option,
            price_fallback: fallback_price,
            price: object.product_info.price * 1.25,
            price_current: (
                (object.product_info.special > 0)
                    ? object.product_info.special
                    : object.product_info.price) * 1.25,
            product_id: object.product_info.product_id,
            sku: object.product_info.sku,
            quantity: parseInt(quantity) || 1,
            stock: object.product_info.quantity,
            discounts: object.product_info.discounts,
            weight: object.product_info.weight,
            backorder: object.product_info.backorder,
            selectedAttribute: object.product_info.selectedAttribute,
            special: (
                (object.product_info.special > 0)
                    ? object.product_info.special
                    : object.product_info.price) * 1.25,
            url: object.product_info.url,
            plugins: []
        };

        this.state.products.unshift(newProduct);
        this.setState({
            total_quantity: this.state.total_quantity + 1
        }, () => {
            return this._updateStoreAndState();
        });
    }

    /* Product methods */

    // onAddToCart method
    _onAddToCart(object) {

        const _this = this;
        // Good old vanilla js in order to keep backwards compatibility
        for (let productIndex = 0; productIndex < this.state.products.length; productIndex++) {
            const product = this.state.products[productIndex];

            if (parseInt(product.product_id) === parseInt(object.product_info.product_id) && parseInt(product.selectedAttribute.variation) === parseInt(object.product_info.selectedAttribute.variation) && object.product_info.producttype === "variable") {
                return _this._onIncreaseProduct(productIndex, object.quantity);
            } else if (parseInt(product.product_id) === parseInt(object.product_info.product_id) && product.producttype !== "variable") {
                return _this._onIncreaseProduct(productIndex, object.quantity);
            }
        }
        return _this._onAddNewProduct(object);
    }

    // Initiated through the summary form, getting final figures
    _onAfterSummaryFormState(payload) {
        const _this = this;
        _this.setState({
            summary: payload
        }, () => {
            // Newsletter, optional
            if (_this.state.newsletter == true) {
                // Subscribe
                _this._onBeforeMailchimpSubscription({
                    first_name: _this.state.inputs.payment_firstname.value,
                    last_name: _this.state.inputs.payment_lastname.value,
                    email: _this.state.inputs.payment_email.value
                });
            }
            // Checkout with voucher
            if (parseInt(this.state.summary.state.total) == 0) {
                // Passed, commit checkout
                _this._onCheckoutConfirm(1).then(response => {
                    _this.setState({
                        order_id: response.order_id
                    }, () => {
                        // Trigger Free method
                        _this._handleSubmitFreePayment(response.order_id);
                        // Broadcast payment init state
                        Emitter.broadcast('onInitPaymentMethodFree', {
                            // Void
                        });
                    });
                });
            } else {
                // Order id defined?
                if (_this.state.order_id != undefined) {
                    // Passed, commit checkout, check for updates
                    _this._onCheckoutConfirm(0).then((response) => {
                        // Trigger _updateStateFromStore
                        _this._handleSubmitEpay(_this.state.order_id);
                        // Broadcast payment init state
                        Emitter.broadcast('onInitPaymentMethod', {
                            // Void
                        });
                    });
                } else {
                    // Passed, commit checkout
                    _this._onCheckoutConfirm(0).then((response) => {
                        _this.setState({
                            order_id: response.order_id
                        }, () => {
                            // Trigger Epay
                            _this._handleSubmitEpay(response.order_id);
                            // Broadcast payment init state
                            Emitter.broadcast('onInitPaymentMethod', {
                                // Void
                            });
                        });
                    });
                }
            }
        });
    }

    // onHandleZipcode method
    _onAfterZipcodeAdd(zipcode) {

        // Create a promise
        let response = new Promise((resolve, reject) => {

            const droppoints = [
                {
                    number: "12345",
                    address: "Test street 1",
                    address2: "12345",
                    city: "Koege.",
                    company_name: "Droppoint 1",
                    zipcode: "4500"
                },
                {
                    number: "54321",
                    address: "Test street 2",
                    address2: "12345",
                    city: "Koege.",
                    company_name: "Droppoint 2",
                    zipcode: "4500"
                }
            ];

            // Resolve primise
            resolve({success: true, droppoints: droppoints});
        });

        return response;
    }

    /* Coupon methods */

    // _onBeforeAddCouponCode method
    _onBeforeAddCouponCode(coupon) {
        // Reference
        const _this = this;
        // Resolve promise
        _this._onFetchAddCouponCode(coupon).then((response) => {

            if (response == undefined) {
                response = {error: null, discount_type: null};
            }

            // General
            if (response.error) {
                response.error = reactLocale.string("cart_giftcard_coupon_invalid");
            }

            // Extra check to see if we need to show a restriction message
            if (_this.state.products.length == 1 && response.discount_type != "voucher"
                && _this.state.products[0].type == "voucher") {
                response.error = reactLocale.string("cart_coupons_invalid");
            } else if (_this.state.products.length == 1 && parseFloat(_this.state.products[0].special) < parseFloat(_this.state.products[0].price) && response.discount_type != "voucher") {
                //response.error = reactLocale.string("cart_coupons_invalid");

                // Modify and allow it
                response.discount_type = "voucher";
            }
            // If error
            if (response.error) {
                return Emitter.broadcast('onValidateCoupon', {error: response.error});
            }

            _this.setState({
                coupon,
                discount: (response.amount > 0)
                    ? response.amount
                    : 0,
                discount_type: response.discount_type
            }, () => {
                // Broadcast after event
                Emitter.broadcast('onAfterAddCouponCode', response, true).then(() => {
                    _this._updateStoreAndState();
                    return _this.state;
                });
            });
        });
    }

    _onBeforeMailchimpSubscription(credentials) {
        const data = {
            email: credentials.email,
            first_name: credentials.first_name,
            last_name: credentials.last_name,
            mailchimp_api_key: this.state.mailchimp_api_key,
            mailchimp_server: this.state.mailchimp_server
        };
        return fetch('/', {
            method: 'post',
            credentials: "same-origin",
            headers: {
                "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
            },
            body: `data=${JSON.stringify(data)}`
        }).then(response => response.json()).catch(error => {
            console.log(error);
        });
    }

    // onHandleShippingChange
    _onBeforePaymentChange(current) {
        this.state.payment_methods.map((method, index) => {
            method.selected = (index == current.index)
                ? 1
                : 0;
        });
        // Update state
        this._updateStoreAndState();
        // Return methods
        return this.state.payment_methods;
    }

    // _onBeforeAddCouponCode method
    _onBeforeRemoveCouponCode(coupon) {
        // Reference
        const _this = this;
        _this.setState({
            coupon: "",
            discount: 0,
            discount_type: ""
        }, () => {
            return _this._updateStoreAndState();
        });
    }

    // onHandleShippingChange
    _onBeforeShippingChange(current) {
        this.state.shipping_methods.map((method, index) => {
            method.selected = (method.code == current.option)
                ? 1
                : 0;
        });
        // Update state
        this._updateStoreAndState();
        // Return methods
        return this.state.shipping_methods;
    }

    /* Checkout/Summary Methods */
    _onBeforeSubmitForm() {
        const _this = this;
        // Broadcast validate event
        const result = Emitter.broadcast('onValidateInputs', {inputs: _this.state.inputs});
        // Broadcast validate term event
        Emitter.broadcast('onValidateTerm', {});
        // Final product stock check
        _this.state.products = _this.state.products;
        let validation_count = 0;
        // Iterate over inputs, we bypass shipping fields here when droppoint based
        // so as to maintain validation messages when shipping methods are switched
        Object.keys(_this.state.inputs).forEach((key, index) => {
            if (_this.state.use_delivery == true && key.includes('shipment_')) {
                if (_this._getSelectedShipping().droppoint != 1 && key != "shipment_zipcode") {
                    validation_count = (_this.state.inputs[key].state !== true && key != undefined)
                        ? validation_count + 1
                        : validation_count;
                }
            } else if (key.includes('payment_')) {
                if (key != "payment_telephone") {
                    /* @TODO: check why this does not validate
                    validation_count = (_this.state.inputs[key].state !== true && key != undefined)
                      ? validation_count + 1
                      : validation_count;
                    */
                }
            }
        });
        // Iterate over products
        Object.keys(_this.state.products).forEach((key, index) => {
            if (_this.state.products[key].type == "voucher")
                return;
            if (parseInt(_this.state.products[key].stock) < parseInt(_this.state.products[key].quantity)
                && parseInt(_this.state.products[key].backorder) != 1) {
                validation_count = validation_count + 1;
            }
        });

        let terms = _this.state.terms;

        // Construct modal message
        if (!terms || parseInt(validation_count) != 0) {

            // Trigger modal
            let body = "";
            if (!_this.state.terms) {
                body += "<div>" + reactLocale.string("cart_terms_invalid") + "</div>";
            }

            // If droppoint based shipping and the array is empty (Invalid zipcode, API issues)
            if ((_this.state.shipping_methods[0].droppoint == 1)
                && Object.keys(_this.state.droppoints).length === 0) {
                body += "<div>" + __this.state.shipping_methods[0].name + " " + reactLocale.string("cart_droppoint_invalid");
            }

            // Iterate over inputs, we bypass shipping fields here when droppoint based
            // so as to maintain validation messages when shipping methods are switched
            Object.keys(_this.state.inputs).forEach((key, index) => {
                if (_this.state.inputs[key].errorMessage != undefined && key != undefined) {
                    if (_this.state.use_delivery == true && key.includes('shipment_')) {
                        if (_this._getSelectedShipping().droppoint != 1 && key != "shipment_zipcode") {
                            body += `<div>${_this.state.inputs[key].errorMessage}</div>`;
                        }
                    } else if (key.includes('payment_')) {
                        body += `<div>${_this.state.inputs[key].errorMessage}</div>`;
                    }
                }
            });
            // Initial error state
            let product_error_added = false;
            // Iterate over products
            Object.keys(_this.state.products).forEach((key, index) => {
                if (_this.state.products[key].type == "voucher")
                    return;
                if (parseInt(_this.state.products[key].stock) != 0 && parseInt(_this.state.products[key].stock) < parseInt(_this.state.products[key].quantity) && parseInt(_this.state.products[key].backorder) == 0) {
                    _this.state.products[index].error = 1;
                    _this.state.products[index].error_message = reactLocale.string("cart_product_stock_invalid");
                    _this.state.products[index].validation_message = `${reactLocale.string("cart_product_stock_available")} ${_this.state.products[key].stock}`;
                    // Adjust flag
                    if (!product_error_added) {
                        product_error_added = true;
                        body += "<div>" + reactLocale.string("cart_product_stock_error") + "</div>";
                    }
                } else if ((parseInt(_this.state.products[key].backorder) == 0 && parseInt(_this.state.products[key].stock) == 0)) {
                    _this.state.products[index].error = 1;
                    _this.state.products[index].error_type = "error";
                    _this.state.products[index].error_message = reactLocale.string("cart_product_soldout");
                    _this.state.products[index].validation_message = reactLocale.string("cart_product_invalid");
                    if (!product_error_added) {
                        product_error_added = true;
                        body += "<div>" + reactLocale.string("cart_product_stock_error") + "</div>";
                    }
                } else {
                    // Remove visible validations
                    _this.state.products[index].error = 0;
                    // Delete error states
                    delete _this.state.products[index].error_type;
                    delete _this.state.products[index].error_message;
                    delete _this.state.products[index].validation_message;
                }
            });
            // Update state
            _this.setState({
                products: _this.state.products
            }, () => {
                // Broadcast to modal
                Emitter.broadcast('onModal', {
                    text: body,
                    close: "Luk"
                }, true).then(() => {
                    // Reset button state
                    Emitter.broadcast('onResetSubmitButton', {
                        // Void
                    });
                });
            });
        } else {
            // Update state
            _this.setState({
                products: _this.state.products
            }, () => {

                // Timeout for resolving
                setTimeout(() => {
                    // Get a state update from the summary form, populates internal state
                    Emitter.broadcast('onBeforeSummaryFormState', {
                        // Void
                    });
                    // Reset button state
                    Emitter.broadcast('onResetSubmitButton', {
                        // Void
                    });
                }, 1000);

            });
        }
    }

    // onCheckoutConfirm method
    _onCheckoutConfirm(free) {
        if (free == 1) {
            this.state.free_method = 1;
        } else {
            this.state.free_method = 0;
        }

        // Iterate and convert prices to strings
        let products = this.state.products;

        console.log(products);

        let productVariations = [];
        let total = 0;
        products.forEach((product) => {
            productVariations.push({
                product_id: product.product_id,
                variation_id: (product.selectedAttribute.variation) ? product.selectedAttribute.variation : 0,
                quantity: product.quantity,
            });
        });
        console.log('productV', productVariations);

        const data = {
            payment_method: this.state.payment_methods.filter((method) => method.selected == 1)[0].name,
            payment_method_title: this.state.payment_methods.filter((method) => method.selected == 1)[0].name,
            set_paid: false,
            billing: {
                first_name: this.state.inputs.payment_firstname.value,
                last_name: this.state.inputs.payment_lastname.value,
                address_1: this.state.inputs.payment_address.value,
                address_2: '',
                city: this.state.inputs.payment_city.value,
                state: '',
                postcode: this.state.inputs.payment_zipcode.value,
                country: this.state.inputs.payment_country.value,
                email: this.state.inputs.payment_email.value,
                phone: this.state.inputs.payment_telephone.value,
                company: this.state.inputs.payment_company.value
            },
            line_items: productVariations,
        };

        console.log('test data', data);

        // Create a promise
        let response = new Promise((resolve, reject) => {
            // WC api call
            wcApi.post('orders', data, function (err, data, res) {
                let parsed = JSON.parse(res);
                resolve({order_id: parsed.id});

                console.log(res);
            });
        });

        return response;
    }

    // onCheckoutConfirm method
    _onCheckoutConfirmStockAmount() {
        return fetch('/', {
            method: 'post',
            credentials: "same-origin",
            headers: {
                "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
            },
            body: `data=${encodeURIComponent(JSON.stringify(this.state.products))}`
        }).then(response => response.json()).catch(error => {
            console.log(error);
        });
    }

    // onDecreaseProduct
    _onDecreaseProduct(currentIndex) {
        const products = this.state.products;
        const product = products[currentIndex];
        if (product.discounts.length > 0) {
            const discounts = product.discounts;
            const goal = product.quantity - 1;
            const closest = discounts.reduce(
                (previous, current) => Math.abs(current.quantity - goal) < Math.abs(previous.quantity - goal)
                    ? current
                    : previous);

            if (goal > 1) {
                if (parseInt(product.quantity - 2) <= parseInt(closest.quantity)) {
                    product.price = closest.price * 1.25;
                    product.special = product.price;
                }
            } else {
                product.price = product.price_fallback;
                product.special = product.price;
            }
        }
        if (product.quantity > 1) {
            // Decrease count
            product.quantity--;
            product.total = (
                product.quantity * (parseFloat(product.special) < parseFloat(product.special))
                    ? parseFloat(product.special)
                    : parseFloat(product.price)).toFixed(2);
        } else {
            // Discount scenario
            product.total = (
                product.quantity * (parseFloat(product.special) < parseFloat(product.special))
                    ? parseFloat(product.special)
                    : parseFloat(product.price)).toFixed(2);
        }
        if (product.error) {
            product.error = 0;
            delete product.error_message;
            delete product.validation_message;
        }
        products[currentIndex] = product;
        return this._onRecalculateProductObjects(products);
    }

    /* Fetch API based methods */

    // onHandleCoupon method
    _onFetchAddCouponCode(coupon_code) {

        // Create a promise
        let response = new Promise((resolve, reject) => {
            // WC api call
            wcApi.get('coupons', (err, data, res) => {

                const parsed = JSON.parse(res);
                const found = parsed.filter((coupon) => {
                    return coupon.code == coupon_code;
                })[0];

                if (found) {
                    resolve({discount_type: found.discount_type, amount: found.amount});
                } else {
                    resolve({});
                }
            });
        });

        return response;
    }

    // onHandleDelivery
    _onHandleDelivery(state) {
        // Reference
        const _this = this;
        this.setState({
            use_delivery: state
        }, (newsletter) => {
            _this._updateStoreAndState();
            // Return state
            return _this.state;
        });
    }

    // onHandleChange event
    _onHandleEmptyCartButton() {
        window.location.href = "";
    }

    // onHandleError
    _onHandleError(object) {
        const errors = this.state.errors || [];
        // Reference
        const _this = this;
        // Avoid polyfills
        errors.push({type: object.type, value: object.value});
        this.setState({
            errors: []
        }, (errors) => {
            _this._updateStoreAndState();
            // Return inputs
            return _this.state.errors;
        });
    }

    // onHandleInputChange
    _onHandleInputChange(object) {
        const inputs = this.state.inputs || {
            inputs: []
        };

        const input = object.target;
        const state = object.state;
        const identifier = (input.name != undefined && input.name != "")
            ? input.name
            : input.id;

        // Reference
        const _this = this;

        // Avoid polyfills
        inputs[identifier] = {
            errorMessage: input.errorMessage,
            value: input.value,
            state
        }


        let retrigger = false;
        let retrigger_data = {};

        if (identifier == undefined)
            return;

        // Country change, retrigger droppoints
        if (identifier.includes('_country')) {
            if (this.state.inputs['payment_zipcode'] && this.state.inputs['payment_zipcode'].value.length == 4 || (this.state.inputs['shipment_zipcode'] && this.state.inputs['shipment_zipcode'].value.length == 4 && this.state.use_delivery != false)) {
                retrigger = true;
                if (this.state.use_delivery == true) {
                    retrigger_data = {
                        id: 'shipment_zipcode',
                        value: this.state.inputs['shipment_zipcode'].value
                    }
                } else {
                    retrigger_data = {
                        id: 'payment_zipcode',
                        value: this.state.inputs['payment_zipcode'].value
                    }
                }
            }
        }

        // Act on zipcode changes, or a retrigger (reselecting a country that supports droppoints)
        if (identifier == 'payment_zipcode' && input.value.length == 4
            || (identifier == 'shipment_zipcode' && input.value.length == 4)
            || retrigger == true) {

            //Selecteed zipcode
            let zipcode = input.value;
            if (retrigger) {
                zipcode = retrigger_data.value;
            }

            // Do not act on non droppoint based
            if (this.state.shipping_methods[0].droppoint == 0) {
                _this.setState({
                    inputs: _extends({}, _this.state.inputs),
                }, (inputs) => {
                    _this._updateStoreAndState();
                    // Return inputs
                    return _this.state.inputs;
                });

                return;
            }

            // Get a droppoint response
            _this._onAfterZipcodeAdd(zipcode).then((response) => {

                // Change to right flag for when the service is down
                if (!response.success) {
                    // Set droppoints
                    _this.setState({
                        inputs: _extends({}, _this.state.inputs),
                        droppoints: {}
                    }, (inputs) => {
                        _this._updateStoreAndState();
                        // Return inputs
                        return _this.state.inputs;
                    });
                } else {
                    // Set droppoints
                    _this.setState({
                        inputs: _extends({}, _this.state.inputs),
                        droppoints: {
                            gls: response.droppoints
                        }
                    }, (inputs) => {
                        if (this.state.shipping_methods[0].type != null) {
                            if (this.state.shipping_methods[0].type == "gls") {

                                var droppoint = {
                                    droppoint_name: response.droppoints[0].company_name,
                                    droppoint_id: response.droppoints[0].number
                                };

                            } else if (this._getSelectedShipping().type == "pakkelabels") {
                                var droppoint = {
                                    droppoint_name: response.droppoints.pakkelabels[0].company_name,
                                    droppoint_id: response.droppoints.pakkelabels[0].number
                                };
                            } else {
                                _this._updateStoreAndState();
                                // Return inputs
                                return _this.state.inputs;
                            }

                            // Set default selected
                            Emitter.broadcast('onAfterDroppointSelection', {
                                droppoint: droppoint.droppoint_name,
                                droppoint_id: droppoint.droppoint_id
                            });
                        }
                        _this._updateStoreAndState();
                        // Return inputs
                        return _this.state.inputs;
                    });
                }
            });
        } else {
            this.setState({
                inputs: _extends({}, this.state.inputs)
            }, (inputs) => {
                _this._updateStoreAndState();
                // Return inputs
                return _this.state.inputs;
            });
        }
    }

    // onHandleInputCustomerGroupChange
    _onHandleInputCustomerGroupChange(object) {
        const inputs = this.state.inputs || {
            inputs: []
        };

        const input = object.target;
        const state = object.state;
        const identifier = (input.name != undefined && input.name != "")
            ? input.name
            : input.id;

        // Reference
        const _this = this;

        // Avoid polyfills
        inputs[identifier] = {
            errorMessage: input.errorMessage,
            value: input.value,
            state
        }

        // Hotfix, find out why componentWillUnmount does not work
        for (let groupIndex = 0; groupIndex < this.state.customer_groups.length; groupIndex++) {
            const custom_fields = this.state.customer_groups[groupIndex].custom_fields;
            // Iterate over custom fields
            for (let groupFieldIndex = 0; groupFieldIndex < custom_fields.length; groupFieldIndex++) {
                const custom_field = custom_fields[groupFieldIndex].name;
                delete this.state.inputs[`payment_${custom_field.toLowerCase()}`];
            }
        }

        this.setState({
            inputs: _extends({}, this.state.inputs)
        }, (inputs) => {
            _this._updateStoreAndState();
            // Return inputs
            return _this.state.inputs;
        });
    }

    // onHandleInputDroppoint
    _onHandleInputDroppoint(object) {
        const inputs = this.state.inputs || {
            inputs: []
        };
        // Avoid polyfills
        inputs['droppoint'] = {
            value: object.value,
            state: true
        };
        this.setState({
            inputs: _extends({}, this.state.inputs)
        }, (inputs) => {
            return this._updateStoreAndState();
        });
    }

    // onHandleInputUnmount
    _onHandleInputUnmount(object) {

        // Implement at a later state, do not act on empty cart
        // Currently bugged at React, proposed fix is pending
    }

    // onHandleNewsletter
    _onHandleNewsletter(state) {
        // Reference
        const _this = this;
        this.setState({
            newsletter: state
        }, (newsletter) => {
            _this._updateStoreAndState();
            // Return state
            return _this.state;
        });
    }

    // onHandleNoteAdd
    _onHandleNoteAdd(note) {
        // Reference
        const _this = this;
        this.setState({
            note
        }, (comment) => {
            _this._updateStoreAndState();
            // Return comment
            return _this.state;
        });
    }

    // onHandleTerms
    _onHandleTerms(state) {
        // Reference
        const _this = this;
        this.setState({
            terms: state
        }, (terms) => {
            _this._updateStoreAndState();
            // Return state
            return _this.state;
        });
    }

    // onIncreaseProduct
    _onIncreaseProduct(currentIndex, quantity) {
        const _this = this;
        const products = this.state.products;
        const product = products[currentIndex];
        if (typeof quantity != 'undefined') {
            if (utils.is_int(quantity) && quantity > 0) {
                product.quantity = parseInt(product.quantity) + parseInt(quantity);
            } else {
                product.quantity = parseInt(product.quantity) + 1;
            }
            if (product.discounts.length > 0) {
                var discounts = product.discounts;
                product.special = product.price;
                var goal = product.quantity;
                var closest = discounts.reduce(
                    (previous, current) => Math.abs(current.quantity - goal) < Math.abs(previous.quantity - goal)
                        ? current
                        : previous);
                if (parseInt(product.quantity) >= parseInt(closest.quantity)) {
                    product.price = closest.price * 1.25;
                }
            }
        } else {
            var quantity = product.quantity;
            if (product.discounts.length > 0) {
                var discounts = product.discounts;
                product.special = product.price;
                var goal = product.quantity + 1;
                var closest = discounts.reduce(
                    (previous, current) => Math.abs(current.quantity - goal) < Math.abs(previous.quantity - goal)
                        ? current
                        : previous);
                if (parseInt(product.quantity + 1) >= parseInt(closest.quantity)) {
                    product.price = closest.price * 1.25;
                }
            }

            if ((parseInt(product.backorder) == 0 && parseInt(product.stock) < 0)) {
                product.error = 1;
                product.error_type = "error";
                product.error_message = reactLocale.string("cart_product_soldout");
                product.validation_message = reactLocale.string("cart_product_stock_error");
                product.quantity = quantity;
            } else if ((parseInt(product.backorder) == 0 && parseInt(product.stock) == 0)) {
                product.error = 1;
                product.error_type = "error";
                product.error_message = reactLocale.string("cart_product_soldout");
                product.validation_message = reactLocale.string("cart_product_invalid");
                product.quantity = quantity;
            } else if (parseInt(product.backorder) == 0 && parseInt(product.quantity) == parseInt(product.stock)) {
                product.error = 1;
                product.error_type = "warning";
                product.error_message = reactLocale.string("cart_product_stock_invalid");
                product.validation_message = `${reactLocale.string("cart_product_stock_available")} ${product.stock}`;
                product.quantity = quantity;
            } else {
                product.quantity = quantity + 1;
                product.error = 0;
                delete product.error_type;
                delete product.error_message;
                delete product.validation_message;
            }
        }
        product.total = (
            product.quantity * (parseFloat(product.special) < parseFloat(product.special))
                ? parseFloat(product.special)
                : parseFloat(product.price)).toFixed(2);
        products[currentIndex] = product;
        return this._onRecalculateProductObjects(products);
    }

    // onInitINputs
    _onInitInputs() {
        // Return inputs
        return this.state.inputs;
    }

    // onProductAmountChange
    _onProductAmountChange(object) {
        const _this = this;
        const product = this.state.products[object.index];
        if (product.discounts.length > 0) {
            const discounts = product.discounts;
            product.special = product.price;
            const goal = product.quantity;
            const closest = discounts.reduce(
                (previous, current) => Math.abs(current.quantity - goal) < Math.abs(previous.quantity - goal)
                    ? current
                    : previous);
            if (parseInt(product.quantity) >= parseInt(closest.quantity)) {
                product.price = closest.price * 1.25;
            }
        }
        product.quantity = parseInt(product.quantity) > 0 && parseInt(product.backorder) != 0
            ? product.quantity++
            : product.quantity;
        product.total = (product.quantity * (parseFloat(product.special) < parseFloat(product.special))
            ? parseFloat(product.special)
            : parseFloat(product.price)).toFixed(2);
        this.state.products[object.index] = product;
        return this._onRecalculateProductObjects(this.state.products);
    }

    // onDeleteProduct
    _onProductDelete(index) {
        const _this = this;
        const products = this.state.products;
        const newProducts = utils.arrayRemoveElement(products, index);
        // Adjust internal session too


        _this._onProductDeleteFromSession(this.state.products[index].product_id).then((reponse) => {
            // Check if we need to remove coupons
            if (newProducts.length == 1 && parseInt(_this.state.discount > 0)) {
                if (parseFloat(newProducts[0].special) < parseFloat(newProducts[0].price)) {
                    _this.setState({
                        products: newProducts,
                        coupon: "",
                        discount: 0
                    }, () => {
                        Emitter.broadcast('onBeforeRemoveCouponCode', _this.state.coupon);
                        return _this._onRecalculateProductObjects(newProducts);
                    });
                }
            } else {
                _this.setState({
                    products: newProducts
                }, () => {
                    Emitter.broadcast('onBeforeAddCouponCode', _this.state.coupon);
                    return _this._onRecalculateProductObjects(newProducts);
                });
            }
        });

        // Send event to tracking
        Emitter.broadcast('onAfterProductDelete', {product: _this.state.products[index]});
    }

    // onProductDelete method
    _onProductDeleteFromSession(product_id) {
        return fetch('index.php', {
            method: 'post',
            credentials: "same-origin",
            headers: {
                "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
            },
            body: `data=${JSON.stringify(product_id)}`
        }).then(response => response.json()).catch(error => {
            console.log(error);
        });
    }

    /* Computation methods */

    // onRecalculateProductObject
    _onRecalculateProductObject(product) {
        product.total = product.quantity * product.price;
        this.setState({
            total_price: this.state.total_price + product.price
        });
        this._updateStoreAndState();
    }

    // onRecalculateProductObjects
    _onRecalculateProductObjects() {
        const _this = this;
        let total_price = 0;
        let total_quantity = 0;
        // Iterate
        this.state.products.map((product) => {
            total_price += parseFloat(product.price) * parseInt(product.quantity);
            total_quantity += parseInt(product.quantity);
        });
        // Recheck coupons
        Emitter.broadcast('onBeforeAddCouponCode', this.state.coupon, true).then(() => {
            _this.setState({
                total_price,
                total_quantity
            }, () => {
                return _this._updateStore();
            });
        });
    }

    // onRecalculateTotals
    _onRecalculateTotals() {
        let total_price = 0;
        let total_quantity = 0;
        this.state.products.map((product) => {
            total_price += (
                parseFloat(product.special) < parseFloat(product.price)
                    ? parseFloat(product.special)
                    : parseFloat(product.price)) * parseInt(product.quantity);
            total_quantity += parseInt(product.quantity);
        });
        const total = {
            total_price,
            total_quantity
        };
        return total;
    }

    // Uses store getter
    _updateStateFromStore() {
        const data = this.props.state.get() || [];
        this.setState(data);
    }

    // Uses store setter
    _updateStore() {
        this.props.state.set(this.state);
    }

    /* State methods */

    // State update functions
    _updateStoreAndState() {
        this._updateStore();
        this._updateStateFromStore();
    }

    // onHandleChange event
    handleChange(e) {
        e.preventDefault();
    }

    // Renderer
    render() {

        let read_only = false;

        if (this.state.mounted && this.props.render_main) {
            if (Object.keys(this.state.products).length === 0) {
                return (<div className="app-cart">
                    <div className="empty-cart">
                        <h1>{reactLocale.string("cart_no_products")}</h1>
                    </div>
                    <div className="customcontinue-shopping text-left">
                        {Container}
                        <a className="btn btn-info"
                           onClick={this._onHandleEmptyCartButton}>{reactLocale.string("cart_button_back")}</a>
                    </div>
                </div>);
            }
            return (
                <div className="grid-container">
                    <div className="grid-row">
                        <Error errors={this.state.errors}/>
                        <Checkout payment_methods={this.state.payment_methods} products={this.state.products}
                                  shipping_methods={this.state.shipping_methods}/>
                        <Right disount={this.state.discount} tax={this.state.tax} price={this.state.total_price}
                               products={this.state.products} shipping_methods={this.state.shipping_methods}
                               total_quantity={this.state.total_quantity} tax_rate={this._getSelectedTaxRate()}
                               changeAmount={this._onIncreaseProduct} increase={this._onIncreaseProduct}
                               decrease={this._onDecreaseProduct} read_only={read_only}/>
                    </div>
                </div>);
        } else {
            return null
        }
    }
}

export default withApi(Engine);
// export default Engine;
