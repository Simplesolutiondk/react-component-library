import React, {Component} from 'react';
import NumFormat from '../../../elements/utils/numformat';

export default class TotalSummary extends Component {
    constructor(props) {
        super(props);
        this.state = {
            mounted: true,
            total_quantity: this.props.total_quantity
        }
    }

    componentDidMount() {
        var _this = this;
        // onInitSummaryForm
        Emitter.listen('onInitSummaryForm', function(total) {
            return _this.setState({mounted: true, total_quantity: total.total_quantity});
        });
        // onInitTotalSummary
        Emitter.broadcast('onInitTotalSummary', {});
    }

    render() {
        return (
            <React.Fragment>
                <span className="ico ico-basket"></span>
                <span className="totals">{this.state.total_quantity}</span>
            </React.Fragment>
        )
    }
}