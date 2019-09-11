import React, {Component} from 'react';
import OrderSummary from './ordersummary';
import ProductRows from './productrows';

export default class MiniProductForm extends Component {
    constructor(props) {
        super(props);
        this.state = {}

        // Bindings
        this.onHandleSubmit = this.onHandleSubmit.bind(this);
    }

    onHandleSubmit() {
        window.location.href = "/cart";
    }

    render() {
        if (this.props.products.length < 1) {
            return (
                <div className="cart-wrapper">
                    <div className="productform">
                        <form onSubmit={this.props.onSubmit}>
                            <div className="no-products">{reactLocale.string("cart_no_products")}</div>
                        </form>
                    </div>
                    <div className="summary">
                        <OrderSummary discount={this.props.discount} tax={this.props.products}
                                      shipping_methods={this.props.shipping_methods} products={this.props.products}/>
                    </div>
                </div>
            );
        }

        return (
            <React.Fragment>
                <div className="details">
                    <form onSubmit={this.props.onSubmit}>
                        <ProductRows products={this.props.products} increase={this.props.increase}
                                     decrease={this.props.decrease} changeAmount={this.props.changeAmount}/>
                    </form>
                </div>
                <div className="summary">
                    <OrderSummary discount={this.props.discount} tax={this.props.products}
                                  shipping_methods={this.props.shipping_methods} products={this.props.products}/>
                </div>
                <div className="checkout-button">
                    <button type="button" className="btn btn--primary"
                            onClick={this.onHandleSubmit}>{reactLocale.string("cart_button_continue")}</button>
                </div>
            </React.Fragment>
        );
    }
}
