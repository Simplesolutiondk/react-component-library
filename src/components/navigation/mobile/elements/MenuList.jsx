import React, { Component, Fragment } from 'react';
import MenuItem from './MenuItem';

class MenuList extends Component {
    constructor(props) {
        super(props);
        this.state = {  }
    }
    render() {
        const {
            children,
            parent,
            visible,
        } = this.props;
        
        const renderedItems = children.map((menuItem, index) => {
            const {
                title,
                url,
                children,
                classes,
            } = menuItem;
            
            if (children !== undefined) {
                
                return (
                    <MenuItem 
                        title={ title } 
                        classes={ classes }
                        key={index}
                    >
                        <MenuList parent={ menuItem } children={ children } />
                    </MenuItem>
                );
            }
                return (
                    <Fragment key={index}>
                        <MenuItem 
                            title={ title } 
                            url={ url }
                            classes={ classes } 
                        />
                    </Fragment>
                );
        } );

        return ( 
            <ul className={ 'subList' } style={ { display: visible ? 'block' : 'none' } }>
                <MenuItem 
                    title={ `Go to ${parent.title}` } 
                    url={ parent.url }
                    classes={ parent.classes } 
                />
                { renderedItems }
            </ul>
         );
    }
}
 
export default MenuList;