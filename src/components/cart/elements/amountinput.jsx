import React, {Component} from 'react';
import * as utils from '../utils/utils';

export default class AmountInput extends Component {
    constructor(props) {
        super(props);
        this.state = {
            quantity: this.props.quantity
        }

        // Bindings
        this.changeHandler = this.changeHandler.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        this.setState({quantity: nextProps.quantity});
    }

    changeHandler(event) {
        var target_quantity = event.target.value;
        this.setState({
            quantity: (utils.is_int(parseInt(target_quantity))) ? target_quantity : 1
        }, () => {
            return Emitter.broadcast('onProductAmountChange', {
                index: this.props.index,
                quantity: this.state.quantity
            });
        })
    }

    render() {
        return <input type="text" value={this.state.quantity} onChange={this.changeHandler}/>;
    }
}