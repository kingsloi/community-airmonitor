export default () => {
  self.addEventListener("message", ({ data }) => { // eslint-disable-line no-unused-vars
    self.postMessage('hi!');
  });
}


