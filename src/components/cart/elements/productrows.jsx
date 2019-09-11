import React, {Component} from 'react';
import ValidateError from './error/validate';
import {DecreaseCount, IncreaseCount} from './tools';
import AmountInput from './amountinput';
import ProductDelete from './productdelete';
import AsyncImage from '../../../elements/asyncimage';
import NumFormat from '../../../elements/utils/numformat';

export default class ProductRows extends Component {
    constructor(props) {
        super(props);
        this.state = {}

        // Bindings
        this.decode = this.decode.bind(this);
        this.handleStopLink = this.handleStopLink.bind(this);
    }

    decode(string) {
        return string.replace(/&#(\d+);/g, function (match, dec) {
            return String.fromCharCode(dec);
        });
    }

    handleStopLink(e) {
        e.preventDefault();
        window.stop();
    }

    render() {
        var _this = this;
        var list = this.props.products.map((item, index) => {

            let variations = '';

            if (item.producttype === "variable") {
                item.selectedAttribute.names.forEach((name) => {
                    if (name !== "undefined") {
                        variations += `<span>${name.name}: ${name.option}</span></br>`;
                    }
                });
            }

            // Ternary switch for tax handling
            var tax_calculate = 0.8;
            var image = (item.image != null) ? item.image : location.origin + "/images/shop/cache/placeholder-300x300.png";
            return (
                <div key={index} className="product-item">
                    <ProductDelete index={index}/>
                    <div className="image">
                        <a href={item.url}><AsyncImage src={image} alt={item.name}/></a>
                    </div>
                    <div className="handle">
                        <div className="name">{item.type == "product" ?
                            <a href={item.url} dangerouslySetInnerHTML={{__html: _this.decode(item.name)}}/> :
                            <a href="#" dangerouslySetInnerHTML={{__html: _this.decode(item.name)}}
                               onClick={this.handleStopLink} style={{cursor: "default"}}/>}
                            <div dangerouslySetInnerHTML={{__html: _this.decode(variations)}}></div>
                        </div>
                        {item.error == 1 &&
                        <ValidateError validateMessage={item.validation_message} visible={1} no_margin={true}
                                       type={item.error_type}/>}
                        {item.error == 1 ? <span className="outofstock text-danger">{item.error_message}</span> : null}
                        {(item.option) && <div className="model">{_this.decode(item.option)}</div>}
                        {item.type == "product" && <div className="quantity">
                            <DecreaseCount index={index} decrease={_this.props.decrease}/>
                            <AmountInput index={index} quantity={item.quantity}
                                         changeAmount={_this.props.changeAmount}/>
                            <IncreaseCount index={index} increase={_this.props.increase}/>
                        </div>}
                        <div className="price">
                            {(parseFloat(item.special) < parseFloat(item.price)) ?
                                <React.Fragment>
                                    <span className="old"><NumFormat number={parseFloat(item.price * tax_calculate)}/> DKK</span>
                                    <span className="active"><NumFormat
                                        number={parseFloat(item.special * tax_calculate)}/> DKK</span>
                                </React.Fragment>
                                : <span className="active"><NumFormat number={parseFloat(item.price * tax_calculate)}/> DKK</span>}
                        </div>
                    </div>
                </div>
            );
        });
        return (
            <div className="product-item-wrapper">
                {list}
            </div>
        );
    }
}
