import React, { Component } from 'react';
import IcoMoon from '../../IcoMoon/index';

import MenuItem from './elements/MenuItem';
import MenuList from './elements/MenuList';

class  MobileMenu extends Component {
    constructor(props) {
        super(props);
        this.state = { 
            fetchDesktopUrl: `${window.location.origin}/wp-json/wp/v2/menu/main-menu?lang=${document.documentElement.lang.substring(0, 2)}`,
            fetchMobileUrl: `${window.location.origin}/wp-json/wp/v2/menu/custom-links-menu?lang=${document.documentElement.lang.substring(0, 2)}`,
            menuData: [],
            menuDataOrdered: [],
            activeUrl: '/',
        };
    }

    componentDidMount() {
        const {
            fetchDesktopUrl,
            fetchMobileUrl,
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

        // Fetches MainMenu menu
        const mainRequest = fetch(fetchDesktopUrl)
            .then(function(response) {
			    return response.json();
		    });

        // Fetches ServiceMenu menu
        const serviceRequest = fetch(fetchMobileUrl)
            .then(function(response) {
                return response.json();
            });

		const combinedData = { mainRequest: {}, serviceRequest: {} };
		Promise.all([mainRequest, serviceRequest])
			.then(values => {
				combinedData["mainRequest"] = values[0];
				combinedData["serviceRequest"] = values[1];
				
				return combinedData;
			})
			.then(() => {
				let menuTemp = [];
				const mainRequestOrdered = combinedData.mainRequest.sort((a, b) => parseInt(a.menu_order) - parseInt(b.menu_order));
				mainRequestOrdered.forEach(data => {
					menuTemp.push(data);
                });
                const serviceRequestOrdered = combinedData.serviceRequest.sort((a, b) => parseInt(a.menu_order) - parseInt(b.menu_order));
				serviceRequestOrdered.forEach(data => {
					menuTemp.push(data);
				});
				
				this.setState({
					menuData: menuTemp,
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
        let ParentAdded = false;

        data.map(item => {
            if (parseInt(item.menu_item_parent) === parent.ID) {
                let result = this.getChildsData(item, data);
                if (result.length > 0) {
                    item.children = result;
                };

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

        menuData.map(menuItem => {
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

    handleDisplayMobileMenu() {
        this.props.handleDisplayMobileMenu();
    }

    handleVisiblityOnSubmenu(event) {
       if (event.style.display == "none") {
            event.style.display = "block";
       } else {
            event.style.display = "none";
       }
    }

    render() { 
        const {
            menuDataOrdered,
            activeUrl
        } = this.state;
        const {
            display,
        } = this.props;
        
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
                        classes={ classes }
                        key={index}
                        handleVisiblityOnSubmenu={ (event) => this.handleVisiblityOnSubmenu(event) }>
                        <MenuList parent={ menuItem } children={ children } />
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
            <ul 
                className="root-menu mobile"
                style={ {
                    top: display ? '70px' : '-100vw'
                } }
            >
                { renderedItems }
            </ul>
        );
    }
}
 
export default  MobileMenu;