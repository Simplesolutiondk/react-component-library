import React, {Component} from 'react';
import BasicSelectZipCode from './basic/selectzipcode';

export default class ShippingRows extends Component {
    constructor(props) {
        super(props);
        this.state = {
            mounted: false,
            total_price: 0,
            inputs: {},
            shipping_methods: [],
            products: [],
            droppoints: [],
            use_delivery: false,
            index: 0
        }
        
        // Bindings
        this.handleOptionChange = this.handleOptionChange.bind(this);
        this.scrollTo = this.scrollTo.bind(this);
    }

    componentDidMount() {

        // onInitShippingMethods
        Emitter.listen('onInitShippingMethods', props => {

            this.setState({
                mounted: true,
                inputs: props.inputs,
                shipping_methods: props.shipping_methods,
                products: props.products,
                total_price: props.total_price,
                droppoints: props.droppoints,
                use_delivery: props.use_delivery,
                read_only: props.locked
            })
        });
    }
    
    componentWillUpdate() {
        if (this.state.total_price > 0 && this.state.shipping_methods.length > 0) {
            const type = this.refs.shipping.dataset.type;
            // Emit onBeforeShippingState
            Emitter.broadcast('onBeforeShippingState', {shipping: this.refs.shipping.dataset});
        }
        return false;
    }
    
    handleOptionChange(changeEvent) {
        const _this = this;
        const type = changeEvent.target.dataset['type'];
        if ((type == 51 || type == 54) && Object.keys(_this.state.droppoints).length == 0) {
            if (this.state.use_delivery) {
                var zipcode = document.getElementById("shipment_zipcode");
                // Single validation
                Emitter.broadcast('onValidateInput', {field: "shipment_zipcode"});
            } else {
                var zipcode = document.getElementById("payment_zipcode");
                // Single validation
                Emitter.broadcast('onValidateInput', {field: "payment_zipcode"});
            }
            // Set focus
            zipcode.focus();
            // Scroll
            _this.scrollTo(document.body, zipcode.offsetTop, 200);
            return false;
        }
    
        if ((type == 51 || type == 54) && Object.keys(_this.state.droppoints).length > 1) {
            this.refs[`droppoint-select-${type}-${changeEvent.target.dataset['index']}`].getSelected();
        }
    
        // Set internal state
        this.setState({
            index: changeEvent.target.dataset['index'],
            option: changeEvent.target.value,
            name: changeEvent.target.dataset['name'],
            price: changeEvent.target.dataset['price']
        }, () => {
            // Emit change to mainframe
            Emitter.broadcast('onBeforeShippingChange', _this.state);
        });
    }
    
    scrollTo(element, to, duration) {
        if (duration <= 0) return;
        const difference = to - element.offsetTop;
        const tick = difference / duration * 10;
        setTimeout(() => {
            element.scrollTop = element.scrollTop + tick;
            if (element.scrollTop === to) return;
            scrollTo(element, to, duration - 10);
        }, 10);
    }
    
    render() {
        
        if (!this.state.mounted || this.state.shipping_methods.length == 0) return null;

        const _this = this;
        // Total price
        const total_price = this.state.total_price;
        // Total weight
        let total_weight = 0;
        // Reference
        const shipping_methods = this.state.shipping_methods;
        // Default
        let country = "57";
        // Set country code based on the selected country and delivery setting
        if (_this.state.inputs.payment_country && _this.state.use_delivery != true) {
            country = _this.state.inputs.payment_country.value;
        } else if (_this.state.inputs.shipment_country && _this.state.use_delivery == true) {
            country = _this.state.inputs.shipment_country.value;
        }
        // Accumulate product weight
        this.state.products.map(obj => total_weight += (parseFloat(obj.weight) ? total_weight + (parseFloat(obj.weight) * obj.quantity) : 0));
        shipping_methods.forEach((object, index) => {
            shipping_methods[index].selected = 0;
        });

        // Count of custom products
        const custom_products = this.state.products.filter(custom_product => custom_product.type === "voucher");
        // count of regular products
        const regular_products = this.state.products.filter(regular_product => regular_product.type === "product");
        // Create a pseudo shipping object
        if (custom_products.length > 0 && regular_products.length == 0) {
            // Voucher based shipping method
            var filtered_shipping_methods = [];
            shipping_methods[0].name = reactLocale.string("cart_shipping_giftcard_title");
            shipping_methods[0].price = 0;
            shipping_methods[0].type = "coupon";
            shipping_methods[0].text = reactLocale.string("cart_shipping_toaddress");
            shipping_methods[0].logo = "";
            filtered_shipping_methods.push(shipping_methods[0]);
        } else {
            // Filter based on selected country
            var filtered_shipping_methods = shipping_methods.filter(method => {
            
                // Remove coupon
                if (method.type == "coupon") {
                    return false;
                }
                
                // just return, weight calcs are done on API level
                return true;
            });
        }

        if (filtered_shipping_methods.length == 1) {
            filtered_shipping_methods[0].selected = 1;
        } else {
            if (parseInt(this.state.index) > 0) {
                filtered_shipping_methods[parseInt(this.state.index)].selected = 1;
            } else {
                filtered_shipping_methods[0].selected = 1;
            }
        }
        // Iterate
        const list = filtered_shipping_methods.map((method, index) => {
            const className = classNames(_this.props.className, {
                'shipping-item visible active': method.selected,
                'shipping-item visible': !method.selected
            });

            if (parseFloat(total_price) >= parseFloat(method.free) && parseInt(method.free) != 0) {
                var price = 0;
            } else {
                var price = method.price;
            }
            method.droppoints = [];
            return (
                <div key={index} className={className} style={{display: (method.hidden) ? "none" : "block"}}>
                    <label>
                        <input type="radio" name="shippingOptions" value={method.code} checked={method.selected} ref={(method.selected) ? "shipping" : `shipping-inactive${index}`} onChange={_this.handleOptionChange} data-index={index} data-selected={method.selected} data-name={method.name} data-price={price} data-type={method.subtype}/>
                        <div className="logo">
                            {method.logo != "" && (<img className="shipping-logo" src={method.logo}/>)}
                        </div>
                        <div className="details">
                            {(this.state.shipping_methods[0].type == 'custom') 
                            ? <div className="price"></div>
                            : <div className="price">{price} DKK</div>
                            }
                            <div className="name">{method.name}</div>
                            <div className="desc">{method.text}</div>
                        </div>
                    </label>
                    {((method.type == "gls") && (Object.keys(_this.state.droppoints).length >= 1)) ? <div className="shipping-selector row">
                        <BasicSelectZipCode ref={`droppoint-select-${method.subtype}-${index}`} disabled={(method.selected) ? false : true} name="droppoint" label="Drop Points" type="select" placeholder="Drop Point" validate={true} method_selected={method.selected} options={(method.subtype == 51) ? _this.state.droppoints.pakkelabels : _this.state.droppoints.gls} option_selected={_this.state.inputs.droppoint}/>
                    </div> : null}
                    {((method.type == "gls") && (Object.keys(_this.state.droppoints).length == 0)) ? <div className="shipping-selector">
                        <div className="text-danger zipcode">{reactLocale.string("cart_shipping_droppoint_zip_missing")}</div>
                    </div> : null}
                </div>
            );
        });
        return (
            <div className="ShipmentForm well" style={{display: (this.state.read_only) ? "none" : "block"}}>
                <h5 className="visible-first visible"><strong>{reactLocale.string("cart_step_2")}</strong>
                <div>Total weight: {total_weight}</div>
                {reactLocale.string("cart_shipping")}</h5>
                {list}
            </div>
        );
    }
}