import React, {Component} from 'react';

export default class BasicSelectZipCode extends Component {
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
        this.getSelected = this.getSelected.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    componentDidMount() {
        var _this = this;
        if (this.props.option_selected != undefined) {
            // Get selected droppoint at start
            var selected_droppoint = this.props.options.filter(function(option) {
                return option.number === _this.props.option_selected.value;
            })[0];
            if (selected_droppoint != undefined) {
                // Emit change to mainframe
                Emitter.broadcast('onAfterDroppointSelection', {
                    droppoint: selected_droppoint.company_name,
                    droppoint_id: selected_droppoint.number
                });
            }
        }
    }

    // Get Selected droppoint option
    getSelected() {
        // Emit change to mainframe
        Emitter.broadcast('onAfterDroppointSelection', {
            droppoint: this.refs.droppoint.options[this.refs.droppoint.options.selectedIndex].text,
            droppoint_id: this.refs.droppoint.options[this.refs.droppoint.options.selectedIndex].value
        });
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
        } else {
            // Emit change to mainframe
            Emitter.broadcast('onHandleInputChange', {
                target: event.target,
                state: valid
            });

            // Emit change to mainframe
            Emitter.broadcast('onAfterDroppointSelection', {
                droppoint: event.target.options[event.target.selectedIndex].text,
                droppoint_id: event.target.options[event.target.selectedIndex].value
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
        var _this = this;

        if (this.props.options == undefined || this.props.options.hasOwnProperty('message')) return null;
        
        var selected_option = "";
        if (_this.props.option_selected != undefined) {
            selected_option = _this.props.option_selected.value;
        }

        var options = this.props.options.map(function(option, n) {
            return (
                <option key={n} value={option.number} data-company={option.company_name} selected={parseInt(option.number) == parseInt(selected_option) ? "true" : "false"}>
                    {(option.value != '') ? option.company_name : option.company_name}
                </option>
            );
        });

        return (
            <div className="form-group col-sm-12">
                <select ref={this.props.name} className="form-control" style={{opacity: (this.props.disabled) ? 0.5 : 1}} disabled={this.props.disabled} id={this.props.name} type={this.props.type} placeholder={this.props.placeholder} onChange={(this.props.method_selected) ? this.handleChange : null} value={selected_option} defaultValue={selected_option ? this.state.value : ""}>
                    {options}
                </select>
            </div>
        );
    }
}
  