// match svSession to a valid 36 character session
export const svSessionRegxp = value => /^([a-zA-Z0-9_-]){36}$/.test(value);

// flatten nested json for farmer data
export function flattenJson (data) {
  var result = {}
  function recurse (num, prop) {
    if (Object(num) !== num) {
      result[prop] = num
    } else if (Array.isArray(num)) {
      for (var i = 0, l = num.length; i < l; i++) {
        recurse(num[i], prop /* + '[' + i + ']' */)
      }
      if (l === 0) {
        result[prop] = []
      }
    } else {
      var isEmpty = true
      for (var p in num) {
        isEmpty = false
        recurse(num[p], prop ? prop + '.' + p : p)
      }
      if (isEmpty && prop) {
        result[prop] = {}
      }
    }
  }
  recurse(data, '')
  return result
}

export function ConvertObjectKeysToUpperCase (obj) {
  var output = {}
  for (const i in obj) {
    if (Object.prototype.toString.apply(obj[i]) === '[object Object]') {
      output[i.toUpperCase()] = ConvertObjectKeysToUpperCase(obj[i])
    } else if (Object.prototype.toString.apply(obj[i]) === '[object Array]') {
      output[i.toUpperCase()] = []
      output[i.toUpperCase()].push(ConvertObjectKeysToUpperCase(obj[i][0]))
    } else {
      output[i.toUpperCase()] = obj[i]
    }
  }
  return output
}

export function replaceSpecialCharsInJson (value) {
  const replaceSlash = ',P!_1-'
  const replaceBackSlash = ',P!_2-'
  value = value.split('/').join(replaceSlash)
  return value.split('\\').join(replaceBackSlash)
}

export function goBack () {
  window.history.back()
}

/* Recursive function which finds an unidentified property in a nested object and changes it with the given value.
Returns the new object if such value is found */
export function changeUndefinedObjectProperty (property, value, object) {
  object.constructor === Object && Object.keys(object).forEach(key => {
    if (key === property && object[key] === undefined) {
      object[key] = value
      return object
    }
    changeUndefinedObjectProperty(property, value, object[key])
  })
  return object
}

/* Recursive function which finds a key with a given value in a nested object.
Returns the object that contains the key. Returns the core object if no such key-val combo is found. */
export function findObjInJSONbyKey (property, value, object) {
  object && object.constructor === Object && Object.keys(object).forEach(key => {
    if (key === property && object[key] === value) {
      return object
    }
    findObjInJSONbyKey(property, value, object[key])
  })
  return object
}

// Clone object sice mutating deep properties mutates original object
// Object.assign() does not work for deep properties
export function cloneObject (obj) {
  // in case of primitives
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  // date objects
  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }

  // handle Array
  if (Array.isArray(obj)) {
    var clonedArr = [];
    obj.forEach((element) => {
      clonedArr.push(cloneObject(element))
    });
    return clonedArr;
  }

  // lastly, handle objects
  let clonedObj = new obj.constructor();
  for (var prop in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, prop)) {
      clonedObj[prop] = cloneObject(obj[prop]);
    }
  }
  return clonedObj;
}

export function isValidArray (array, minNumberOfElements) {
  /** returns true if the variable passsed as the first parameter is an array and
  there are at least X number of elements in the array, where X is the second function parameter
  minNumberOfElements is an optional parameter if the function should check if the array
  contains any number of elements */
  if (minNumberOfElements) {
    return (array && array.constructor === Array && array.length >= minNumberOfElements)
  } else {
    return (array && array.constructor === Array)
  }
}

export function isValidObject (object, minNumberOfKeys) {
/** returns true if the variable passsed as the first parameter is an object and
  there are at least X number of keys in the object, where X is the second function parameter
  minNumberOfKeys is an optional parameter if the function should check if the object
  contains any number of elements */
  if (minNumberOfKeys) {
    return (object && object.constructor === Object && Object.keys(object).length >= minNumberOfKeys)
  } else {
    return (object && object.constructor === Object)
  }
}

/**
 * Check if two values are strings & have the same value (i.e. compare them)
 * 
 * The `localeCompare` method on the `String` interface returns `0` if the values are equal &
 * a negative (`-1` for example) or a positive number (`1` for example) if the first value is shorter or longer than the second one, respectively
 * 
 * @param {any} firstValue The first value to be checked & compared
 * @param {any} secondValue The second value to be checked & compared
 */
 export function strcmp (firstValue, secondValue) {
  // First, check if both of the values are strings
  if ((typeof firstValue === 'string' && typeof secondValue === 'string') || (firstValue instanceof String && secondValue instanceof String)) {
    // If both of the values are strings, compare them & return the result as a boolean value
    return firstValue.localeCompare(secondValue, undefined, { sensitivity: 'base' }) === 0 ? true : false
  } else {
    return false
  }
}

/**
 * Flattens a nested object
 * @param  {object} obj The object that needs to be flattened
 */
 export function flattenObject (obj) {
  const flattened = {}
  Object.keys(obj).forEach((key) => {
    if (strcmp(typeof obj[key], 'object') && obj[key] !== null) {
      Object.assign(flattened, flattenObject(obj[key]))
    } else {
      flattened[key] = obj[key]
    }
  })
  return flattened
}

export function errTolastError (state, action) {
  // replace action type name from / to _ so it can get the name of the global var
  const actionTypeName = action.type.replace('/', '_').split('_ERROR')[0]
  // get current redux key so it can be called
  const currentReduxKey = Object.keys(action.payload)[0]
  // call error and store to let
  const currentError = action.payload[currentReduxKey].message + ' for ' + currentReduxKey
  // return transformed data and set it to lastError, restore previous value if error
  return {...state, lastError: currentError, [currentReduxKey]: window[actionTypeName]}
}

export function prevReduxValueIfError (state, action) {
  // replace action type name from / to _ so it can be declared as a global var
  const actionTypeName = action.type.replace('/', '_')
  // get previous key redux name
  const prevReduxKeyName = Object.keys(action.payload)[1]
  // get previous key value (state[prevReduxKeyName]), and set it to a global window variable
  // with a dynamic name (the name of the action type) as to prevent var clash
  window[actionTypeName] = state[prevReduxKeyName]
  // return normal (merge) values without transformation
  return Object.assign({}, state, action.payload)
}
