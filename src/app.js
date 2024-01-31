import onChange from 'on-change';
import axios from 'axios';
import * as yup from 'yup';
import i18next from 'i18next';
import view from './view.js';
import ru from './locales/ru.js';
import parse from './parse.js';
import buildUrl from './helpers/buildUrl.js';

const state = {
  form: {
    process: 'filling',
    error: '',
    isValid: true,
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

const axiosConfig = {
  timeout: 10000,
};

const generateSchema = () => {
  const urlsList = state.feeds.map((feed) => feed.url);
  return yup.object({
    url: yup.string().url('errorWrongLink').required('errorRequired').notOneOf(urlsList, 'errorNowUnique'),
  });
};

const checkForNewPosts = (watchedState, i18nextInstance) => {
  const { form, feeds } = watchedState;
  const promises = feeds.map((feed) => axios.get(buildUrl(feed.url), axiosConfig)
    .then((response) => response));
  const requests = Promise.all(promises);
  requests.then((responses) => {
    responses.forEach((response) => {
      const { posts } = parse(response.data.contents);
      const newPosts = posts
        .filter((post) => !watchedState.posts.some((item) => item.title === post.title));
      watchedState.posts.unshift(...newPosts);
    });
  }).catch((e) => {
    const message = e.message === 'Network Error' ? 'errorNetwork' : 'errorResourceNotValid';
    form.isValid = false;
    form.error = i18nextInstance.t(message);
    form.process = 'failed';
  });
  if (form.process !== 'failed') {
    console.log(form.process);
    setTimeout(() => checkForNewPosts(watchedState, i18nextInstance), 5000);
  }
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
  state.elements.input.focus();
  state.elements.form.addEventListener('submit', ((event) => {
    watchedState.form.process = 'processing';
    event.preventDefault();
    const url = state.elements.input.value;
    generateSchema().validate({ url }).then(() => {
      watchedState.form.error = '';
      watchedState.form.isValid = true;
      axios.get(buildUrl(url), axiosConfig)
        .then((response) => {
          const { feed, posts } = parse(response.data.contents);
          feed.id = state.feeds.length + 1;
          feed.url = url;
          watchedState.form.process = 'processed';
          watchedState.feeds.unshift(feed);
          watchedState.posts.unshift(...posts);
          checkForNewPosts(watchedState, i18nextInstance);
        })
        .catch((e) => {
          const message = e.message === 'Network Error' ? 'errorNetwork' : 'errorResourceNotValid';
          watchedState.form.isValid = false;
          watchedState.form.error = i18nextInstance.t(message);
          watchedState.form.process = 'failed';
        });
    })
      .catch((e) => {
        watchedState.form.isValid = false;
        watchedState.form.error = i18nextInstance.t(e.message);
        watchedState.form.process = 'failed';
      });
  }));
  state.elements.postsColumn.addEventListener('click', (event) => {
    const element = event.target;
    watchedState.openedPostId = '';
    watchedState.modal.isOpen = false;
    if (element.classList.contains('btn')) {
      const openedPost = state.posts.find((post) => post.id === Number(element.dataset.id));
      watchedState.seenPosts.unshift(openedPost);
      watchedState.openedPostId = Number(element.dataset.id);
      watchedState.modal.isOpen = true;
    }
  });
});
