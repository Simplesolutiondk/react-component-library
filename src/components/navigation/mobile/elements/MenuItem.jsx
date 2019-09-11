import React, { Component } from 'react';
import MenuList from './MenuList';

class MenuItem extends Component {
    constructor(props) {
        super(props);
        this.state = { 
            
        }
    }

    handleVisiblityOnSubmenu(event) {
        const siblingStyle = event.target.nextElementSibling.style.display;
        
        this.props.handleVisiblityOnSubmenu(event.target.nextElementSibling)
    }

    render() { 
        const {
            url,
            title,
            classes,
            children,
        } = this.props;    
        
        let addClasses = "menuItem";
        if (classes[0] !== "") {
            classes.map(item => {
                addClasses = addClasses += ` ${item}`;
            });
        }
    
        return(
            <li className={ addClasses } onClick={ (event) => this.handleVisiblityOnSubmenu(event) }>
                <a href={ url }>
                    { title }
                </a>
                { children }
            </li>
        );
    }
}
 
export default MenuItem;