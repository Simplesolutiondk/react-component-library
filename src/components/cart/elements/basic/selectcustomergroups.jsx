import React, {Component} from 'react';

export default class BasicSelectCustomerGroups extends Component {
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
        this.handleChange = this.handleChange.bind(this);
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
            Emitter.broadcast('onHandleInputCustomerGroupChange', {
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
    }

    render() {
        var options = this.props.customer_groups.map(function(option, n) {
            return (
                <option key={n} value={option.customer_group_id}>
                    {(option.value != '') ? option.name : option.name}
                </option>
            );
        });
        return (
            <div className="sm-6-cl">
                <div className="form-group">
                { //React.createElement(InputError, { visible: this.state.errorVisible, errorMessage: this.state.errorMessage })
                    <select className="form-control" id={this.props.name} type={this.props.type} placeholder={this.props.placeholder} onChange={this.handleChange} value={this.state.sizeValue} defaultValue={this.state.value ? this.state.value : 57}>
                        {options}
                    </select>
                }
                </div>
            </div>
        );
    }
}
