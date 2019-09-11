import React, {Component} from 'react';
import NumFormat from '../../../elements/utils/numformat';

export default class TotalSummaryMini extends Component {
    constructor(props) {
        super(props);
        this.state = {
            mounted: true,
            total_price: 0
        }
    }

    componentDidMount() {
        var _this = this;
        // onOrderSummaryChange
        Emitter.listen('onOrderSummaryChange', function(total) {
            return _this.setState({mounted: true, total_price: total});
        });
        // onInitSummaryForm
        Emitter.listen('onInitSummaryForm', function(total) {
            return _this.setState({mounted: true, total_price: total.total_price});
        });
        // onInitTotalSummary
        Emitter.broadcast('onInitTotalSummary', {});
    }

    render() {
        if (!this.state.mounted) return null;
        return (
            <div className="OrderSummaryMini ">
                <div id="total">
                    <div className="grid-row">
                        <div className="col-4 sm-6-cl">
                            <p className="name">{reactLocale.string("cart_total")}</p>
                        </div>
                        <div className="col-8 sm-6-cl text-right">
                            <p className="total-price"><NumFormat number={parseFloat(this.state.total_price)} /> DKK</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}