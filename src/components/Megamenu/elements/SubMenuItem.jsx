import React, {Component} from 'react';

export default class SubMenuItem extends Component {
	constructor(props) {
		super(props);
	}

	render() {
		if ( this.props.activeUrl === this.props.url ) {
			return (
				<React.Fragment>
					<li className="subMenuItem active" key={this.props.id}>
						<a href={this.props.url}>
							{this.props.title}
						</a>
					</li>
				</React.Fragment>
			);
		}
		return (
			<React.Fragment>
				<li className="subMenuItem" key={this.props.id}>
					<a href={this.props.url}>
						{this.props.title}
					</a>
				</li>
			</React.Fragment>
		);
	}
}
