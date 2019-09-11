import React, {Component} from 'react';
import SubMenuItem from './SubMenuItem';

export default class SubItemList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            menuData: props.menuData,
        }
    }

    render() {
        const subMenu = this.state.menuData;
        const parentID = this.props.parentID;
        const subList = subMenu.map( item => {
            if (typeof item !== "undefined" && parseInt(item.menu_item_parent) === parentID || typeof item !== "undefined" && item.ID === parentID) {
                return <SubMenuItem activeUrl={ this.props.activeUrl } key={item.ID} id={item.ID} url={item.url} title={item.title} />
            }

        } );

        return (
            <ul className="subList">
                { subList }
            </ul>
        );
    }
}
