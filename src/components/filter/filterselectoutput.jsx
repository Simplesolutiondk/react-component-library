import React, {Component} from 'react'
import PropTypes from 'prop-types';
import style from './style.css';
import IcoMoon from '../IcoMoon/index';

export class FilterSelectOutput extends Component {
    constructor(props) {
        super(props);
        this.state = {
            checked: [],
            isOpen: false
        }
    }

    static getDerivedStateFromProps(nextProps, prevState){
        if(nextProps.reset == true) {
            return { checked: []};
        }

        return null;
    }

    handleDropDownState() {
        this.setState({
            isOpen: !this.state.isOpen
        });
    }

    handleSetOption(value, condition) {
        let checkedValue = this.state.checked;
        if (condition) {
            checkedValue.push(parseInt(value));
        } else {
            let index = checkedValue.indexOf(parseInt(value));
            checkedValue.splice(index, 1);
        }
        this.setState({
            checked: checkedValue
        });
    }

    handleResetSelections() {
        this.setState({checked: []}, () => {
            this.props.handleReset();
        });
    }

    handleSubmitSelections() {
        this.props.handleSelect(this.state.checked);
    }

    handleDisplayOptions() {
        const displayOption = this.state.checked.map((checked, index) => {
            // Find index
            const optionIndex = this.props.options.findIndex(option => {
                return option.value == checked;
            });

            return (<div className="option-body" key={index}>
                <p className="option-text">{this.props.options[optionIndex].name}</p>
            </div>)
        });
        return displayOption;
    }

    render() {

        const {checked, isOpen} = this.state;

        const options = this.props.options.map((option, index) => {

            // Opacity handler
            const style = {
                opacity: (!option.state)
                    ? 1
                    : 0.5
            };

            // Checked state
            const isChecked = checked.includes(option.value);

            // Shorthand function
            const setOption = (e) => this.handleSetOption(e.target.value, e.target.checked);

            return (<label className="item-container" key={index} style={style}>{option.name} ({option.count})
                <input type="checkbox" value={option.value} onChange={e => setOption(e)} checked={isChecked
                    ? true
                    : false} disabled={option.state
                    ? true
                    : false}/>
                <span className="checkmark"></span>
            </label>)
        });

        // Shorthand functions
        const resetSelections = () => this.handleResetSelections();
        const dropDownState = () => this.handleDropDownState();
        const displayOptions = () => this.handleDisplayOptions();

        // Action buttons
        const submitSelections = () => this.handleSubmitSelections();

        return (<div className="select-box-container">
            <button className="select-box" onClick={() => dropDownState()}>
        <span>{
            (checked.length > 0)
                ? displayOptions()
                : this.props.type
        }</span>
            </button>
            {
                (checked.length > 0)
                    ? <button className="select-box-clear" onClick={() => resetSelections()}><IcoMoon icon='arrow_downward'></IcoMoon></button>
                    : <button className="select-box-default"><IcoMoon icon='arrow_downward'></IcoMoon></button>
            }
            <div className="list-result" style={{
                display: (isOpen)
                    ? 'block'
                    : 'none'
            }}>
                {options}
                <div className="list-result-actions">
                    <button disabled={(checked.length == 0)} className="btn btn--tertiary-outline list-button-clear" onClick={() => resetSelections()}>Clear</button>
                    <button disabled={(checked.length == 0)} className="btn btn--tertiary list-button-submit" onClick={() => submitSelections()}>Submit</button>
                </div>
            </div>
        </div>)
    }
}