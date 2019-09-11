import React, { Component } from 'react';
import MenuList from './MenuList';

class MenuItem extends Component {
    constructor(props) {
        super(props);
        this.state = { 
            
        }
    }

    render() { 
        const {
            url,
            title,
            classes,
            children,
        } = this.props;  
        let addClasses = "menuItem";
        
        classes.map(item => {
            addClasses = addClasses += ` ${item}`;
        });

        return(
            <li className={ addClasses }>
                <a href={ url }>
                    { title }
                </a>
                { this.props.children }
            </li>
        );
    }
}
 
export default MenuItem;