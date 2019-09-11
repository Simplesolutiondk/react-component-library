import React, {Component} from 'react';

export default class ProductDelete extends Component {
    constructor(props) {
        super(props);
        this.state = {
        }

        // Bindings
        this.clickHandler = this.clickHandler.bind(this);
    }

    clickHandler(object) {
        return Emitter.broadcast('onProductDelete', this.props.index);
    }

    render() {
        return (
            <div onClick={this.clickHandler} className="remove btn-default"><span className="ico ico-cross"></span></div>
        );
    }
}