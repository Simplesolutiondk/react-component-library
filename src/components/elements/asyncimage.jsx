import React, {Component} from 'react';

export default class AsyncImage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
    };
  }

  componentWillMount() {
    this.setState({
      loaded: false
    });
  }

  render() {
    return (
      <React.Fragment>
        <img {...this.props} onLoad={(e) => this.setState({loaded: true})} style={this.state.loaded ? {} : {display: 'none'}}/>
        {!this.state.loaded && (
          <div className="loading">
            <span className="dots"/>
            <span className="dots"/>
            <span className="dots"/>
          </div>
        )}
      </React.Fragment>
    )
  }
}