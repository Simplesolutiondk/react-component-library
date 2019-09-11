import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import Emitter from '../../eventemitter.js';
import ModalOverlay from './modaloverlay.jsx';
import ModalBox from './modalbox.jsx';

class ModalDialog extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            closeModal: this.closeModal,
            data: {}
        };
        this.closeModal = this.closeModal.bind(this);
    }

    componentDidMount() {
        const _this = this;

        Emitter.listen('onModal', payload => _this.setState({isOpen: true, data: payload}));

        Emitter.listen('onModalClose', payload => _this.setState({isOpen: false}));

        if (document.getElementsByClassName('formQuote')[0] !== undefined && document.getElementsByClassName('formQuote')[0].getElementsByClassName('gform_confirmation_wrapper').length) {
            document.querySelector('button[name=get-quote]').style.display = 'none';
        }

        Emitter.listen('showModalQuote', payload => {

            let form = document.getElementsByClassName(payload.classForm)[0];
            form.querySelector('input[type=hidden]').value = payload.idProduct;

            payload.type = 'quote';
            payload.text = form.innerHTML;
            payload.modalClassName = 'modal__quote';
            payload.title = 'Get quote';


            this.setState({isOpen: true, data: payload});
        });


        Emitter.listen('onAddToCart', payload => {

            // Quantity fallback
            if (parseInt(payload.quantity) <= 1) {
                payload.quantity = 1;
            }

            // Init
            payload.text = '';
            payload.image = '';
            payload.attributes = '';

            // Length check
            if (payload.product_info.length > 0) {
                // Iterate
                payload.product_info.forEach((product) => {

                    console.log('products', product);

                    if (product.producttype === "variable") {
                        product.selectedAttribute.names.forEach((name) => {
                            if (name !== "undefined") {
                                payload.attributes += `</br><span>${name.name}: ${name.option}</span>`;
                            }
                        });
                    }

                    payload.text += `<p>${payload.quantity} x ${product.name}${payload.attributes}</p>`;
                    Emitter.broadcast('onAfterAddToCart', {
                        product_info: product,
                        quantity: payload.quantity
                    });
                });
            }

            // Decoration of properties
            payload.type = 'cart';
            payload.modalClassName = 'modal__addtocart';
            payload.title = 'Success';
            payload.image = payload.product_info.image;
            payload.freeshipping = 'Free shipping message';
            payload.cartUrl = `${location.origin}/cart`;


            // Set state and get a cart data state
            this.setState({data: payload}, () => {
                Emitter.broadcast('onRequestCartData', {type: 'total_price'});
            });
        });


        // onRequestCartData
        Emitter.listen('onReceiveCartData', payload => {
            let data = this.state.data;
            data.freeshipping = payload.data > 750
                ? 'The order applies for free Shipping'
                : 'You need ' + (750 - payload.data) + ' more to apply for free shipping';
            _this.setState({isOpen: true, data: data});
        });

        // Add to cart custom modus
        Emitter.listen('onAddToCartCustom', payload => {
            payload.type = 'cart';
            payload.modalClassName = 'simple addtocart voucher';
            payload.title = reactLocale.string("modal_giftcard_title") + payload.settings.description;
            payload.text = reactLocale.string("modal_giftcard_text") + payload.settings.to_email;
            payload.freeshipping = reactLocale.string("modal_giftcard_info");
            payload.cartUrl = `${location.origin}/cart`;

            _this.setState({isOpen: true, data: payload});

            // Give it some time to resolve
            setTimeout(() => // Emit after event
                Emitter.broadcast('onAfterAddToCartCustom', {
                    type: payload.type,
                    settings: payload.settings
                }), 50);
        });

    }

    openModal() {
        return this.setState({isOpen: true});
    }

    closeModal() {
        const _this = this;
        // Avoid closing the modal in login modus
        if (this.state.data.type == 'login')
            return;
        return _this.setState({isOpen: false, data: {}});
    }

    render() {
        return (<div className="app-modal">
            <ModalBox data={this.state.data} isOpen={this.state.isOpen} close={this.closeModal}/>
            <ModalOverlay isOpen={this.state.isOpen} close={this.closeModal}/>
        </div>)
    }
}


document.addEventListener("DOMContentLoaded", ev => {
    ReactDOM.render(<ModalDialog/>, document.getElementById('modal'));
});
