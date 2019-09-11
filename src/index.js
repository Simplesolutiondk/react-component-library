import React from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';
import {reactLocale, Api, wcApi} from './utils.js';
import Emitter from './eventemitter';
import Filter from './components/filter/filter';
import Store from './store';
import Engine from './components/cart/engine.jsx';
import Navigation from './components/Megamenu/Navigation';
import ImageGallery from './components/product/ImageGallery/ImageGallery';
import Modal from './components/modal/modal';
import Search from './components/search/search';
import GDPR from './components/gdpr/gdpr';


export { default } from './components/modal/modal';


//  Production flag
if (!process.env.NODE_ENV || process.env.NODE_ENV === 'production') {
    // Disable dev tools
    if (typeof window.__REACT_DEVTOOLS_GLOBAL_HOOK__ === "object") {
        for (let [key, value] of Object.entries(window.__REACT_DEVTOOLS_GLOBAL_HOOK__)) {
            window.__REACT_DEVTOOLS_GLOBAL_HOOK__[key] = typeof value == "function"
                ? () => {
                }
                : null;
        }
    }
}

// Globals
window.Store = Store;
window.cart_data = {
    "version": "1.3.29",
    "epay_merchant_number": "8010415",
    "show_total_weight": true,
    "mailchimp_api_key": "",
    "mailchimp_server": "",
    "total_quantity": 0,
    "total_price": 0,
    "price": 0,
    "tax": 25,
    "discount": 0,
    "show_mini": 1,
    "cart_route": "\/cart\/",
    "customer_groups": [
        {
            "customer_group_id": "1",
            "sort_order": "1",
            "language_id": "2",
            "name": "Privat",
            "description": "",
            "custom_fields": []
        }, {
            "customer_group_id": "2",
            "sort_order": "2",
            "language_id": "2",
            "name": "Erhverv",
            "description": "",
            "custom_fields": [
                {
                    "custom_field_id": "3",
                    "custom_field_value": [],
                    "name": "CVR",
                    "type": "text",
                    "value": "",
                    "location": "address",
                    "required": true,
                    "sort_order": "99"
                }, {
                    "custom_field_id": "4",
                    "custom_field_value": [],
                    "name": "Kontaktperson",
                    "type": "text",
                    "value": "",
                    "location": "address",
                    "required": true,
                    "sort_order": "99"
                }
            ]
        }
    ],
    "products": [],
    "shipping_methods": [
        {
            "code": "simpleshipping.method_1",
            "type": "flat",
            "subtype": null,
            "text": "",
            "name": "Default shipping",
            "price": 0,
            "min": 0,
            "free": "",
            "country": ["57"],
            "logo": "images\/gls.svg",
            "droppoints": "",
            "selected": 1,
            "weight": null,
            "weight_min": "",
            "weight_max": "",
            "pricecalcs": 0,
            "pricecalcs_min": "",
            "pricecalcs_max": ""
        }
    ],
    "payment_methods": [
        {
            "code": "simplepayment.method_1",
            "name": "Betalingskort",
            "logo": "images\/payment-cards.svg",
            "selected": 1,
            "settings": {
                "group": "",
                "mailreceipt": "",
                "windowstate": "1",
                "instantcapture": "1",
                "ownreceipt": "1",
                "md5key": "",
                "paymentcollection": "1",
                "paymenttype": "0",
                "cssurl": "",
                "mobilecssurl": "",
                "splitpayment": "0"
            }
        }
    ],
    "countries": [
        {
            "country_id": "57",
            "name": "Danmark"
        },
    ]
};

// Globals
window.Emitter = Emitter;
window.reactLocale = reactLocale;
window.classNames = classNames;
window.wcApi = wcApi;
window.Api = Api;
window.reactLocale = reactLocale;
window.classNames = classNames;

