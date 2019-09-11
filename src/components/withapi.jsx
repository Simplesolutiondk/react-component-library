import React, {Component} from 'react';

// Curried higher order component
export const withApi = (ChildComponent) => {
  return class withApi extends Component {
    handleApi(request, type = 'get') {
      return Api.get(request);
    }
    render() {
      return <ChildComponent api={(request) => this.handleApi(request)} {...this.props}/>
    }
  }
}