import React, {Component} from 'react';
import InputError from '../error/input';
import ValidateError from '../error/validate';

export default class BasicInputZipcode extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isEmpty: true,
            value: this.props.value,
            valid: false,
            errorMessage: "Input is invalid",
            errorVisible: false
        }

        // Bindings
        this.handleBlur = this.handleBlur.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    // Proxy for onBlur, used for final validation
    handleBlur(event) {
        var valid = this.props.validate(event.target);
        this.validation(event, valid);
    }

   // Proxy for onChange
    handleChange(event) {
    // Validate the field locally
        this.validation(event);
        // Bind the event
        if (this.props.onChange) {
            this.props.onChange(event.target);
        }
    }

    validation(event, valid) {
        // The valid variable is optional, and true if not passed in
        if (typeof valid === 'undefined') {
            valid = true;
        }

        var message = '';
        var errorVisible = false;

        // When user leaves state
        if (!valid) {
            message = this.props.errorMessage;
            valid = false;
            errorVisible = true;
        } else if (this.props.required && event.target.value.length === 0) {
            message = this.props.emptyMessage;
            valid = false;
            errorVisible = true;
        } else if (event.target.value.length < this.props.minCharacters) {
            message = this.props.errorMessage;
            valid = false;
            errorVisible = true;
        }

        // Emit change to mainframe
        Emitter.broadcast('onHandleInputChange', {
            target: event.target ? event.target : event.srcElement,
            state: valid
        });

        this.setState({
            value: event.target.value,
            isEmpty: !event.target.value.length > 0,
            valid: valid,
            errorMessage: message,
            errorVisible: errorVisible,
            validateMessage: message,
            validateVisible: false
        });
    }

    render() {
        var className = classNames("form-control", {'error': this.state.validateVisible});
        var style = {
            display: this.state.visible ? "block" : "none"
        }

        return (
            <div style={style} className="sm-6-cl">
                <div className="form-group">
                    <input readOnly={(this.props.readonly != undefined) ? this.props.readonly : false} id={this.props.name} type={this.props.type} placeholder={this.props.placeholder} onChange={this.handleChange} value={this.state.value} className={className}/>
                    <InputError visible={this.state.errorVisible} errorMessage={this.state.errorMessage}/>
                    <ValidateError visible={this.state.validateVisible} validateMessage={this.state.validateMessage}/>
                </div>
            </div>
        );
    }
}