// on DOM ready
document.addEventListener('DOMContentLoaded', () => {

    if (document.getElementById('gdprPolicy') != null) {
        ReactDOM.render(<GDPR/>, document.getElementById('gdprPolicy'));
    }

//    If cart mount is present
    if (document.getElementsByClassName("app-cart")[0] != null) {
        let isCheckout = (document.location.pathname.includes("cart"))
            ? 1
            : 0;

        if (isCheckout) {
            // Create the ePay script include
            let script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = 'https://ssl.ditonlinebetalingssystem.dk/integration/ewindow/paymentwindow.js';
            //  Add to head
            document.getElementsByTagName('head')[0].appendChild(script);
        }

        ReactDOM.render(<Engine state={new Store("cartAppState", cart_data)}
                                render_main={isCheckout}/>, document.getElementsByClassName("app-cart")[0]);
    }

    if (document.getElementById('menu-react-mount') != null) {
        // Init
        ReactDOM.render(<Navigation/>, document.getElementById('menu-react-mount'));
    }

    if (document.getElementById('app-product-gallery') != null) {
        // Init
        ReactDOM.render(<ImageGallery/>, document.getElementById('app-product-gallery'));
    }

    if (document.getElementsByClassName('app-filter')[0] != null) {
        // Init
        ReactDOM.render(<Filter/>, document.getElementsByClassName('app-filter')[0]);
    }

    if (document.getElementsByClassName('app-search')[0] != null) {
        // Init
        ReactDOM.render(<Search/>, document.getElementsByClassName('app-search')[0]);
    }

    // Detection of add to cart button
    if (document.getElementsByClassName('single_add_to_cart_button')[0] != null) {

        const button = document.getElementsByClassName('single_add_to_cart_button')[0];

        // Remove class
        button.classList.remove('single_add_to_cart_button');

        // Attach listener
        button.addEventListener('click', (e) => {

            // Remove default action
            e.preventDefault();

            // Get the product id
            let parentId = document.getElementsByName('product_id')[0] != undefined
                ? document.getElementsByName('product_id')[0].value
                : null;

            // Product is an accessory
            if (parentId == null) {
                parentId = document.getElementsByName('add-to-cart')[0].value;
            }

            // Attributes
            let attributeId = null;
            let attributeName = null;
            let attributeTaxonomyName = null;
            let variationId = null;
            let attributeNames = null;


            // Qty
            const quantity = document.getElementsByClassName('qty')[0].value;

            const accessories = [...document.querySelectorAll('.wc-accessories-product-add-to-cart-checkbox')];

            // Create a holder
            const productIds = [];

            // Iterate
            accessories.forEach((accessory) => {
                if (accessory.checked) {
                    productIds.push(parseInt(accessory.id.replace('product-', '')));
                }
            });

            // Push the parent
            productIds.push(parentId);

            // Modal holder
            const productsToModal = [];


            wcApi.get('products/' + parentId + '/variations', (error, data, response) => {
                const allVariations = JSON.parse(response);
                const attributes = document.getElementsByName('pa_farve');
                const attributesSize = document.getElementsByName('attribute_pa_stoerrelse');

                let selectedAttributeSize = attributesSize[0].options[attributesSize[0].selectedIndex].value;
                attributes.forEach((attribute) => {
                    if (attribute.checked) {
                        attributeName = attribute.value;
                    }
                });

                // Iterate
                allVariations.forEach((variation) => {

                    // Iterate
                    attributes.forEach((attribute) => {
                        attributeName = attribute.getAttribute("name");
                        attributeTaxonomyName = attribute.dataset.taxonomy;
                        if (attribute.checked) {
                            if (attribute.dataset.variation_id.toString() === variation.id.toString()) {
                                attributeId = attribute.dataset.id;
                                variationId = attribute.dataset.variation_id;
                                attributeNames = variation.attributes;
                            }
                        }
                    });
                });

                const attributesOptions = {
                    variation: variationId,
                    names: attributeNames,
                };



                // API based
                wcApi.get('products/?include=' + productIds.join(','), (error, data, response) => {
                    const products = JSON.parse(response);

                    products.forEach((product) => {

                        const productData = {
                            product_id: product.id,
                            name: parentId == product.id ? product.name : '',
                            description: product.description,
                            price: product.price,
                            special: false,
                            discounts: "",
                            sku: product.sku,
                            model: '',
                            image: (product.images.length > 0) ? window.location.origin + product.images[0].src : '/',
                            weight: product.weight,
                            stock: product.stock_quantity,
                            backorder: !product.backorders === "no",
                            url: "",
                            selectedAttribute: attributesOptions,
                            producttype: product.type
                        };

                        console.log(productData);
                        //Populate holder
                        productsToModal.push(productData);
                    });

                    // Broadcast
                    Emitter.broadcast('onAddToCart', {
                        product_info: productsToModal,
                        quantity: quantity
                    });

                });
            });

        });
    }


    if (document.getElementsByClassName('product-description__read_more')[0] != null) {

        const spoiler = document.getElementsByClassName('product-description__read_more')[0];
        const button = document.querySelector('[for="extend-description"]');

        button.addEventListener('click', (e) => {
            spoiler.classList.toggle('opened');
        });


    }

});
