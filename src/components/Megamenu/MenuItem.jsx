import React, { Component } from "react";
import MegaMenu from "./MegaMenu";
import SubMenuItem from "./elements/SubMenuItem";

/**
 * Menu Item for the MegaMenu
 * Expecting to receive following data:
 * @constructor
 * @id {string} Id of the menu item
 * @url {string} Url for the page to link to.
 * @title {string} Text for the menu item
 * @parentID {number} Id of the parent menu item
 * @menuData {array} Full array of menu data from the WP API
 */

export default class MenuItem extends Component {
	constructor(props) {
		super(props);
		this.state = {
			id: props.id,
			url: props.url,
			title: props.title,
			menuData: props.menuData,
			hasChildren: false,
			isAnimated: false
		};
	}

	componentDidMount() {
		this.handleChildrenStatus();
	}

	/**
	 * @handleSubMenu
	 * Handles mouseOver and MouseOut events on the menu items
	 * @event Used to find what menu item has been hovered over.
	 * @condition {string} Can either be 'open' or 'close', to determine
	 * if the submenu should be visible or not.
	 */

	handleSubMenu(event, condition) {
		const currentItem = event.currentTarget;
		const subMenu = currentItem.childNodes[1];
		const megaMenuList = currentItem.childNodes[1].childNodes[0];
		const activeItem = currentItem.childNodes[2];

		if (typeof subMenu !== "undefined" && subMenu.className.match(/MegaMenu/)) {
			// Megamenu is visible here

			if (condition === "open") {
				// Hovering over menuItem

				megaMenuList.style.left = currentItem.offsetLeft + "px";
				subMenu.style.display = "flex";
				currentItem.className = "menuItem has-children";

				if (currentItem.children[0].className !== "active") {
					currentItem.children[0].className = "temp-active";
					activeItem.className = "menuItem-anim";
				}
			} else {
				// No hover detected over menuItem

				subMenu.style.display = "none";

				if (currentItem.children[0].className == "temp-active") {
					currentItem.children[0].className = "";
					activeItem.className = "";
				}
			}
		} else {
			// No megamenu is visible here

			if (condition === "open") {
				// Hovering over menuItem

				if (currentItem.children[0].className !== "active") {
					// Not an active menuItem

					currentItem.children[0].className = "temp-active";
					currentItem.children[1].className = "menuItem-anim";
				}
			} else {
				// No hover detected over menuItem

				if (currentItem.children[0].className !== "active") {
					currentItem.children[0].className = "";
					currentItem.children[1].className = "";
				}
			}
		}
	} // End of: handleSubMenu();

	handleChildrenStatus() {
		let status = false;
		this.state.menuData.forEach(item => {
			if (parseInt(item.menu_item_parent) === this.state.id && this.state.hasChildren !== true) {
				status = true;
			}
		});

		this.setState({
			hasChildren: status
		});
	}

	render() {
		// Has megamenu
		if (this.state.hasChildren) {
			if (this.props.activeUrl === this.state.url) {
				return (
					<React.Fragment>
						<li className="menuItem has-children" key={this.state.id} onMouseOver={event => this.handleSubMenu(event, "open")} onMouseLeave={event => this.handleSubMenu(event, "close")}>
							<a className="active" href={this.state.url}>
								{this.state.title}
							</a>
							<MegaMenu activeUrl={this.props.activeUrl} menuData={this.state.menuData} parentID={this.state.id} classes={this.props.classes} />
							<div className="menuItem-anim" />
						</li>
					</React.Fragment>
				);
			}
			return (
				<React.Fragment>
					<li className="menuItem has-children" key={this.state.id} onMouseOver={event => this.handleSubMenu(event, "open")} onMouseLeave={event => this.handleSubMenu(event, "close")}>
						<a className="" href={this.state.url}>
							{this.state.title}
						</a>
						<MegaMenu activeUrl={this.props.activeUrl} menuData={this.state.menuData} parentID={this.state.id} classes={this.props.classes} />
						<div className="" />
					</li>
				</React.Fragment>
			);
		}

		// Does not have megamenu
		if (this.props.activeUrl === this.state.url) {
			return (
				<React.Fragment>
					<li className="menuItem" key={this.state.id} onMouseOver={event => this.handleSubMenu(event, "open")} onMouseOut={event => this.handleSubMenu(event, "close")}>
						<a className="active" href={this.state.url}>
							{this.state.title}
						</a>
						<div className="menuItem-anim" />
					</li>
				</React.Fragment>
			);
		}
		return (
			<React.Fragment>
				<li className={"menuItem"} key={this.state.id} onMouseOver={event => this.handleSubMenu(event, "open")} onMouseOut={event => this.handleSubMenu(event, "close")}>
					<a className="" href={this.state.url}>
						{this.state.title}
					</a>
					<div className="" />
				</li>
			</React.Fragment>
		);
	}
}
