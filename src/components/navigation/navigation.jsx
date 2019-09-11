import React, { Component, Fragment } from 'react';

import MobileMenu from './mobile/MobileMenu';
import DesktopMenu from './desktop/DesktopMenu';

export default class Navigation extends Component {
    constructor(props) {
        super(props);
        this.state = {
            DisplayMobileMenu: false,
         }
    }

    handleDisplayMobileMenu() {
        const {
            DisplayMobileMenu,
        } = this.state;

        this.setState({
            DisplayMobileMenu: DisplayMobileMenu ? false : true,
        });
    }

    render() {
        const {
            DisplayMobileMenu,
        } = this.state;
        if (document.documentElement.clientWidth <= 1024) {
			return (
                <Fragment>
                    <div className={DisplayMobileMenu ? 'button-offcanvas openned' : 'button-offcanvas'} onClick={() => this.handleDisplayMobileMenu()}>
                        <span></span><span></span><span></span>
                    </div>
                    <MobileMenu display={ DisplayMobileMenu } handleDisplayMobileMenu={this.handleDisplayMobileMenu.bind(this) }/>
                </Fragment>

            );
        }
        return <DesktopMenu />
    }
}