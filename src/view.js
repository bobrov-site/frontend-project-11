const renderError = (state) => {
  const { elements, form } = state;
  if (!form.isValid) {
    elements.feedback.innerHTML = form.error;
    elements.input.classList.add('is-invalid');
  } else {
    elements.feedback.innerHTML = '';
    elements.input.classList.remove('is-invalid');
    elements.input.value = '';
    elements.input.focus();
  }
};

const disableSendButton = (state) => {
  const { elements, sendButton } = state;
  if (sendButton.isDisabled) {
    elements.sendButton.setAttribute('disabled', '');
  } else {
    elements.sendButton.removeAttribute('disabled');
  }
}

export default (state, i18nextInstance) => (path, value) => {
  if (path === 'feeds') {
    state.elements.input.value = '';
    state.elements.input.focus();
  }
  if (path === 'form.error') {
    renderError(state);
  }
  if (path === 'sendButton.isDisabled') {
    disableSendButton(state);
  }
};
