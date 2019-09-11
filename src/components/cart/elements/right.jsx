import React, {Component} from 'react';
import ProductForm from './productform';
import TotalSummaryMini from './totalsummerymini';
import OrderSummary from './ordersummary';
import OptForm from './optform';
import CheckoutButton from './checkoutbutton';

export default class Right extends Component {
    constructor(props) {
        super(props);
        this.state = {
            coupon: '',
            note: '',
            terms: (!!this.props.terms) || false,
            newsletter: (!!this.props.newsletter) || false
        }
    }

    componentDidMount() {
        var _this = this;
    }

    render() {

        return (
            <div className="xs-12-cl lg-6-cl xl-5-cl">
                <div className="right" style={{marginTop: this.state.scroll}}>
                    <ProductForm onSubmit={this.props.onSubmit} total_quantity={this.props.total_quantity}
                                 increase={this.props.increase} decrease={this.props.decrease}
                                 changeAmount={this.props.changeAmount} products={this.props.products}
                                 shipping_methods={this.props.shipping_methods} tax_rate={this.props.tax_rate}/>
                    {window.innerWidth < 991 && <TotalSummaryMini/>}
                    {window.innerWidth > 991 && (
                        <React.Fragment>
                            <OrderSummary onSubmit={this.props.onSubmit} total_quantity={this.props.total_quantity}
                                          products={this.props.products}
                                          shipping_methods={this.props.shipping_methods}/>
                            <OptForm onSubmit={this.props.onSubmit} total_quantity={this.props.total_quantity}
                                     products={this.props.products} shipping_methods={this.props.shipping_methods}/>

                            <div className="ButtonForm "><CheckoutButton onClick={this.props.onSubmit}/></div>
                        </React.Fragment>
                    )}
                </div>
            </div>
        );
    }
}