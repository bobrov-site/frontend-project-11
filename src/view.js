const renderError = (state, message) => {
    if (message) {
        state.elements.feedback.innerHTML = message;
        state.elements.input.classList.add('is-invalid');
    }
    else {
        state.elements.feedback.innerHTML = '';
        state.elements.input.classList.remove('is-invalid');
    }
}

export default (state) => (path, value) => {
    if (path === 'form.error') {
        renderError(state, value);
    }
};
