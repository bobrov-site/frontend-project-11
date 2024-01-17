export default (state) => (path, value) => {
  console.log(state, 'view');
  console.log(path, value);
};
