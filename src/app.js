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
  loadingProcess: {
    process: 'loading',
  },
  elements: {
    form: document.querySelector('.rss-form'),
    input: document.getElementById('url-input'),
    feedback: document.querySelector('.feedback'),
    sendButton: document.querySelector('[type="submit"]'),
    feedsColumn: document.querySelector('.feeds'),
    postsColumn: document.querySelector('.posts'),
    modal: document.querySelector('.modal'),
    id: null,
    seenPosts: new Set(),
  },
  feeds: [],
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
  const { form, feeds, loadingProcess } = watchedState;
  loadingProcess.process = 'loading';
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
    loadingProcess.process = 'failed';
  });
  if (form.process !== 'failed') {
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
    event.preventDefault();
    watchedState.form.process = 'processing';
    const url = state.elements.input.value;
    generateSchema().validate({ url }).then(() => {
      watchedState.form.error = '';
      watchedState.form.isValid = true;
      watchedState.loadingProcess.process = 'loading';
      axios.get(buildUrl(url), axiosConfig)
        .then((response) => {
          const { feed, posts } = parse(response.data.contents);
          feed.id = state.feeds.length + 1;
          feed.url = url;
          watchedState.loadingProcess.process = 'succsess';
          watchedState.form.process = 'filling';
          watchedState.feeds.unshift(feed);
          watchedState.posts.unshift(...posts);
          checkForNewPosts(watchedState, i18nextInstance);
        })
        .catch((e) => {
          const message = e.message === 'Network Error' ? 'errorNetwork' : 'errorResourceNotValid';
          watchedState.form.isValid = false;
          watchedState.form.error = i18nextInstance.t(message);
          watchedState.loadingProcess.process = 'failed';
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
    watchedState.elements.id = null;
    if (element.classList.contains('btn')) {
      const openedPost = state.posts.find((post) => post.id === Number(element.dataset.id));
      watchedState.elements.id = Number(element.dataset.id);
      watchedState.elements.seenPosts.add(openedPost);
    }
  });
});
