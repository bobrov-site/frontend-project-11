const renderError = (state) => {
  const { elements, form } = state;
  elements.feedback.textContent = form.error;
  elements.feedback.classList.add('text-danger');
  elements.input.classList.add('is-invalid');
};

const renderFeedback = (state, i18nextInstance) => {
  const { elements, form } = state;
  if (form.isValid) {
    elements.feedback.textContent = i18nextInstance.t('successAdd');
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
  cardTitle.textContent = title;
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
  list.innerHTML = '';
  const items = feeds.map((feed) => {
    const item = document.createElement('li');
    const title = document.createElement('h3');
    const description = document.createElement('p');
    description.classList.add('m-0', 'small', 'text-black-50');
    item.classList.add('list-group-item', 'border-0', 'border-end-0');
    title.classList.add('h6', 'm-0');
    title.textContent = feed.title;
    description.textContent = feed.description;
    item.append(title, description);
    return item;
  });
  list.append(...items);
};

const renderColumnPosts = (state, i18nextInstance) => {
  const { elements, posts } = state;
  if (!elements.postsColumn.hasChildNodes()) {
    const card = createContentCard(i18nextInstance.t('postsTitle'));
    elements.postsColumn.append(card);
  }
  const card = elements.postsColumn.querySelector('.card');
  const list = card.querySelector('ul');
  list.innerHTML = '';
  const items = posts.map((post) => {
    const item = document.createElement('li');
    const link = document.createElement('a');
    const button = document.createElement('button');
    button.textContent = i18nextInstance.t('postButton');
    button.setAttribute('type', 'button');
    button.dataset.id = post.id;
    button.dataset.bsToogle = 'modal';
    button.dataset.bsTarget = '#modalWindow';
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    item.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
    link.classList.add('fw-bold');
    link.href = post.link;
    link.textContent = post.title;
    link.setAttribute('target', '_blank');
    item.append(link, button);
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

const renderModal = (state) => {
  const { modal, elements } = state;
  if (modal.isOpen) {
    const container = elements.modal;
    const title = container.querySelector('.modal-title');
    const description = container.querySelector('.modal-body');
    const linkButton = container.querySelector('.modal-footer a');
    const openedPost = state.posts.find((post) => post.id === modal.postId);
    title.textContent = openedPost.title;
    description.textContent = openedPost.description;
    linkButton.setAttribute('href', openedPost.link);
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
  if (path === 'posts') {
    renderColumnPosts(state, i18nextInstance);
  }
  if (path === 'sendButton.isDisabled') {
    disableSendButton(state);
  }
  if (path === 'modal.isOpen') {
    renderModal(state);
  }
};
