import React, {Component} from 'react';
import SubMenuItem from './SubMenuItem';

export default class SubMobileMenuList extends Component {
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
				return <SubMenuItem id={item.ID} url={item.url} title={item.title} />
			}

		} );

		const subUl = subMenu.map( menuItem => {
			if ( parseInt(menuItem.menu_item_parent) === parentID ) {

			}
		});



		return (
			<ul className="subMobileList">

			</ul>
		);
	}
}
