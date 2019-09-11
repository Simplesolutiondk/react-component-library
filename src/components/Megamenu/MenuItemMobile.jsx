import React, {Component} from 'react';
import IcoMoon from '../IcoMoon/index';
import SubMobileMenuList from "./elements/SubMobileMenuList";

export default class SubMenuItemMobile extends Component {
	constructor(props) {
		super(props);
		this.state = {
			id: props.id,
			url: props.url,
			title: props.title,
			showSubMenu: false,
			hasChildren: false,
		}
	}


	handleSubMenu(event) {
		const currentTarget = event.currentTarget;
		const currentTargetsHeight = currentTarget.childNodes[2].style.height;
		
		if (!this.state.showSubMenu) {
			this.setState({showSubMenu: true});
			currentTarget.childNodes[2].style.display = "block";
			currentTarget.style.marginBottom = currentTargetsHeight + "px";
		} else {
			this.setState({showSubMenu: false});
			currentTarget.childNodes[2].style.display = "none";
			currentTarget.style.marginBottom = "0";
		}
	}

	render() {
		const parentID = this.state.id;

		// Maps through the map data,
		// and returns the item we need for the submenu.
		const menuitems = this.props.menuData.map(menuItem => {

			// Checks if either menuitem is the same as parent or
			// if it's a subelement to the parent.
			if ( menuItem.ID === parentID ) {
				if ( parseInt(menuItem.menu_item_parent) === parentID && this.state.hasChildren !== true) {
					this.setState({ hasChildren: true });
				}
				return <li key={menuItem.ID} className="subitemParentElement">
					<a href={menuItem.url}>
						Gå til { menuItem.title }
					</a>
				</li>
			}

			if ( parseInt(menuItem.menu_item_parent) === parentID) {
				if ( parseInt(menuItem.menu_item_parent) === parentID && this.state.hasChildren !== true) {
					this.setState({ hasChildren: true });
				}
				return <li key={menuItem.ID} >
					<a href={menuItem.url}>
						{ menuItem.title }
					</a>
				</li>
			}

		});

		// Returns here, if it has children.
		if ( this.state.hasChildren ) {
			return (
				<React.Fragment>
					<li className="MobileMenuItem" key={this.state.id} onClick={event => { this.handleSubMenu(event) }}>
						<span>
							{this.state.title}
						</span>
						<IcoMoon icon={ this.state.showSubMenu ? "circle-up" : "circle-down"} />
						<ul className="subMobileMenu">
							{ menuitems }
						</ul>
					</li>
				</React.Fragment>
			);
		}

		// Return here, if it has no children
		return (
			<React.Fragment>
				<li className="MobileMenuItem" key={this.state.id} onClick={event => { this.handleSubMenu(event) }}>
					<a href={this.state.url} >
						{this.state.title}
					</a>
				</li>
			</React.Fragment>
		);
	}
}
