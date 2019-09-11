import React, {Component} from 'react';

class AsyncIframe extends Component {
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
        <iframe ref="iframe" {...this.props} onLoad={(e) => this.setState({loaded: true})} style={this.state.loaded ? {} : {display: 'none'}}/>
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

export default AsyncIframe;