import React, {Component} from 'react';
import SubItemList from './elements/SubItemList';

/**
 * @constructor
 * @menuData {array} Received via props
 * @parentID {number} Received via props - The id of the parent element.
 */
export default class MegaMenu extends Component {
    constructor(props) {
        super(props);
        this.state = {
            classes: this.props.classes
        }
    }
    
    render() {
        const parentID = this.props.parentID;
        const subMenuLists = this.props.menuData.map(menuItem => {

            if ( parseInt(menuItem.menu_item_parent) === parentID ) {
                const subMenuList = this.props.menuData.map(subMenuItem => {
                    if ( parseInt(subMenuItem.menu_item_parent) === menuItem.ID || parseInt(menuItem.menu_item_parent) === parentID) {
                        return subMenuItem;
                    }
                });
                return <SubItemList activeUrl={ this.props.activeUrl } key={menuItem.ID} menuData={subMenuList} parentID={menuItem.ID}/>;
            }

        });

        const classesLowerCased = this.state.classes.map( e => e.toLowerCase());
        if ( classesLowerCased.includes("megamenu") ) {
            return (
                <div className={"MegaMenu "}>
                    <div className="MegaMenuList">
                        <div className="anim-drop-effect"></div>
                        <div>
                            { subMenuLists }
                        </div>
                    </div>
                </div>
            );
        }
        return (
            <div className="submenu">
                { subMenuLists }
            </div>
        );


    }
}
