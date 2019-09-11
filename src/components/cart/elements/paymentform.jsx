import React, {Component} from 'react';
import BasicSelectCustomerGroups from './basic/selectcustomergroups';
import {Divider} from './tools';
import BasicInputZipcode from './basic/inputzipcode';
import BasicSelect from './basic/select';
import BasicInput from './basic/input';

export default class PaymentForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            mounted: false,
            inputs: {},
            customer_groups: {},
            countries: {},
            use_delivery: (!!this.props.use_delivery) || false,
            delivery: (!!this.props.delivery) || false
        }

        // Bindings
        this.commonValidate = this.commonValidate.bind(this);
        this.emailValidate = this.emailValidate.bind(this);
        this.handleDelivery = this.handleDelivery.bind(this);
    }

    componentDidMount() {
        var _this = this;
        // onInitInputs
        Emitter.listen('onInitInputs', function (fields) {
            return _this.setState({
                mounted: true,
                inputs: fields.inputs,
                customer_groups: fields.customer_groups,
                countries: fields.countries,
                delivery: fields.use_delivery,
                use_delivery: fields.use_delivery,
                shipping_method: fields.shipping_method,
                read_only: fields.locked
            });
        });
        // onValidateInputs, plural
        Emitter.listen('onValidateInputs', function (fields) {
            // Iterate
            for (var ref in _this.refs) {
                if (typeof (_this.refs[ref].validation) == "function" && _this.refs[ref].props.name != "payment_country" && _this.refs[ref].props.name != "shipment_country") {
                    var state = (fields.inputs[_this.refs[ref].props.name] == undefined) 
                    ? false 
                    : _this.refs[ref].props.validate(fields.inputs[_this.refs[ref].props.name].value, _this.refs[ref].props.minCharacters);
                    if (!state && _this.refs[ref].props.required) {
                        // Broadcast a state change
                        Emitter.broadcast('onHandleInputChange', {
                            target: _this.refs[ref].props,
                            state: false
                        });
                        // Conditional state checking
                        if (_this.refs[ref].props.name.indexOf("payment_") > -1) {
                            _this.refs[ref].setState({
                                validateVisible: true,
                                validateMessage: _this.refs[ref].props.errorMessage
                            });
                        } else if (_this.refs[ref].props.name.indexOf("shipment_") > -1 && _this.refs.delivery.checked) {
                            _this.refs[ref].setState({
                                validateVisible: true,
                                validateMessage: _this.refs[ref].props.errorMessage
                            });
                        } else {
                            _this.refs[ref].setState({validateVisible: false, validateMessage: ""});
                        }
                    }
                }
            }
        });

        // onValidateInput, single
        Emitter.listen('onValidateInput', function (payload) {
            var field = payload.field;
            if (typeof (_this.refs[field].validation) == "function") {
                var state = (_this.state.inputs[_this.refs[field].props.name] == undefined) ? false : _this.state.inputs[_this.refs[field].props.name].state;
                if (!state && _this.refs[field].props.required) {
                    // Broadcast a state change
                    Emitter.broadcast('onHandleInputChange', {
                        target: _this.refs[field].props,
                        state: false
                    });
                    _this.refs[field].setState({
                        validateVisible: true, validateMessage: _this.refs[field].props.errorMessage
                    });
                }
            }
        });
    }

    componentDidUpdate() {
        var _this = this;
        /* Used for GLS switching, hides inputs */
        for (var ref in _this.refs) {
            // Conditional state checking
            if (_this.refs[ref].props == undefined) continue;
            if (_this.refs[ref].props.name.indexOf("shipment_") > -1 && _this.state.shipping_method.droppoint == 1) {
                if (_this.refs[ref].props.name != "shipment_zipcode") {
                    // Set state on field object
                    _this.refs[ref].setState({visible: false});
                }
            } else {
                // Set state on field object
                _this.refs[ref].setState({visible: true});
            }
        }
    }

    // General field validations
    commonValidate(value, min) {
        if (value.length >= min) return true;
        return false;
    }

    // Email regex validation
    emailValidate(value) {
        var regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return regex.test(value);
    }

    handleDelivery(changeEvent) {
        // Prevent default
        changeEvent.preventDefault();

        this.setState({
            delivery: !this.refs.delivery.checked,
            use_delivery: !this.refs.delivery.checked
        });


        // Broadcast state change
        Emitter.broadcast('onHandleDelivery', !this.refs.delivery.checked);
        // Trigger a postcode change
        if (this.refs.delivery.checked) {
            if (this.refs.payment_zipcode.props.value != "") {
                Emitter.broadcast('onHandleInputChange', {
                    target: this.refs.payment_zipcode.props,
                    state: true
                });
            }
        } else {
            if (this.refs.shipment_zipcode.props.value != "") {
                Emitter.broadcast('onHandleInputChange', {
                    target: this.refs.shipment_zipcode.props,
                    state: true
                });
            }
        }
    }

    render() {

        if (!this.state.mounted)
            return null;

        var className = classNames("form-group row", {
            'collapse in show': this.state.use_delivery,
            'collapse': !this.state.use_delivery
        });

        var _this = this;

        var customer_group_key = 0;
        var customer_group_state = _this.state.inputs.customer_group || 1;

        // use the group value in case it is set
        if (_this.state.inputs.customer_group !== undefined) {
            customer_group_key = Object.keys(this.state.customer_groups).filter((key) => {
                return _this.state.customer_groups[key].customer_group_id === _this.state.inputs.customer_group.value
            })[0];
        }

        // through broadcast event
        const read_only = this.state.read_only;
        const delivery = this.state.delivery;

        const toggle_style = (read_only) ? "none" : "flex";
        const toggle_shipping = (this.state.delivery) ? "block" : "none";

        return (
            <div className="CredentialsForm" style={{display: (this.state.read_only) ? "none" : "block"}}>
                <form onSubmit={this.props.onSubmit}>
                    <h5 className="visible-first"><strong>{reactLocale.string("cart_step_1")}</strong>{reactLocale.string("cart_shipping_delivery")}</h5>
                    <div className="payment-address grid-row" id="payment-address">
                        {this.state.customer_groups[1].custom_fields.map((custom_field, n) => {
                            return (
                                <BasicInput key={n} ref={"payment_" + custom_field.name.toLowerCase()} name={"payment_" + custom_field.name.toLowerCase()} label={custom_field.name} type="text" placeholder={custom_field.name} required={true} minCharacters={1} errorMessage={(custom_field.name.toLowerCase() == 'ean/cvr') ? reactLocale.string("cart_field_cvr_invalid") : custom_field.name + reactLocale.string("cart_field_custom_invalid")} emptyMessage={(custom_field.name.toLowerCase() == 'ean/cvr') ? reactLocale.string("cart_field_cvr_invalid") : custom_field.name + reactLocale.string("cart_field_custom_invalid")} validate={_this.commonValidate} value={(_this.state.inputs["payment_" + custom_field.name.toLowerCase()]) ? _this.state.inputs["payment_" + custom_field.name.toLowerCase()].value : ""}/>
                            );
                        })}
                        <Divider/>
                        <BasicInput readonly={read_only} ref="payment_firstname" name="payment_firstname"
                                    label={reactLocale.string("cart_field_firstname")} type="text"
                                    placeholder={reactLocale.string("cart_field_firstname")} required={true}
                                    minCharacters={1} errorMessage={reactLocale.string("cart_field_firstname_invalid")}
                                    emptyMessage={reactLocale.string("cart_field_firstname_invalid")}
                                    validate={this.commonValidate}
                                    value={(this.state.inputs.payment_firstname) ? this.state.inputs.payment_firstname.value : ""}/>
                        <BasicInput readonly={read_only} ref="payment_lastname" name="payment_lastname"
                                    label={reactLocale.string("cart_field_lastname")} type="text"
                                    placeholder={reactLocale.string("cart_field_lastname")} required={true}
                                    minCharacters={2} errorMessage={reactLocale.string("cart_field_lastname_invalid")}
                                    emptyMessage={reactLocale.string("cart_field_lastname_invalid")}
                                    validate={this.commonValidate}
                                    value={(this.state.inputs.payment_lastname) ? this.state.inputs.payment_lastname.value : ""}/>
                        <BasicInput readonly={read_only} ref="payment_email" name="payment_email"
                                    label={reactLocale.string("cart_field_email")} type="text"
                                    placeholder={reactLocale.string("cart_field_email")} required={true}
                                    minCharacters={6} errorMessage={reactLocale.string("cart_field_email_invalid")}
                                    emptyMessage={reactLocale.string("cart_field_email_invalid")}
                                    validate={this.emailValidate}
                                    value={(this.state.inputs.payment_email) ? this.state.inputs.payment_email.value : ""}/>
                        <BasicInput readonly={read_only} ref="payment_telephone" name="payment_telephone"
                                    label={reactLocale.string("cart_field_phone")} type="text"
                                    placeholder={reactLocale.string("cart_field_phone")} required={true}
                                    minCharacters={3} errorMessage={reactLocale.string("cart_field_phone_invalid")}
                                    emptyMessage={reactLocale.string("cart_field_phone_invalid")}
                                    validate={this.commonValidate}
                                    value={(this.state.inputs.payment_telephone) ? this.state.inputs.payment_telephone.value : ""}/>
                        <BasicInput readonly={read_only} ref="payment_address" name="payment_address"
                                    label={reactLocale.string("cart_field_adress")} type="text"
                                    placeholder={reactLocale.string("cart_field_adress")} required={true}
                                    minCharacters={3} errorMessage={reactLocale.string("cart_field_adress_invalid")}
                                    emptyMessage={reactLocale.string("cart_field_adress_invalid")}
                                    validate={this.commonValidate}
                                    value={(this.state.inputs.payment_address) ? this.state.inputs.payment_address.value : ""}/>
                        <BasicInputZipcode readonly={read_only} ref="payment_zipcode" name="payment_zipcode"
                                           label={reactLocale.string("cart_field_zipcode")} type="text"
                                           placeholder={reactLocale.string("cart_field_zipcode")} required={true}
                                           minCharacters={3}
                                           errorMessage={reactLocale.string("cart_field_zipcode_invalid")}
                                           emptyMessage={reactLocale.string("cart_field_zipcode_invalid")}
                                           validate={this.commonValidate}
                                           value={(this.state.inputs.payment_zipcode) ? this.state.inputs.payment_zipcode.value : ""}/>
                        <BasicInput readonly={read_only} ref="payment_city" name="payment_city"
                                    label={reactLocale.string("cart_field_city")} type="text"
                                    placeholder={reactLocale.string("cart_field_city")} required={true}
                                    minCharacters={3} errorMessage={reactLocale.string("cart_field_city_invalid")}
                                    emptyMessage={reactLocale.string("cart_field_city_invalid")}
                                    validate={this.commonValidate}
                                    value={(this.state.inputs.payment_city) ? this.state.inputs.payment_city.value : ""}/>
                        <BasicSelect readonly={read_only} ref="payment_country" name="payment_country"
                                     label={reactLocale.string("cart_field_country")} type="text"
                                     placeholder={reactLocale.string("cart_field_country")} required={true}
                                     minCharacters={2} errorMessage={reactLocale.string("cart_field_country_invalid")}
                                     emptyMessage={reactLocale.string("cart_field_country_invalid")}
                                     value={(this.state.inputs.payment_country) ? this.state.inputs.payment_country.value : "57"}
                                     countries={this.state.countries}/>
                        <BasicInput readonly={read_only} ref="payment_company" name="payment_company"
                                    label={reactLocale.string("cart_field_company")} type="text"
                                    placeholder={reactLocale.string("cart_field_company")}
                                    validate={this.commonValidate}
                                    value={(this.state.inputs.payment_company) ? this.state.inputs.payment_company.value : ""}/>
                    </div>
                </form>
                <div className="form-group styled">
                    <div className="visibility-container" style={{display: toggle_style}}>
                        <input className="collapsed" id="app-cart-use-delivery-switch" type="checkbox" ref="delivery"
                               onClick={this.handleDelivery} checked={this.state.delivery} data-toggle="collapse"
                               data-target="#app-cart-use-delivery"/>
                        <label htmlFor="app-cart-use-delivery-switch" onClick={this.handleDelivery}><span
                            className="checkmark"/> {reactLocale.string("cart_shipping_second_adress")}</label>
                        {(this.state.shipping_method.droppoint == 1 && this.state.use_delivery) &&
                        <div className=" danger">{reactLocale.string("cart_shipping_second_adress_info")}</div>}
                    </div>
                </div>
                { // Delivery to other address
                    <div className={className} ref="use-delivery" id="app-cart-use-delivery"
                         style={{display: toggle_shipping}}>
                        <div className="visibility-container grid-row" style={{display: toggle_style}}>
                            <BasicInput ref="shipment_firstname" name="shipment_firstname"
                                        label={reactLocale.string("cart_field_firstname")} type="text"
                                        placeholder={reactLocale.string("cart_field_firstname")} required={true}
                                        minCharacters={1}
                                        errorMessage={reactLocale.string("cart_field_firstname_invalid")}
                                        emptyMessage={reactLocale.string("cart_field_firstname_invalid")}
                                        validate={this.commonValidate}
                                        value={(this.state.inputs.shipment_firstname) ? this.state.inputs.shipment_firstname.value : ""}/>
                            <BasicInput ref="shipment_lastname" name="shipment_lastname"
                                        label={reactLocale.string("cart_field_lastname")} type="text"
                                        placeholder={reactLocale.string("cart_field_lastname")} required={true}
                                        minCharacters={2}
                                        errorMessage={reactLocale.string("cart_field_lastname_invalid")}
                                        emptyMessage={reactLocale.string("cart_field_lastname_invalid")}
                                        validate={this.commonValidate}
                                        value={(this.state.inputs.shipment_lastname) ? this.state.inputs.shipment_lastname.value : ""}/>
                            <BasicInput ref="shipment_email" name="shipment_email"
                                        label={reactLocale.string("cart_field_email")} type="text"
                                        placeholder={reactLocale.string("cart_field_email")} required={true}
                                        minCharacters={6} errorMessage={reactLocale.string("cart_field_email_invalid")}
                                        emptyMessage={reactLocale.string("cart_field_email_invalid")}
                                        validate={this.emailValidate}
                                        value={(this.state.inputs.shipment_email) ? this.state.inputs.shipment_email.value : ""}/>
                            <BasicInput ref="shipment_telephone" name="shipment_telephone"
                                        label={reactLocale.string("cart_field_phone")} type="text"
                                        placeholder={reactLocale.string("cart_field_phone")} required={true}
                                        minCharacters={3} errorMessage={reactLocale.string("cart_field_phone_invalid")}
                                        emptyMessage={reactLocale.string("cart_field_phone_invalid")}
                                        validate={this.commonValidate}
                                        value={(this.state.inputs.shipment_telephone) ? this.state.inputs.shipment_telephone.value : ""}/>
                            <BasicInput ref="shipment_address" name="shipment_address"
                                        label={reactLocale.string("cart_field_adress")} type="text"
                                        placeholder={reactLocale.string("cart_field_adress")} required={true}
                                        minCharacters={3} errorMessage={reactLocale.string("cart_field_adress_invalid")}
                                        emptyMessage={reactLocale.string("cart_field_adress_invalid")}
                                        validate={this.commonValidate}
                                        value={(this.state.inputs.shipment_address) ? this.state.inputs.shipment_address.value : ""}/>
                            <BasicInputZipcode ref="shipment_zipcode" name="shipment_zipcode"
                                               label={reactLocale.string("cart_field_zipcode")} type="text"
                                               placeholder={reactLocale.string("cart_field_zipcode")} required={true}
                                               minCharacters={3}
                                               errorMessage={reactLocale.string("cart_field_zipcode_invalid")}
                                               emptyMessage={reactLocale.string("cart_field_zipcode_invalid")}
                                               validate={this.commonValidate}
                                               value={(this.state.inputs.shipment_zipcode) ? this.state.inputs.shipment_zipcode.value : ""}/>
                            <BasicInput ref="shipment_city" name="shipment_city"
                                        label={reactLocale.string("cart_field_city")} type="text"
                                        placeholder={reactLocale.string("cart_field_city")} required={true}
                                        minCharacters={3} errorMessage={reactLocale.string("cart_field_city_invalid")}
                                        emptyMessage={reactLocale.string("cart_field_city_invalid")}
                                        validate={this.commonValidate}
                                        value={(this.state.inputs.shipment_city) ? this.state.inputs.shipment_city.value : ""}/>
                            <BasicSelect ref="shipment_country" name="shipment_country"
                                         label={reactLocale.string("cart_field_country")} type="text"
                                         placeholder={reactLocale.string("cart_field_country")} required={true}
                                         minCharacters={2}
                                         errorMessage={reactLocale.string("cart_field_country_invalid")}
                                         emptyMessage={reactLocale.string("cart_field_country_invalid")}
                                         value={(this.state.inputs.shipment_country) ? this.state.inputs.shipment_country.value : "57"}
                                         countries={this.state.countries}/>
                            <BasicInput ref="shipment_company" name="shipment_company"
                                        label={reactLocale.string("cart_field_company")} type="text"
                                        placeholder={reactLocale.string("cart_field_company")}
                                        validate={this.commonValidate}
                                        value={(this.state.inputs.shipment_company) ? this.state.inputs.shipment_company.value : ""}/>
                        </div>
                    </div>
                }
            </div>
        );
    }
}
