var R = require('./index.js');

describe('Promise test suite', () => {
  it('should invoke executor function immediately', () => {
    let updatedarray = [1, 2, 3];
    let promise = new R(function () {
      updatedarray = [1, 2, 3, 4, 5, 6];
    });

    expect(updatedarray).toStrictEqual([1, 2, 3, 4, 5, 6]);
  });

  it('should call resolution handler when promise is resolved', () => {
    let testing = 'hello';
    let promise = new R(function (resolve) {
      setTimeout(function () {
        resolve(testing);
      }, 20);
    });

    promise.then(res => {
      expect(res).toBe(testing);
    });
  });

  it('should support many resolution handlers', done => {
    let testing = 'hello';
    let promise = new R(function (resolve) {
      setTimeout(function () {
        resolve(testing);
      }, 20);
    });

    promise.then(res => {
      expect(res).toBe(testing);
    });

    promise.then(res => {
      expect(res).toBe(testing);
    });

    promise.then(res => {
      expect(res).toBe(testing);
      done();
    });
  });

  it('should be able to chain multiple resolution handlers', done => {
    let testing = 'hello';
    let response;

    let promise = new R(function (resolve) {
      setTimeout(function () {
        resolve();
      }, 20);
    });

    promise
      .then(function () {
        return new R(function (resolve) {
          setTimeout(function () {
            resolve(testing);
          }, 20);
        });
      })
      .then(function (res) {
        response = res;
        expect(response).toBe(testing);
        done();
      });
  });

  it('calling resolve should have zero effects when run a second time', done => {
    let promise = new R(function (resolve) {
      setTimeout(function () {
        resolve(40);
        resolve(80);
      }, 20);
    });

    promise.then(function (res) {
      expect(res).toBe(40);
      done();
    });
  });

  it('should call rejection handler when promise is rejected', done => {
    let testError = 'Error!';
    let promise = new R(function (resolve, reject) {
      setTimeout(function () {
        reject(testError);
      }, 20);
    });

    promise.catch(function (error) {
      expect(error).toBe(testError);
      done();
    });
  });

  it('should pass rejection downstream', done => {
    let testError = 'Error!';
    let promise = new R(function (resolve, reject) {
      setTimeout(function () {
        reject(testError);
      }, 20);
    });

    promise.then(function () {
      return new Promise(function (resolve) {
        setTimeout(function () {
          resolve(500);
        }, 20);
      });
    });

    promise.catch(function (error) {
      expect(error).toBe(testError);
      done();
    });
  });

  it('should properly handle rejections from promises rejected in a `then` method', done => {
    let testError = 'error';
    let promise = new R(function (resolve, reject) {
      setTimeout(function () {
        resolve(500);
      }, 20);
    });

    promise
      .then(function () {
        return new R(function (resolve, reject) {
          setTimeout(function () {
            reject(testError);
          }, 20);
        });
      })
      .catch(function (error) {
        expect(error).toBe(testError);
        done();
      });
  });

  it('should catch synchronous errors in resolution handlers', done => {
    let testError = new Error('something is wrong');
    let promise = new R(function (resolve, reject) {
      setTimeout(function () {
        resolve(500);
      }, 20);
    });
    promise
      .then(function () {
        throw testError;
      })
      .catch(function (value) {
        expect(value).toBe(testError);
        done();
      });
  });

  it('should catch synchronous errors in execution handlers', done => {
    let testError = new Error('something is wrong');
    let promise = new R(function (resolve, reject) {
      throw testError;
    });
    promise
      .then(function () {
        return new R(function (resolve) {
          setTimeout(function () {
            resolve(50);
          }, 20);
        });
      })
      .catch(function (value) {
        expect(value).toBe(testError);
        done();
      });
  });
  it('should catch synchronous errors in rejection handlers', done => {
    let testError = new Error('something is wrong');
    let promise = new R(function (resolve, reject) {
      setTimeout(function () {
        resolve();
      }, 20);
    });

    promise
      .then(function () {
        throw new Error('some Error');
      })
      .catch(function () {
        throw testError;
      })
      .catch(function (error) {
        expect(error).toBe(testError);
        done();
      });
  });

  it('should allow promise chaining to work after `catch` ', done => {
    let testString = 'hello';
    let promise = new R(function (resolve, reject) {
      setTimeout(function () {
        resolve();
      }, 20);
    });

    promise
      .then(function () {
        throw new Error('Oh no!');
      })
      .catch(function () {
        return new R(function (resolve) {
          setTimeout(function () {
            resolve(testString);
          }, 20);
        });
      })
      .then(function (value) {
        expect(value).toBe(testString);
        done();
      });
  });

  it('should catch rejection returned from rejection promises in the rejection handler', done => {
    let testString = 'hello';
    let promise = new R(function (resolve, reject) {
      setTimeout(function () {
        resolve();
      }, 20);
    });

    promise
      .then(function () {
        throw new Error('Oh no!');
      })
      .catch(function () {
        return new R(function (resolve, reject) {
          setTimeout(function () {
            reject(testString);
          }, 20);
        });
      })
      .catch(function (value) {
        expect(value).toBe(testString);
        done();
      });
  });

  it('should treat the second argument of `then` as a rejection handler', done => {
    let testError = new Error('something is wrong');
    let promise = new R(function (resolve, reject) {
      setTimeout(function () {
        reject(testError);
      }, 20);
    });

    promise.then(
      function () {},
      function (error) {
        expect(error).toBe(testError);
        done();
      }
    );
  });

  it('should attach the second argument of then to the promise `then` is called on', done => {
    let testError = new Error('something is wrong');
    let didrun = false;
    let promise = new R(function (resolve, reject) {
      setTimeout(function () {
        resolve();
      }, 20);
    });
    promise
      .then(
        function () {
          return new R(function (resolve, reject) {
            setTimeout(function () {
              reject(testError);
            }, 20);
          });
        },
        function () {
          didrun = true; // This is not supposed to run...
        }
      )
      .catch(function (error) {
        expect(error).toBe(testError);
        expect(didrun).toBe(false);
        done();
      });
  });
});
