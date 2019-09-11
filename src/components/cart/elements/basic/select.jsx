import React, {Component} from 'react';
import InputError from '../error/input';

export default class BasicSelect extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isEmpty: true,
            value: this.props.value,
            valid: false,
            errorMessage: "Input is invalid",
            errorVisible: false,
            visible: true
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
            this.props.onChange(event);
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
        } else {
            // Emit change to mainframe
            Emitter.broadcast('onHandleInputChange', {
                target: event.target ? event.target : event.srcElement,
                state: valid
            });
        }

        this.setState({
            value: event.target.value,
            isEmpty: !event.target.value.length > 0,
            valid: valid,
            errorMessage: message,
            errorVisible: errorVisible
        });

        var dropdown = event.target;
        setTimeout(function() {
            dropdown.blur();
        }, 500);
    }

    render() {
        var style = {
            display: this.state.visible ? "block" : "none"
        }

        var options = this.props.countries.map(function(option, n) {
            return (<option key={n} value={option.country_id}>
            {
                (option.value != '')
                ? option.name
                : option.name
            }
            </option>);
        });

        return (
            <div style={style} className="sm-6-cl">
                <div className="form-group">
                    <select className="form-control" id={this.props.name} type={this.props.type} placeholder={this.props.placeholder} onChange={this.handleChange} onBlur={this.handleBlur} value={this.state.sizeValue} defaultValue={this.state.value ? this.state.value : 57}>
                        {options}
                    </select>
                    <InputError visible={this.state.errorVisible} errorMessage={this.state.errorMessage}/>
                </div>
            </div>
        );
    }
}
