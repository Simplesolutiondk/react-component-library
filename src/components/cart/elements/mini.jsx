import React, {Component} from 'react';
import {Container, MiniCart} from './tools';

export default class Mini extends Component {

    componentDidMount() {
        var _this = this;
        // onInitMiniCart
        Emitter.broadcast('onInitMiniCart', {});
    }

    render() {
        this.state = this.props.state;
        if (this.state.mounted) {
            return <MiniCart discount={this.state.discount} tax={this.state.tax} total_price={this.state.total_price} onSubmit={this.handleSubmit} products={this.state.products} shipping_methods={this.state.shipping_methods} total_quantity={this.state.total_quantity} increase={this.props.increase} decrease={this.props.decrease} cart_route={this.props.cart_route}/>
        }else {
            return null
        }
    }
}
