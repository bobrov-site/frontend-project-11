import onChange from 'on-change';
import axios from 'axios';
import * as yup from 'yup';
import view from './view.js';
import i18next from 'i18next';
import resourses from './locales/index.js';

const state = {
  form: {
    process: 'filling',
    error: '',
    isValid: true,
  },
  elements: {
    form: document.querySelector('.rss-form'),
    input: document.getElementById('url-input'),
    feedback: document.querySelector('.feedback'),
  },
  feeds: [],
  posts: [],
  url: '',
};

const generateSchema = () => {
  const urlsList = state.feeds.map((feed) => feed.url);
  return yup.object({
    url: yup.string().url('errorWrongLink').required('errorRequired').notOneOf(urlsList, 'errorNowUnique'),
  });
};

const watchedState = onChange(state, view(state));

export default (() => {
  const i18nextInstance = i18next.createInstance();
  i18nextInstance.init({
    lng: 'ru',
    debug: true,
    resourses,
  });
  state.elements.input.focus();
  state.elements.form.addEventListener('submit', ((event) => {
    event.preventDefault();
    const url = new FormData(event.target).get('url');
    generateSchema().validate({ url }).then(() => {
      watchedState.form.isValid = true;
      watchedState.form.error = '';
      axios.get(url).then((response) => {
        watchedState.feeds.push({ url, data: response.data });
      })
        .catch((e) => {
          console.log(e, 'error axios');
        });
    })
      .catch((e) => {
        watchedState.form.isValid = false;
        watchedState.form.error = i18nextInstance.t(e.message);
      });
  }));
});

// https://lorem-rss.hexlet.app/feed
// https://ru.hexlet.io/lessons.rss
