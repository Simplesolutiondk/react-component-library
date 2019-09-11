import React, { Component } from 'react';
import MenuItem from './MenuItem';

class MenuList extends Component {
    constructor(props) {
        super(props);
        this.state = {  }
    }
    render() {
        const {
            children,
        } = this.props;
        
        const renderedItems = children.map((menuItem, index) => {
            const {
                title,
                url,
                children,
                classes
            } = menuItem;
            if (children !== undefined) {
                
                return (
                    <MenuItem 
                        title={ title } 
                        url={ url }
                        classes={ classes }
                        key={index}
                    >
                        <MenuList children={ children } />
                    </MenuItem>
                );
            }
                return (
                    <MenuItem 
                        title={ title } 
                        url={ url }
                        classes={ classes }
                        key={index}
                    />
                );
        } );

        return ( 
            <ul className={ 'subList' }>
                { renderedItems }
            </ul>
         );
    }
}
 
export default MenuList;