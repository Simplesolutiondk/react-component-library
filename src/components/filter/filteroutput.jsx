import React, {Component} from 'react';

// Filter output component
export class FilterOutput extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: props.isLoading,
            products: props.products,
            cursor: 8,
            offset: 8
        }
    }

    componentDidMount() {
        window.addEventListener('scroll', this.handleOnScroll.bind(this));
    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this.handleOnScroll.bind(this));
    }

    /* Get derived state from a parent update */
    static getDerivedStateFromProps(props, state) {
        if (props.products !== state.products) {
            return {products: props.products, isLoading: props.isLoading};
        }
        return null;
    }

    /* Inifinite loader */
    handleInfiniteLoad() {
        const {cursor, offset} = this.state;

        setTimeout(() => {
            this.setState({cursor: cursor + offset});
        }, 500);
    }

    handleOnScroll() {
        const scrollTop = (document.documentElement && document.documentElement.scrollTop)
            || document.body.scrollTop;
        const scrollHeight = (document.documentElement && document.documentElement.scrollHeight)
            || document.body.scrollHeight;
        const clientHeight = document.documentElement.clientHeight
            || window.innerHeight;
        const scrolledToBottom = Math.ceil(scrollTop + clientHeight) >= scrollHeight;

        if (scrolledToBottom) {
            this.handleInfiniteLoad();
        }
    }

    render() {

        const {products, isLoading} = this.state;

        if (isLoading) {
            return <div>Loading products</div>;
        }

        if (products.length > 0) {

            const output = products.slice(0, this.state.cursor).map((product) => {

                const image = (product.images.length > 0)
                    ? product.images[0].src
                    : '';

                if (product.terms.product_brands[0] !== undefined) {
                    return <li key={product.id} className="copy sm-6-cl lg-3-cl product type-product">
                        <a href={product.permalink}
                           className="woocommerce-LoopProduct-link woocommerce-loop-product__link">
                            <img src={image} className="attachment-woocommerce_thumbnail size-woocommerce_thumbnail"/>
                            <div className="caption">
                                <span className="brand">{product.terms.product_brands[0].name}</span>
                                <h2 className="woocommerce-loop-product__title">{product.name}</h2>
                                <span className="extended-title">Extended leg</span>
                                <span className="sku">{product.sku}</span>
                                <span className="price" dangerouslySetInnerHTML={{
                                    __html: product.price_html
                                }}/>
                            </div>
                            <button data-quantity="1" className="button ">Shop nu
                            </button>
                        </a>
                    </li>;
                }
                return <li key={product.id} className="copy sm-6-cl lg-3-cl product type-product">
                    <a href={product.permalink}
                       className="woocommerce-LoopProduct-link woocommerce-loop-product__link">
                        <img src={image} className="attachment-woocommerce_thumbnail size-woocommerce_thumbnail"/>
                        <div className="caption">
                            <h2 className="woocommerce-loop-product__title">{product.name}</h2>
                            <span className="extended-title">Extended leg</span>
                            <span className="sku">{product.sku}</span>
                            <span className="price" dangerouslySetInnerHTML={{
                                __html: product.price_html
                            }}/>
                        </div>
                        <button data-quantity="1" className="button ">Shop nu
                        </button>
                    </a>
                </li>;
            });

            return <> {
                output
            }</>;
        }

        // No results
        return <>
            <div> No results</div>
        </>;
    };
}