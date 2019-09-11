// WP MENU API
// http://grathwol.localhost/wp-json/wp/v2/menu
import React, { Component } from 'react';
import MenuItem from './MenuItem';
import SubMenuItemMobile from './MenuItemMobile';
import IcoMoon from '../IcoMoon/index';

export default class Navigation extends Component {
	constructor(props) {
		super(props);
		this.state = {
			menuDataUrl: `${
				window.location.origin
			}/wp-json/wp/v2/menu/main-menu`,
			mobileMenuDataUrl: `${
				window.location.origin
			}/wp-json/wp/v2/menu/custom-links-menu`,
			menuData: [],
			mobileMenuData: [],
			showMobileMenu: false,
			activeUrl: null,
			windowWidth: document.documentElement.clientWidth,
			isSmallDevice: false,
		};

		this.handleFetchMenuData = this.handleFetchMenuData.bind(this);
	}

	/**
	 * @fetch
	 * This currently fetches all menu data from the WP Rest API
	 * /wp-json/wp/v2/menu
	 */
	handleFetchMenuData() {
		const { menuDataUrl, mobileMenuDataUrl } = this.state;
		const windowWidth = document.documentElement.clientWidth;
		const currentActiveUrl =
			window.location.origin + window.location.pathname;
		const lang = document.documentElement.lang;

		// Desktopmenu / Navigation
		fetch(`${menuDataUrl}/?lang=${lang.substring(0, 2)}`)
			.then(response => response.json())
			.then(data => {
				const dataSorted = data.sort(
					(a, b) => parseInt(a.menu_order) - parseInt(b.menu_order),
				);
				this.setState(
					{
						menuData: dataSorted,
						activeUrl: currentActiveUrl,
					},
					() => this.forceUpdate(),
				);
			});

		// Mobilemenu / Offcanvas
		const serviceRequest = fetch(
			`${mobileMenuDataUrl}/?lang=${lang.substring(0, 2)}`,
		).then(function(response) {
			return response.json();
		});

		const mainRequest = fetch(
			`${menuDataUrl}/?lang=${lang.substring(0, 2)}`,
		).then(function(response) {
			return response.json();
		});

		const combinedData = { mainRequest: {}, serviceRequest: {} };
		Promise.all([mainRequest, serviceRequest])
			.then(values => {
				combinedData['mainRequest'] = values[0];
				combinedData['serviceRequest'] = values[1];
				return combinedData;
			})
			.then(() => {
				let menuTempArr = [];
				const mainRequestOrdered = combinedData.mainRequest.sort(
					(a, b) => parseInt(a.menu_order) - parseInt(b.menu_order),
				);
				mainRequestOrdered.forEach(data => {
					menuTempArr.push(data);
				});
				combinedData.serviceRequest.forEach(data => {
					menuTempArr.push(data);
				});
				this.setState({
					mobileMenuData: menuTempArr,
				});
			});
	}

	componentDidMount() {
		this.handleFetchMenuData();
	}

	MobileMenuDisplayHandler() {
		const mobileUl = document.querySelector('.root-menu-mobile');
		const mobileUlClose = document.querySelector('.closeMenu');

		if (!this.state.showMobileMenu) {
			mobileUl.style.right = 0;
			mobileUlClose.style.left = 0;
			this.setState({ showMobileMenu: true });
		} else {
			mobileUl.style.right = '-100vw';
			mobileUlClose.style.left = '100vw';
			this.setState({ showMobileMenu: false });
		}
	}

	render() {
		const { menuData, mobileMenuData, activeUrl, windowWidth } = this.state;
		// const menuItemOrdered = menuData.sort(
		// 	(a, b) => parseInt(a.menu_order) - parseInt(b.menu_order),
		// );
		let menuDataRender;
		if (windowWidth <= 1023) {
			menuDataRender = mobileMenuData;
		} else {
			menuDataRender = menuData;
		}
		const MenuItems = menuDataRender.map((menuItem, index) => {
			if (
				menuItem.menu_item_parent === '0' ||
				menuItem.menu_item_parent === 0
			) {
				if (activeUrl === menuItem.url) {
					return (
						<MenuItem
							key={index}
							id={menuItem.ID}
							activeUrl={activeUrl}
							url={menuItem.url}
							title={menuItem.title}
							menuData={menuData}
							classes={menuItem.classes}
						/>
					);
				}
				return (
					<MenuItem
						key={index}
						id={menuItem.ID}
						url={menuItem.url}
						title={menuItem.title}
						menuData={menuData}
						classes={menuItem.classes}
					/>
				);
			}
		});

		/**
		 * Renders the root-level of menu items for mobile-menu
		 */
		const MenuMobileItems = menuDataRender.map((menuItem, index) => {
			if (
				menuItem.menu_item_parent === '0' ||
				menuItem.menu_item_parent === 0
			) {
				return (
					<SubMenuItemMobile
						key={index}
						id={menuItem.ID}
						url={menuItem.url}
						title={menuItem.title}
						menuData={menuData}
					/>
				);
			}
		});

		return (
			<React.Fragment>
				<div className="button-offcanvas">
					<IcoMoon
						className="icon-offcanvas burgermenu"
						icon="menu"
						onClick={this.MobileMenuDisplayHandler.bind(this)}
					/>
				</div>
				<ul className="root-menu-mobile">
					<div
						className="closeMenu"
						onClick={this.MobileMenuDisplayHandler.bind(this)}>
						<IcoMoon icon="cross" />
					</div>
					{MenuMobileItems}
				</ul>
				<ul className="root-menu">{MenuItems}</ul>
			</React.Fragment>
		);
	}
}
