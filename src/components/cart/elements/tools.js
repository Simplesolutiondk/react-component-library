import React, {Component} from 'react';
import * as utils from '../utils/utils';
import PaymentForm from './paymentform';
import ShippingRows from './shippingrows';
import PaymentRows from './paymentrows';
import OrderSummary from './ordersummary';
import OptForm from './optform';
import CheckoutButton from './checkoutbutton';
import MiniProductForm from './miniproductform';

export function Container(props) {
    return <div className="container">{props.children}</div>;
}

export function Divider(props) {
    return <div className="clear">{'\xA0'}</div>;
}

export function Spinner(props) {
    return (
        <svg
            className="spinner"
            width="50px"
            height="50px"
            viewBox="0 0 66 66"
            xmlns="http://www.w3.org/2000/svg"
        >
            <circle
                className="path"
                fill="none"
                strokeWidth="5"
                strokeLinecap="round"
                cx="33"
                cy="33"
                r="30"
            />
        </svg>
    );
}

export function Errors(props) {
    const errors = props.errors.map((error, index) => <div>Error</div>);
    return <div className="errors">{errors}</div>;
}

export function Error(props) {
    // Temp disable
    return null;
    return (
        <div className="xs-12-cl lg-6-cl">
            <div className="error " style={{marginBottom: '20px'}}>
                <Errors errors={props.errors}/>
            </div>
        </div>
    );
}

export function Checkout(props) {
    return (
        <div className="xs-12-cl lg-6-cl xl-7-cl checkout-form">
            <PaymentForm
                onSubmit={props.onSubmit}
                payment_methods={props.payment_methods}
                inputs={props.inputs}
                total_price={props.total_price}
            />
            <ShippingRows
                onSubmit={props.onSubmit}
                payment_methods={props.payment_methods}
                inputs={props.inputs}
                products={props.inputs}
                total_price={props.total_price}
            />
            <PaymentRows
                onSubmit={props.onSubmit}
                payment_methods={props.payment_methods}
                inputs={props.inputs}
                total_price={props.total_price}
            />
            {window.innerWidth <= 991 && (
                <div className="summary">
                    <OrderSummary
                        discount={props.discount}
                        tax={props.products}
                        shipping_methods={props.shipping_methods}
                        products={props.products}
                    />
                </div>
            )}
            {window.innerWidth <= 991 && (
                <OptForm
                    onSubmit={props.onSubmit}
                    total_quantity={props.total_quantity}
                    products={props.products}
                    shipping_methods={props.shipping_methods}
                />
            )}
            {window.innerWidth <= 991 && (
                <div className="ButtonForm ">
                    <CheckoutButton onClick={props.onSubmit}/>
                </div>
            )}
        </div>
    );
}

export function MiniCart(props) {
    return (
        <MiniProductForm
            onSubmit={props.onSubmit}
            total_quantity={props.total_quantity}
            increase={props.increase}
            decrease={props.decrease}
            changeAmount={props.changeAmount}
            products={props.products}
            shipping_methods={props.shipping_methods}
            discount={props.discount}
            cart_url={props.cart_url}
        />
    );
}

export function IncreaseCount(props) {
    const clickHandler = utils.increaseItem.bind(this, props);
    return (
        <span onClick={clickHandler} className="up increaseCount">
      +
    </span>
    );
}

export function DecreaseCount(props) {
    const clickHandler = utils.decreaseItem.bind(this, props);
    return (
        <span onClick={clickHandler} className="down decreaseCount">
      -
    </span>
    );
}
