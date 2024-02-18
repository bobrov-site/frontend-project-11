import onChange from 'on-change';
import axios from 'axios';
import * as yup from 'yup';
import i18next from 'i18next';
import * as _ from 'lodash';
import view from './view.js';
import ru from './locales/ru.js';
import parse from './parse.js';
import buildUrl from './helpers.js';

const delay = 5000;

const elements = {
  form: document.querySelector('.rss-form'),
  input: document.getElementById('url-input'),
  feedback: document.querySelector('.feedback'),
  sendButton: document.querySelector('[type="submit"]'),
  feedsColumn: document.querySelector('.feeds'),
  postsColumn: document.querySelector('.posts'),
  modal: document.querySelector('.modal'),
};

const state = {
  form: {
    status: '',
    error: '',
    isValid: true,
  },
  loadingProcess: {
    status: '',
    error: '',
  },
  ui: {
    id: null,
    seenPosts: new Set(),
  },
  feeds: [],
  posts: [],
};

const axiosConfig = {
  timeout: 10000,
};

const extractLoadingErrorMessage = (error) => {
  if (error.isAxiosError) {
    return 'errorNetwork';
  }
  if (error.isValidationError) {
    return error.message;
  }
  if (error.isParserError) {
    return 'errorResourceNotValid';
  }
  return 'errorUnknown';
};

const checkForNewPosts = (watchedState) => {
  const { feeds, loadingProcess } = watchedState;
  loadingProcess.status = 'loading';
  const promises = feeds.map((feed) => axios.get(buildUrl(feed.url), axiosConfig)
    .then((response) => {
      const { posts } = parse(response.data.contents);
      const newPosts = posts
        .filter((post) => !watchedState.posts.some((item) => item.title === post.title));
      watchedState.posts.unshift(...newPosts);
    }));
  Promise.all(promises)
    .then(() => {
      setTimeout(() => checkForNewPosts(watchedState), delay);
    });
};

const loading = (watchedState, url) => {
  const { loadingProcess } = watchedState;
  loadingProcess.status = 'loading';
  axios.get(buildUrl(url), axiosConfig)
    .then((response) => {
      const { feed, posts, error } = parse(response.data.contents);
      if (Object.values(error).length !== 0) {
        loadingProcess.error = extractLoadingErrorMessage(error);
        loadingProcess.status = 'failed';
        return;
      }
      feed.id = _.uniqueId();
      feed.url = url;
      const relatedPosts = posts.map((post) => ({
        ...post,
        feedId: feed.id,
      }));
      loadingProcess.status = 'succsess';
      watchedState.feeds.unshift(feed);
      watchedState.posts.unshift(...relatedPosts);
    })
    .catch((e) => {
      loadingProcess.error = extractLoadingErrorMessage(e);
      loadingProcess.status = 'failed';
    });
};

const validate = (url, urls) => {
  const schema = yup.string().url('errorWrongLink').required('errorRequired').notOneOf(urls, 'errorNowUnique');
  return schema
    .validate(url)
    .then(() => { })
    .catch((e) => e);
};

export default (() => {
  const i18nextInstance = i18next.createInstance();
  i18nextInstance.init({
    debug: true,
    lng: 'ru',
    resources: {
      ru,
    },
  }).then(() => {
    const watchedState = onChange(state, view(state, i18nextInstance, elements));
    watchedState.form.status = 'filling';
    elements.form.addEventListener('submit', ((event) => {
      event.preventDefault();
      const data = new FormData(event.target);
      const url = data.get('url');
      watchedState.form.status = 'processing';
      const urls = watchedState.feeds.map((feed) => feed.url);
      validate(url, urls).then((error) => {
        if (error) {
          watchedState.form.isValid = false;
          watchedState.form.error = error.message;
          watchedState.form.status = 'failed';
          return;
        }
        watchedState.form.error = '';
        watchedState.form.isValid = true;
        loading(watchedState, url);
      });
    }));
    elements.postsColumn.addEventListener('click', (event) => {
      const { id } = event.target.dataset;
      if (id) {
        watchedState.ui.id = id;
        watchedState.ui.seenPosts.add(id);
      }
    });
    checkForNewPosts(watchedState);
  });
});
