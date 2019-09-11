/**
 * Store, localstorage wrapper
 * @author Al Can - aca@simplesolution.dk
 */

const _extends = Object.assign || function (target) { 
    for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { 
        if (Object.prototype.hasOwnProperty.call(source, key)) { 
            target[key] = source[key]; 
        } 
        } 
    } 
    return target; 
};


export default class Store {
  /**
   * Creates an instance of store
   * @param storeId {String} - id to store items inside localStorage
   */
  constructor(storeId) {
    this.storeId = storeId;

    const initialState = this.get();
    if (!initialState) {
      this.set(cart_data);
    } else {
      this.validateVersion(initialState, cart_data);
    }
  }

  // Validator
  validateVersion(initialState, newState) {
    if (
      initialState.version != newState.version ||
      initialState.epay_merchant_number != newState.epay_merchant_number
    ) {
      storage.removeItem('cartAppState');
      window.location.reload();
    }
  }

  // Helper
  validate() {
    const _this = this;
    try {
      atob(storage.getItem(_this.storeId));
    } catch (ex) {
      return false;
    }
    return false;
  }

  // Setter
  set(data) {
    const store = _extends({}, this.get(), data);
    localStorage.setItem(this.storeId, this.encrypt(store, 'salt'));
  }

  // Getter
  get() {
    const store = localStorage.getItem(this.storeId);
    const data = this.decrypt(store, 'salt');
    return data;
  }

  // Encryptor
  encrypt(object, salt) {
    const stringified = JSON.stringify(object).split('');
    for (let i = 0, l = stringified.length; i < l; i++) {
      if (stringified[i] == '{') {
        stringified[i] = '}';
      } else if (stringified[i] == '}') {
        stringified[i] = '{';
      }
    }
    return btoa(encodeURI(salt + stringified.join('')));
  }

  // Decryptor
  decrypt(object, salt) {
    if (object == undefined) return;
    let decoded = decodeURI(atob(object));
    if (salt && decoded.indexOf(salt) != 0) return;
    decoded = decoded.substring(salt.length).split('');
    for (let i = 0, l = decoded.length; i < l; i++) {
      if (decoded[i] == '{') {
        decoded[i] = '}';
      } else if (decoded[i] == '}') {
        decoded[i] = '{';
      }
    }
    return JSON.parse(decoded.join(''));
  }
}
