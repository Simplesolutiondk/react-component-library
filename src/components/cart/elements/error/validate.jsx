import React, {Component} from 'react';

export default class ValidateError extends Component {
    constructor(props) {
        super(props);
        this.state = {
            message: 'Input is invalid'
        }
    }

    render() {
        var errorClass = classNames(this.props.className, {
            'validation': true,
            //'visible': this.props.visible,
            'd-none': !this.props.visible
        });

        var errorType = (this.props.type != undefined) ? this.props.type : "error";
        // Custom setting
        // if (this.props.no_margin) {
        //     var style = {
        //         left: "33%",
        //         padding: "5px 0"
        //     }
        // } else {
        //     var style = {
        //         marginTop: "-73px",
        //         left: "33%",
        //         padding: "5px 0"
        //     }
        // }
        return (
            <div className={errorClass}>
                <div className="alert alert-danger">
                    <i className="ico ico-alert"></i>{this.props.validateMessage}
                </div>
            </div>
        );
    }
}