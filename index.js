const PENDING = 0;
const RESOLVED = 1;
const REJECTED = 2;

class R {
  _state = PENDING;
  _value;
  _reason;
  _resolutionQueue = [];
  _rejectionQueue = [];

  constructor(fn) {
    try {
      fn(this._resolve.bind(this), this._reject.bind(this));
    } catch (error) {
      this._reject(error);
    }
  }

  /**
   * Transitions the state from PENDING TO RESOLVE, assigns `_value`, and  runs the resolution handler across the resolution queue.
   *
   * @param {Any} value
   */
  _resolve(value) {
    if (this._state !== PENDING) {
      return;
    }

    this._state = RESOLVED;
    this._value = value;
    this._resolutionQueue.forEach(this._resolutionHandler.bind(this));
    this._resolutionQueue = null; // This ensures the queue cannot be re-populated.
  }

  /**
   * Transitions the state from PENDING TO REJECTED, assigns `_reason`, and runs the rejection handler across the rejection queue.
   *
   * @param {Any} reason
   */
  _reject(reason) {
    if (this._state !== PENDING) {
      return;
    }

    this._state = REJECTED;
    this._reason = reason;
    this._rejectionQueue.forEach(this._rejectionHandler.bind(this));
    // Run through the resolution handler & reject all promises.
    this._resolutionQueue.forEach(
      function (resolution) {
        resolution.newPromise._reject(this._reason);
      }.bind(this)
    );
    this._rejectionQueue = null; // This ensures the queue cannot be re-populated.
  }

  /**
   * Invokes the callback function either from the resolution queue, or directly from `then`.
   *
   * @param {{onFulfilled: function | R, newPromise: R}} queueItem Contains both the callback function & the `then` promise.
   */
  _resolutionHandler(queueItem) {
    let queueResponse;
    try {
      queueResponse = queueItem.onFulfilled(this._value);
    } catch (error) {
      queueItem.newPromise._reject(error);
    }
    if (queueResponse && queueResponse instanceof R) {
      // If queue item is a promise, wait for promise to resolve before resolving the `then` that the queue item was attached to.
      queueResponse
        .then(function (value) {
          queueItem.newPromise._resolve(value);
        })
        .catch(function (error) {
          queueItem.newPromise._reject(error);
        });
    } else {
      // Otherwise, immediately resolve the `then` promise.
      queueItem.newPromise._resolve(this._value);
    }
  }

  /**
   * Invokes the callback function from the rejection queue, or directly from `catch`
   *
   * @param {{onError: function, newPromise: R}} queueItem Contains both the callback function & the `then` promise.
   */
  _rejectionHandler(queueItem) {
    let queueResponse = queueItem.onError(this._reason);
    if (queueResponse && queueResponse instanceof R) {
      queueResponse
        .then(function (reason) {
          queueItem.newPromise._reject(reason);
        })
        .catch(function (error) {
          queueItem.newPromise._reject(reason);
        });
    } else {
      queueItem.newPromise._reject(this.reason);
    }
  }

  /**
   * Takes a callback and pushes it to a resolution queue if the state is pending,
   * but will immediately invokes the callback if the state is not pending.
   * Returns a Promise (that can be resolved/rejected based on the callback).
   *
   * @param {Function|R} onFulfilled
   * @param {*} onRejected
   * @returns {R}
   */
  then(onFulfilled, onRejected) {
    let newPromise = new R(function (res, rej) {});

    if (this._state === RESOLVED) {
      this._resolutionHandler({
        onFulfilled,
        newPromise
      });
      return;
    }

    if (this._state === REJECTED) {
      newPromise._reject(this._reason);
    }

    this._resolutionQueue.push({
      onFulfilled,
      newPromise
    });
    return newPromise;
  }

  /**
   * Takes a callback function and pushes it into the rejection queue if the state is pending,
   * but will immediately invokes the callback if the state is not pending.
   *
   * @param {Function} onError
   */
  catch(onError) {
    let newPromise = new R(function (res, rej) {});
    if (this._state === REJECTED) {
      this._rejectionHandler({
        onError,
        newPromise
      });
      return;
    }

    this._rejectionQueue.push({
      onError,
      newPromise
    });
  }
}

module.exports = R;
