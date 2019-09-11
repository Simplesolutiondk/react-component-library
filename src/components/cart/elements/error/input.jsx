import React, {Component} from 'react';

export default class InputError extends Component {
    constructor(props) {
        super(props);
        this.state = {
            message: 'Input is invalid'
        }
    }

    render() {
        var errorClass = classNames(this.props.className, {
            'alert alert-danger': true,
            //'visible': this.props.visible,
            'd-none': !this.props.visible
        });
        
        return null;

        return (
            <div className={errorClass}>
                <i className="ico ico-alert"></i>{this.props.errorMessage}
            </div>
        );
    }
}