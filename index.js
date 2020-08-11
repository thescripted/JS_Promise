const PENDING = 0;
const REJECTED = 1;
const RESOLVED = 2;

class R {
  state = null;
  value = null;

  fulfill(value) {
    if (this.state !== PENDING || value !== null) return;

    this.state = RESOLVED;
    this.value = value;
    console.log('Resolved: ', this.value);
  }

  reject(reason) {
    if (this.state !== PENDING || value !== null) return;

    this.state = REJECTED;
    this.value = reason;
    console.log('Rejected: ', this.value);
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
    if (typeof onFulfilled === 'function') {
      if (this.state === RESOLVED) {
        onFulfilled(value);
        return;
      }
    }

    if (typeof onRejected === 'function') {
      if (this.state === REJECTED) {
        onRejected(value);
        return;
      }
    }
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
    res(45);
  }, 1000);
};

const apply = new R(func);
console.log(apply.fulfill(3));
