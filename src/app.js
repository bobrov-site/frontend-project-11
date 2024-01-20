import onChange from 'on-change';
import axios from 'axios';
import * as yup from 'yup';
import i18next from 'i18next';
import view from './view.js';
import ru from './locales/ru.js';
import parse from './parse.js';

const state = {
  form: {
    process: 'filling',
    error: '',
    isValid: true,
  },
  sendButton: {
    isDisabled: false,
  },
  elements: {
    form: document.querySelector('.rss-form'),
    input: document.getElementById('url-input'),
    feedback: document.querySelector('.feedback'),
    sendButton: document.querySelector('[type="submit"]'),
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

const generateFeed = (parsedData) => {
  const feed = {};
  const id = Date.now();
  const title = parsedData.querySelector('title');
  const description = parsedData.querySelector('description');
  feed.id = id;
  feed.title = title.innerHTML.replace("<![CDATA[", "").replace("]]>", "")
  feed.description = description.innerHTML.replace("<![CDATA[", "").replace("]]>", "");
  return feed;
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
    watchedState.sendButton.isDisabled = true;
    event.preventDefault();
    const url = new FormData(event.target).get('url');
    generateSchema().validate({ url }).then(() => {
      watchedState.form.isValid = true;
      watchedState.form.error = '';
      axios.get(`https://allorigins.hexlet.app/get?url=${encodeURIComponent(url)}`)
        .then((response) => {
          const parsedData = parse(response.data.contents);
          return parsedData;
          // watchedState.feeds.push({ url, data: response.data });
        }).then((parsedData) => {
          watchedState.sendButton.isDisabled = false;
          const feed = generateFeed(parsedData);
          const posts = generatePosts(parsedData, feed.id);
        })
        .catch((e) => {
          watchedState.form.isValid = false;
          watchedState.sendButton.isDisabled = false;
          if (e.code === 'ERR_BAD_REQUEST') {
            watchedState.form.error = i18nextInstance.t(e.code);
          } else {
            watchedState.form.error = i18nextInstance.t(e.message);
          }
        });
    })
      .catch((e) => {
        watchedState.form.isValid = false;
        watchedState.sendButton.isDisabled = false;
        watchedState.form.error = i18nextInstance.t(e.message);
      });
  }));
});

// https://lorem-rss.hexlet.app/feed
// https://ru.hexlet.io/lessons.rss
