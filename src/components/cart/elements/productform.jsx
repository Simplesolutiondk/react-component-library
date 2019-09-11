import React, {Component} from 'react';
import ProductRows from './productrows';

export default class ProductForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            mounted: false,
            scroll: 0
        }
        
        // Bindings
        this.handleScrollEvent = this.handleScrollEvent.bind(this);
    }

    componentDidMount() {
        var _this = this;
        if (window.innerWidth >= 991) {
            window.addEventListener('scroll', this.handleScrollEvent);
        }
        // onInitProductForm
        Emitter.listen('onInitProductForm', function(props) {
            return _this.setState({mounted: true});
        });
    }

    handleScrollEvent(event) {
        var scrollTop = event.target.body.scrollTop;
        var height = event.target.body.clientHeight;
        if (scrollTop > 0 && scrollTop < height && scrollTop <= 440) {
            this.setState({scroll: scrollTop});
        } else if (scrollTop >= 440) {
            this.setState({scroll: 440});
        } else {
            this.setState({scroll: 0});
        }
    }

    render() {
        if (!this.state.mounted) return null;
        
        return (
            <div className="app-cart-productform " style={{"marginTop" : this.state.scroll}}>
                <form onSubmit={this.props.onSubmit}>
                    <h5 className="visible-first"><span className="count">{this.props.total_quantity}</span>{reactLocale.string("cart_product_overview")}</h5>
                    <div id="products">
                        <ProductRows products={this.props.products} increase={this.props.increase} decrease={this.props.decrease} changeAmount={this.props.changeAmount} tax_rate={this.props.tax_rate}/>
                    </div>
                </form>
            </div>
        );
    }
}