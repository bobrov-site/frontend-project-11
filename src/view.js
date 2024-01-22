const renderError = (state) => {
  const { elements, form } = state;
  elements.feedback.innerHTML = form.error;
  elements.feedback.classList.add('text-danger');
  elements.input.classList.add('is-invalid');
};

const renderFeedback = (state, i18nextInstance) => {
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

const createContentCard = (title) => {
  const card = document.createElement('div');
  const cardBody = document.createElement('div');
  const cardTitle = document.createElement('h2');
  const cardList = document.createElement('ul');
  card.classList.add('card', 'border-0');
  cardBody.classList.add('card-body');
  cardTitle.classList.add('card-title');
  cardList.classList.add('list-group');
  cardTitle.innerHTML = title;
  card.append(cardBody, cardList);
  cardBody.append(cardTitle);
  return card;
};

const renderColumnFeed = (state, i18nextInstance) => {
  const { elements, feeds } = state;
  if (!elements.feedsColumn.hasChildNodes()) {
    const card = createContentCard(i18nextInstance.t('feedsTitle'));
    elements.feedsColumn.append(card);
  }
  const card = elements.feedsColumn.querySelector('.card');
  const list = card.querySelector('ul');
  // TODO вопрос по оптимазици, можно ли так делать, и как лучше сделать, чтобы добавлять
  // по одной единицы элементов, вместо нескольких?
  list.innerHTML = '';
  const items = feeds.map((feed) => {
    const item = document.createElement('li');
    const title = document.createElement('h3');
    const description = document.createElement('p');
    description.classList.add('m-0', 'small', 'text-black-50');
    item.classList.add('list-group-item', 'border-0', 'border-end-0');
    title.classList.add('h6', 'm-0');
    title.innerHTML = feed.title;
    description.innerHTML = feed.description;
    item.append(title, description);
    return item;
  });
  list.append(...items);
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
  if (path === 'feeds') {
    renderColumnFeed(state, i18nextInstance);
  }
  if (path === 'sendButton.isDisabled') {
    disableSendButton(state);
  }
};
