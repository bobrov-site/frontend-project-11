import onChange from 'on-change';
import axios from 'axios';
import * as yup from 'yup';
import view from './view.js';

const state = {
  form: {
    process: 'filling',
    error: '',
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
    url: yup.string().url('Неверная ссылка').required('Обязательное поле').notOneOf(urlsList, 'RSS уже существует'),
  });
};

const watchedState = onChange(state, view(state));
export default (() => {
  state.elements.input.focus();
  state.elements.form.addEventListener('submit', ((event) => {
    event.preventDefault();
    const url = new FormData(event.target).get('url');
    generateSchema().validate({ url }).then(() => {
      watchedState.form.error = '';
      axios.get(url).then((response) => {
        watchedState.feeds.push({ url, data: response.data });
      })
        .catch((e) => {
          console.log(e, 'error axios');
        });
    })
      .catch((e) => {
        watchedState.form.error = e.message;
      });
  }));
});

// https://lorem-rss.hexlet.app/feed
// https://ru.hexlet.io/lessons.rss
