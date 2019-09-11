import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {FilterSelectOutput} from './filterselectoutput';

// Pure filter select component
export default class FilterSelect extends React.Component {

    // Selection updater
    updateSelection(value) {
        this.props.setSelection({
            [this.props.type]: value,
        });
    };

    // Reset type handler
    handleResetType(type) {
        this.props.resetType(type);
    };

    render() {

        // Iterate over optons
        const options = this.props.filters.map((option) => {
            const index = this.props.enabled.findIndex(enabled => enabled.id === option.id);
            const state = (this.props.enabled.length > 0) ? (index > -1) ? false : true : false;
            const count = (index > -1) ? this.props.enabled[index].count : 0;

            // Object
            return {name: option.name, value: option.id, taxonomy: option.taxonomy, count: count, state: state};
        });

        const {selected, type} = this.props;

        // Shorthand
        const updateSelection = (value) => this.updateSelection(value);
        const resetType = () => this.handleResetType(type);

        return (
            <React.Fragment>
                <FilterSelectOutput type={type} options={options} handleReset={() => resetType()} handleSelect={(value) => updateSelection(value)}/>
            </React.Fragment>
        );
    };
}
