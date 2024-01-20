const renderError = (state) => {
  const { elements, form } = state;
  elements.feedback.innerHTML = form.error;
  elements.feedback.classList.add('text-danger');
  elements.input.classList.add('is-invalid');
};

const renderFeedback = (state, i18nextInstance) => {
  console.log(state);
  const { elements, form } = state;
  if (form.isValid) {
    elements.feedback.innerHTML = i18nextInstance.t('successAdd');
    elements.input.classList.remove('is-invalid');
    elements.feedback.classList.remove('text-danger');
    elements.feedback.classList.add('text-success');
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
};

export default (state, i18nextInstance) => (path, value) => {
  if (path === 'form.process') {
    if (value === 'failed') {
      renderError(state);
    }
    if (value === 'processed') {
      renderFeedback(state, i18nextInstance);
    }
  }
  if (path === 'sendButton.isDisabled') {
    disableSendButton(state);
  }
};
