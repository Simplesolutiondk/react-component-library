import React, {Component} from 'react';
import ReactDOM from 'react-dom';

export default class GDPR extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dropCookie: true,
      cookieDuration: 1825,
      cookieName: 'gdprPolicy',
      cookieValue: 'accepted',
      display: false,
      buttonText: reactLocale.string("accept_gdpr_policy")
    }
  }
    
  componentDidMount() {
    if (this.checkCookie() != this.state.cookieValue) {
      this.showPolicy();
    }
  }
    
  showPolicy() {
    this.setState({display: true});
  }

  acceptPolicy() {
    this.setState({display: false});
    this.createCookie();
  }

  createCookie() {
    const date = new Date();
    date.setTime(date.getTime() + (this.state.cookieDuration * 24 * 60 * 60 * 1000));
    const expires = `; expires=${date.toGMTString()}`;
    document.cookie = `${this.state.cookieName}=${this.state.cookieValue}${expires}; path=/`;
  }

  checkCookie() {
    const equalName = `${this.state.cookieName}=`;
    const cookieArray = document.cookie.split(';');
    for (let i = 0; i < cookieArray.length; i++) {
      let cookieValue = cookieArray[i];
      while (cookieValue.charAt(0) == ' ') 
        cookieValue = cookieValue.substring(1, cookieValue.length);
      if (cookieValue.indexOf(equalName) == 0) 
        return cookieValue.substring(equalName.length, cookieValue.length);
      }
    return null;
  }

  render() {  
    if (this.state.display) {
      return (
      <div className="cookie">
        <div className="container">
          <div className="row">
            <div className="col-sm-12">
              <div className="handle">
                <div className="message" dangerouslySetInnerHTML={{__html: gdpr_notice_text}}></div>
                <div className="accept btn btn-primary" onClick={() => this.acceptPolicy()}>
                  {this.state.buttonText}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      )
    }

    return '';
  }
}