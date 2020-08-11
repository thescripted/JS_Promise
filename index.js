const PENDING = 0;
const REJECTED = 1;
const RESOLVED = 2;

class R {
  state = null;
  value = null;
  handler = []; // Contains onFulfilled & onRejected functions to call.

  fulfill(value) {
    console.log(this);
    if (this.state !== PENDING || this.value !== null) return;

    this.state = RESOLVED;
    if (typeof value === 'function') return; //TODO: Handle Promises as input.
    this.value = value;

    this.handler.forEach(this.handle.bind(this));
    this.handler = null; // Empty the array to avoid callbacks.
    // On Fulfilled, Call the handler to execute the functions needed to execute.
    // Pass in the value, as needed.
  }

  handle(handler) {
    if (this.state === RESOLVED && typeof handler.onFulfilled === 'function') {
      handler.onFulfilled(this.value);
    }

    if (this.state === REJECTED && typeof handler.onFulfilled === 'function') {
      handler.onRejected(this.value);
    }
  }

  reject(reason) {
    if (this.state !== PENDING || this.value !== null) return;

    this.state = REJECTED;
    this.value = reason;
  }

  /**
   * A method to access the promise current or eventual value.
   * If the promise is resolved, onFulfilled will be called. If the promise is rejected, onRejected will be called.
   *
   * @param {Function} onFulfilled
   * @param {Function} onRejected
   * @return {R}
   */
  then(onFulfilled, onRejected) {
    if (onFulfilled && typeof onFulfilled !== 'function') return;
    if (onRejected && typeof onRejected !== 'function') return;

    // Push to handler until state is resolved. Fulfill will execute functions.
    if (this.state == PENDING) {
      // Timeout ensures we are always asynchronous
      setTimeout(function () {
        this.handler.push({
          onFulfilled: onFulfilled,
          onRejected: onRejected
        });
      }, 0);
    }
    // If the state is already resolved, execute any res/rej then methods.
    if (this.state === RESOLVED && this.handler.length === 0) {
      onFulfilled(this.value); // State is already resolved & no more thenables. Execute your function.
      return;
    }

    if (this.state === REJECTED && this.handler.length === 0) {
      onRejected(this.value);
      return;
    }
    return new R(function (resolve, reject) {
      // `then` returns a promise, which must be resolved/rejected.
      resolve(5);
    });
  }

  constructor(fn) {
    this.state = PENDING;

    try {
      fn(this.fulfill.bind(this), this.reject.bind(this));
    } catch (error) {
      this.reject(error);
    }
  }
}

const func = function (res, rej) {
  setTimeout(function () {
    res(50);
  }, 2000);
};

const promise = new R(func);
promise.then(res => console.log('Resolved: ', res));
