import React, { Component } from 'react';
import MenuItem from './elements/MenuItem';
import MenuList from './elements/MenuList';

class DesktopMenu extends Component {
    constructor(props) {
        super(props);
        this.state = { 
            fetchUrl: `${window.location.origin}/wp-json/wp/v2/menu/main-menu/?lang=${document.documentElement.lang.substring(0, 2)}`,
            menuData: [],
            menuDataOrdered: [],
            activeUrl: '/',
        };
   }

    componentDidMount() {
        const {
            fetchUrl,
        } = this.state;

        const url = window.location.pathname;
        const pathArray = url.split( '/' );
        const urlArrays = [];
        for (let i = 0; i < pathArray.length; i++) {
            if (pathArray[i].length !== 0) {
                urlArrays.push(pathArray[i]);
            }
        }
        const activeUrl = urlArrays[urlArrays.length - 1] !== undefined ? urlArrays[urlArrays.length - 1] : '/';
        
        fetch(fetchUrl)
        .then(function(response) {
            return response.json();
        })
        .then((menuitems) => {
            const menuItemSorted = menuitems.sort((a, b) => parseInt(a.menu_order) - parseInt(b.menu_order))

            this.setState({
                menuData: menuItemSorted,
            });
        })
        .then(() => {
            this.getMenuData(data => {
                this.setState({
                    menuDataOrdered: data,
                    activeUrl: activeUrl,
                });
            });
        });
    }

    getChildsData(parent, data) {
        let allChildrens = [];

        data.map(item => {
            if (parseInt(item.menu_item_parent) === parent.ID) {
                let result = this.getChildsData(item, data)
                if (result.length > 0) {
                    item.children = result;
                }
                allChildrens.push(item);
            }
        });

        return allChildrens;

    }

    getMenuData(callback) {
        const {
            menuData,
        } = this.state;

        let menuDataOrdered = [];

        menuData.map((menuItem) => {
            if (parseInt(menuItem.menu_item_parent) === 0) {
                menuDataOrdered.push(menuItem);
                const returnedChilds = this.getChildsData(menuItem, menuData);
                if (returnedChilds.length > 0) {  
                    menuItem.children = returnedChilds;
                }
                
            }
        });
        
        callback( menuDataOrdered );
    }

    render() { 
        const {
            menuDataOrdered,
            activeUrl,
        } = this.state;
        
        const renderedItems = menuDataOrdered.map((menuItem, index) => {
            const {
                title,
                url,
                children,
                classes,
            } = menuItem;
            const itemUrl = menuItem.url;
            const pathArray = itemUrl.split( '/' );
            const urlArrays = [];
            for (let i = 0; i < pathArray.length; i++) {
                if (pathArray[i].length !== 0) {
                    urlArrays.push(pathArray[i]);
                }
            }
            const menuItemUrl = urlArrays[urlArrays.length - 1] !== undefined ? urlArrays[urlArrays.length - 1] : '/';
            if (menuItemUrl === activeUrl) {
                classes.unshift("active");
            }

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
        });

        return (
            <ul className="root-menu desktop">
                { renderedItems }
            </ul>
        );
    }
}
 
export default  DesktopMenu;