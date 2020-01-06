import React, {Component} from 'react';

class LoaderDots extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            mainclass: 'loading',
        };
    }

    componentWillMount() {
        this.setState({
            loading: false
        });
    }

    componentWillReceiveProps(props) {
        this.setState({
            loading: props.loading,
            mainclass: (props.mainclass != null) ? props.mainclass : 'loading'
        });
    }

    render() {
        if (this.state.loading) {
            return (
                <div className={this.state.mainclass}>
                    <span className="dots"/>
                    <span className="dots"/>
                    <span className="dots"/>
                </div>
            )
        } else {
            return null
        }
    }
}

export default LoaderDots;