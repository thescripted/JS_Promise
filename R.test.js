var R = require('./index.js');

describe('Promise test suite', () => {
  it('should invoke executor function immediately', () => {
    let updatedarray = [1, 2, 3];
    let promise = new R(function () {
      updatedarray = [1, 2, 3, 4, 5, 6];
    });

    expect(updatedarray).toStrictEqual(Array.from([1, 2, 3, 4, 5, 6]));
  });

  it('should call resolution handler when promise is resolved', () => {
    let testing = 'hello';
    let promise = new R(function (resolve) {
      setTimeout(function () {
        resolve(testing);
      });
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
      }, 500);
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
      }, 500);
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
});
