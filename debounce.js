// A Debouncer is a function that takes in an input function, and will only execute that function after a specified amount of time.
// If the debouncer is called before the specified time has elapsed, the Debouncer will reset the timer before executing.

function debouncer(fn, timeout) {
  let flag = false;
  setTimeout(function () {
    flag = true;
  }, timeout);
  return flag ? fn : '';
}

let debounceFunction = debouncer(function (name = 'Ben') {
  console.log(`hello, ${name} `);
}, 300);

debounceFunction();
