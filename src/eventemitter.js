/**
 * Event Emitter, listener/broadcaster
 * @author Al Can - aca@simplesolution.dk
 *
 */
class EventEmitter {
  constructor() {
    this.listeners = {};
  }

  /**
   * Adds a listener function a specified event
   * @param {String} type
   * @param {Function} listener
   * @param {Boolean} once
   */
  addListener(type, listener, once) {
    this.listeners[type] = this.listeners[type] || [];
    this.listeners[type].push({ listener, once });
    return this;
  }

  /* Shorthand of _addListener, single */
  listen(type, listener) {
    return this.addListener(type, listener, false);
  }

  /* Shorthand of _addListener, single once */
  listenOnce(type, listener) {
    return this.addListener(type, listener, true);
  }

  /* Shorthand of _addListener, many */
  listenMany(types, listener) {
    return this.addListener(types, listener, true);
  }

  /**
   * Removes a listener function a specified event
   * @param {String} type
   * @param {Function} listener
   * @return {Object} Current instance the emitter
   */
  removeListener(type, listener) {
    // alias
    if (!this.listeners[type]) {
      return this;
    }
    if (!this.listeners[type].length) {
      return this;
    }
    if (!listener) {
      delete this.listeners[type];
      return this;
    }
    this.listeners[type] = this.listeners[type].filter(
      listeners => !(listeners.listener === listener),
    );
    return this;
  }

  /**
   * Broadcasts an event
   * @param {String} type
   * @param {Object} payload
   * @return {Object} instance of the emitter
   */
  broadcast(type, payload, usePromise) {
    // Promise based
    if (typeof usePromise !== 'undefined') {
      return new Promise(resolve => {
        const data = 'test';
        resolve(data);

        if (!this.listeners[type]) {
          return this;
        }

        this.listeners[type].forEach(listener => {
          resolve(listeners.listener.apply(this, [payload]));
          if (listener.listenOnce) {
            this.removeListener(type, listener.listener);
          }
        });

        return this;
      });
    }

    if (!this.listeners[type]) {
      return this;
    }

    this.listeners[type].forEach(listeners => {
      listeners.listener.apply(this, [payload]);

      if (listeners.listener.listenOnce) {
        this.removeListener(type, listeners.listener);
      }
    });
    return this;
  }
}

const Emitter = new EventEmitter();

export default Emitter;
