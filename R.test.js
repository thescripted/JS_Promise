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
      }, 100);
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
      }, 100);
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
      }, 100);
    });

    promise
      .then(function () {
        return new R(function (resolve) {
          setTimeout(function () {
            resolve(testing);
          }, 100);
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
      }, 100);
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
      }, 100);
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
      }, 100);
    });

    promise.then(function () {
      return new Promise(function (resolve) {
        setTimeout(function () {
          resolve(500);
        }, 100);
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
      }, 100);
    });

    promise
      .then(function () {
        return new R(function (resolve, reject) {
          setTimeout(function () {
            reject(testError);
          }, 100);
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
      }, 100);
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
          }, 100);
        });
      })
      .catch(function (value) {
        expect(value).toBe(testError);
        done();
      });
  });
});
