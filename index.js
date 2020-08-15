const PENDING = 0;
const RESOLVED = 1;
const REJECTED = 2;

class R {
  _state = PENDING;
  _value;
  _queue = [];

  constructor(fn) {
    fn(this._resolve.bind(this), this._reject.bind(this));
  }

  _resolve(value) {
    if (this._state !== PENDING) {
      return;
    }

    this._state = RESOLVED;
    this._value = value;
    this._queue.forEach(this._handler.bind(this));
    this._queue = null;
  }

  _reject(reason) {
    if (this._state !== PENDING) {
      return;
    }

    this._state = REJECTED;
    this._value = reason;
    this._queue.forEach(this._handler.bind(this));
    this._queue = null;
  }

  _handler(queueitem) {
    let queueresponse = queueitem.onFulfilled(this._value);
    if (queueresponse && queueresponse instanceof R) {
      // If queue item is a promise, wait for promise to resolve before resolving the `then` that the queue item was attached to.
      queueresponse.then(function (value) {
        queueitem.newPromise._resolve(value);
      });
    } else {
      // Otherwise, immediately resolve the `then` promise.
      queueitem.newPromise._resolve(this._value);
    }
  }

  then(onFulfilled, onRejected) {
    if (this._state === RESOLVED) {
      onFulfilled(this._value);
      return;
    }

    let newPromise = new R(function (res, rej) {});

    this._queue.push({
      onFulfilled,
      onRejected,
      newPromise
    });
    return newPromise;
  }

  catch(reason) {}
}

// let response;

// let promise = new R(function (resolve) {
//   setTimeout(function () {
//     resolve();
//   }, 500);
// });

// promise
//   .then(function () {
//     return new R(function (resolve) {
//       setTimeout(function () {
//         resolve('hey there');
//       }, 1000);
//     });
//   })
//   .then(function (res) {
//     response = res;
//     console.log(response);
//   });

module.exports = R;
