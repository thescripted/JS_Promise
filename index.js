const PENDING = 0;
const FULFILLED = 1;
const REJECTED = 2;

class MyPromise {
  constructor(fn) {
    this.state = PENDING;
    this.value = null;
    this.handler = [];
    fn(this.resolve);
  }

  fulfill = _value => {
    this.state = FULFILLED;
    this.value = _value;
    this.handle(this.handler);
  };

  handle = callbacks => {
    for (let i = 0; i < callbacks.length; i++) {
      callbacks[i](this.value);
    }
  };

  reject = _error => {
    this.state = REJECTED;
    this.value = _error;
  };

  resolve = result => {
    this.fulfill(result);
  };

  then = onFulfilled => {
    if (this.state === PENDING) {
      this.handler.push(onFulfilled);
    }
    if (this.state === FULFILLED) {
      onFulfilled(value);
    }
  };
}

/* Example */
const q = new MyPromise(function (res) {
  setTimeout(function () {
    res(25);
  }, 1000);
});

q.then(value => console.log(value));
