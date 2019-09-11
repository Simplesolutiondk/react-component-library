import React, {Component} from 'react';
import _ from 'lodash';
import {withApi} from '../withapi';
import {
    SearchOutputExact,
    SearchOutputClosests
}
    from './searchoutput';

class Search extends Component {
    constructor(props) {
        super(props);
        this.state = {
            searchActive: false,
            value: '',
            results: {},
            searchUrl: '',
        };

    // Create reference
    this.searchWrapperRef = React.createRef();
    this.searchButtonRef = React.createRef();

    // Debounce
    this.delayedCallback = _.debounce(this.handleFetchResults, 1000);

    //  Bindings
    this.handleClickOutside = this.handleClickOutside.bind(this);
  }

  componentDidMount() {
    document.addEventListener('mousedown', this.handleClickOutside);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutside);
  }

  handleClickOutside(event) {
    if (this.searchWrapperRef
        && !this.searchWrapperRef.current.contains(event.target)
        && !this.searchButtonRef.current.contains(event.target) ) {
      this.setState({searchActive: false});
    }
  }

  handleFetchResults(event) {

    let urls = [`${window.location.origin}/wp-json/custom/v1/search?args=${event.target.value}`];

    // Request
    let request = fetch(url);

    // Fetch request
    Promise.all(urls.map(url => fetch(url)))
    // map responses
      .then(responses => Promise.all(responses.map(response => response.json()))).then(json => {
      this.setState({results: json[0].objects});
    });
  }

  handleChange(event) {
    event.persist();
    this.delayedCallback(event);
  }

  handleToggleSearch() {
    this.setState({
      searchActive: !this.state.searchActive
    });
  }

  render() {

    const {searchActive, results} = this.state;

        let searchUrl = [`${window.location.origin}/search?args=${this.state.searchUrl}`];

        return <React.Fragment>
            <div className="search-wrapper" ref={this.searchWrapperRef} style={{
                display: (searchActive)
                    ? 'inline-block'
                    : 'none'
            }}>                <div className="search-wrapper-inner">
                    <div className="grid-container">
                        <input className="search-box" type="text" placeholder="Search"
                               onChange={(e) => this.handleChange(e)}/>
                    </div>
                </div>
                <div className="search-wrapper-results">
                    <div className="grid-container">
                        {
                            Object.keys(results).length > 0 && <div className="search-results">
                                {results.exact !== false &&
                                <SearchOutputExact item={results.exact}></SearchOutputExact>}
                                {results.closest.length !== 0 &&
                                <SearchOutputClosests items={results.closest}></SearchOutputClosests>}
                            </div>
                        }
                    </div>
                    <div className="search-wrapper-more-button">
                        <a href={searchUrl}
                           className="btn btn--primary">Se alle resultater</a>
                    </div>
                </div>
            </div>
            <div className="search-button-wrapper">
                <span ref={this.searchButtonRef} className="ico ico-search" onClick={(e) => this.handleToggleSearch()}></span>
            </div>
        </React.Fragment>
    }
}

export default withApi(Search);
