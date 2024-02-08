import onChange from 'on-change';
import axios from 'axios';
import * as yup from 'yup';
import i18next from 'i18next';
import view from './view.js';
import ru from './locales/ru.js';
import parse from './parse.js';
import buildUrl from './helpers/buildUrl.js';

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
  switch (error) {
    case 'Network Error':
      return 'errorNetwork';
    case 'Rss not valid':
      return 'errorResourceNotValid';
    default:
      return 'errorUnknown';
  }
};

const generateSchema = () => {
  const urlsList = state.feeds.map((feed) => feed.url);
  return yup.string().url('errorWrongLink').required('errorRequired').notOneOf(urlsList, 'errorNowUnique');
};

const checkForNewPosts = (watchedState, i18nextInstance) => {
  const { feeds, loadingProcess } = watchedState;
  loadingProcess.status = 'loading';
  const promises = feeds.map((feed) => axios.get(buildUrl(feed.url), axiosConfig)
    .then((response) => response)
    .catch((e) => e));
  const requests = Promise.all(promises);
  requests
    .then((responses) => {
      responses.forEach((response) => {
        const { posts } = parse(response.data.contents);
        const newPosts = posts
          .filter((post) => !watchedState.posts.some((item) => item.title === post.title));
        watchedState.posts.unshift(...newPosts);
      });
    })
    .then(() => {
      setTimeout(() => checkForNewPosts(watchedState, i18nextInstance), 5000);
    })
    .catch((e) => {
      const message = extractLoadingErrorMessage(e.message);
      loadingProcess.error = i18nextInstance.t(message);
      loadingProcess.status = 'failed';
    });
};

const setFeedId = (post, feedId) => {
  const updatedPost = post;
  updatedPost.feedId = feedId;
  return post;
};

const loading = (watchedState, i18nextInstance, url) => {
  const { loadingProcess } = watchedState;
  loadingProcess.status = 'loading';
  axios.get(buildUrl(url), axiosConfig)
    .then((response) => {
      const { feed, posts } = parse(response.data.contents);
      feed.id = state.feeds.length + 1;
      feed.url = url;
      const relatedPosts = posts.map((post) => setFeedId(post, feed.id));
      loadingProcess.status = 'succsess';
      watchedState.feeds.unshift(feed);
      watchedState.posts.unshift(...relatedPosts);
      checkForNewPosts(watchedState, i18nextInstance);
    })
    .catch((e) => {
      const message = extractLoadingErrorMessage(e.message);
      loadingProcess.error = i18nextInstance.t(message);
      loadingProcess.status = 'failed';
    });
};

const validate = (url) => generateSchema().validate(url)
  .then(() => { })
  .catch((e) => e.message);

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
      watchedState.form.status = 'processing';
      const url = elements.input.value;
      validate(url).then((error) => {
        if (error) {
          watchedState.form.isValid = false;
          watchedState.form.error = i18nextInstance.t(error);
          watchedState.form.status = 'failed';
        } else {
          watchedState.form.error = '';
          watchedState.form.isValid = true;
          loading(watchedState, i18nextInstance, url);
        }
      });
    }));
    elements.postsColumn.addEventListener('click', (event) => {
      if (event.target.dataset.id) {
        const openedPost = state.posts.find((post) => post.id === Number(event.target.dataset.id));
        watchedState.ui.id = Number(event.target.dataset.id);
        watchedState.ui.seenPosts.add(openedPost);
      }
    });
  });
});
