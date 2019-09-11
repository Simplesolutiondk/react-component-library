/* Start of helper/utilities functions */
function _toConsumableArray(arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
      arr2[i] = arr[i];
    }
    return arr2;
  }
  return Array.from(arr);
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value,
      enumerable: true,
      configurable: true,
      writable: true,
    });
  } else {
    obj[key] = value;
  }
  return obj;
}

/**
 * Shallow comparison for props and state.
 */
export function shallowCompare(nextState, nextProps) {
  return (
    !isEqualShallow(this.props, nextProps) ||
    !isEqualShallow(this.state, nextState)
  );
}

/**
 * Deep comparison for props and state.
 */
export function deepCompare(nextState, nextProps) {
  return !equals(this.props, nextProps) || !equals(this.state, nextState);
}

export function isEqualShallow(current, next) {
  if (current === next) {
    return true;
  }
  if (
    (typeof current === 'undefined' ? 'undefined' : _typeof(current)) !==
      'object' ||
    current === null ||
    (typeof next === 'undefined' ? 'undefined' : _typeof(next)) !== 'object' ||
    next === null
  ) {
    return false;
  }
  const keys_current = keys(current);
  const keys_next = keys(next);
  if (keys_current.length !== keys_next.length) {
    return false;
  }
  // Compare current and next keys
  const nextHasOwnProperty = Object.prototype.hasOwnProperty.bind(next);
  for (let i = 0; i < keys_current.length; i++) {
    if (
      !nextHasOwnProperty(keys_current[i]) ||
      current[keys_current[i]] !== next[keys_current[i]]
    ) {
      return false;
    }
  }
  return true;
}

/* Cart Utilities */
export function arrayMoveToEnd(array, fromIndex) {
  const element = array[fromIndex];
  const newArray = [].concat(
    _toConsumableArray(arrayRemoveElement(array, fromIndex)),
    [element],
  );
  return newArray;
}

export function arrayRemoveElement(array, index) {
  return [].concat(
    _toConsumableArray(array.slice(0, index)),
    _toConsumableArray(array.slice(index + 1, array.length)),
  );
}

// Most strict
export function is_int(value) {
  return parseFloat(value) == parseInt(value) && !isNaN(value);
}

/* Bindings */
export function increaseItem(props) {
  return props.increase(props.index);
}

export function decreaseItem(props) {
  return props.decrease(props.index);
}
