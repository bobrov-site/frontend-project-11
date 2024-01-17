const renderError = (state, message) => {
  const { elements } = state;
  if (message) {
    elements.feedback.innerHTML = message;
    elements.input.classList.add('is-invalid');
  } else {
    elements.feedback.innerHTML = '';
    elements.input.classList.remove('is-invalid');
  }
};

export default (state) => (path, value) => {
  if (path === 'feeds') {
    console.log(state);
  }
  if (path === 'form.error') {
    renderError(state, value);
  }
};
