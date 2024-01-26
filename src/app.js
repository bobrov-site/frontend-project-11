import onChange from 'on-change';
import axios from 'axios';
import * as yup from 'yup';
import i18next from 'i18next';
import * as bootstrap from 'bootstrap';
import view from './view.js';
import ru from './locales/ru.js';
import parse from './parse.js';
import buildUrl from './helpers/buildUrl.js';

// filling, processing, processed, failed

const state = {
  form: {
    process: 'filling',
    error: '',
    isValid: true,
  },
  sendButton: {
    isDisabled: false,
  },
  modal: {
    isOpen: false,
  },
  openedPostId: '',
  elements: {
    form: document.querySelector('.rss-form'),
    input: document.getElementById('url-input'),
    feedback: document.querySelector('.feedback'),
    sendButton: document.querySelector('[type="submit"]'),
    feedsColumn: document.querySelector('.feeds'),
    postsColumn: document.querySelector('.posts'),
    modal: document.querySelector('.modal'),
  },
  feeds: [],
  seenPosts: [],
  posts: [],
};

const generateSchema = () => {
  const urlsList = state.feeds.map((feed) => feed.url);
  return yup.object({
    url: yup.string().url('errorWrongLink').required('errorRequired').notOneOf(urlsList, 'errorNowUnique'),
  });
};

const checkForNewPosts = (watchedState) => {
  const promises = watchedState.feeds.map((feed) => axios.get(buildUrl(feed.url))
    .then((response) => response).catch((e) => console.log(e)));
  const requests = Promise.all(promises);
  requests.then((responses) => {
    responses.forEach((response) => {
      const { posts } = parse(response.data.contents);
      const newPosts = posts
        .filter((post) => !watchedState.posts.some((item) => item.title === post.title));
      watchedState.posts.unshift(...newPosts);
    });
  });
  setTimeout(() => checkForNewPosts(watchedState), 5000);
};

export default (() => {
  const i18nextInstance = i18next.createInstance();
  i18nextInstance.init({
    debug: true,
    lng: 'ru',
    resources: {
      ru,
    },
  });
  const watchedState = onChange(state, view(state, i18nextInstance));
  const myModal = new bootstrap.Modal(state.elements.modal);
  state.elements.input.focus();
  state.elements.form.addEventListener('submit', ((event) => {
    watchedState.form.process = 'filling';
    watchedState.sendButton.isDisabled = true;
    event.preventDefault();
    const url = new FormData(event.target).get('url');
    generateSchema().validate({ url }).then(() => {
      axios.get(buildUrl(url))
        .then((response) => {
          const { feed, posts } = parse(response.data.contents);
          feed.id = state.feeds.length + 1;
          feed.url = url;
          watchedState.form.isValid = true;
          watchedState.form.error = '';
          watchedState.form.process = 'processed';
          watchedState.sendButton.isDisabled = false;
          watchedState.feeds.unshift(feed);
          watchedState.posts.unshift(...posts);
          checkForNewPosts(watchedState);
        })
        .catch(() => {
          watchedState.form.isValid = false;
          watchedState.form.error = i18nextInstance.t('errorResourceNotValid');
          watchedState.form.process = 'failed';
          watchedState.sendButton.isDisabled = false;
        });
    })
      .catch((e) => {
        watchedState.form.isValid = false;
        watchedState.form.error = i18nextInstance.t(e.message);
        watchedState.form.process = 'failed';
        watchedState.sendButton.isDisabled = false;
      });
  }));
  state.elements.postsColumn.addEventListener('click', (event) => {
    const element = event.target;
    watchedState.openedPostId = '';
    watchedState.modal.isOpen = false;
    if (element.classList.contains('btn')) {
      watchedState.openedPostId = Number(element.dataset.id);
      watchedState.modal.isOpen = true;
      myModal.show();
    }
  });
});

// https://lorem-rss.hexlet.app/feed
// https://ru.hexlet.io/lessons.rss
