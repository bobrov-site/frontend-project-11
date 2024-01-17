const renderError = (state, message) => {
  const { elements } = state;
  if (message) {
    elements.feedback.innerHTML = message;
    elements.input.classList.add('is-invalid');
  } else {
    elements.feedback.innerHTML = '';
    elements.input.classList.remove('is-invalid');
    elements.input.value = '';
    elements.input.focus();
  }
};

export default (state) => (path, value) => {
  if (path === 'feeds') {
    state.elements.input.value = '';
    state.elements.input.focus();
  }
  if (path === 'form.error') {
    renderError(state, value);
  }
};
