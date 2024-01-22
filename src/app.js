import onChange from 'on-change';
import axios from 'axios';
import * as yup from 'yup';
import i18next from 'i18next';
import view from './view.js';
import ru from './locales/ru.js';
import parse from './parse.js';

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
  elements: {
    form: document.querySelector('.rss-form'),
    input: document.getElementById('url-input'),
    feedback: document.querySelector('.feedback'),
    sendButton: document.querySelector('[type="submit"]'),
    feedsColumn: document.querySelector('.feeds'),
    postsColumn: document.querySelector('.posts'),
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

const generateFeed = (parsedData, url, feedId) => {
  const feed = {};
  const id = feedId;
  const title = parsedData.querySelector('title');
  const description = parsedData.querySelector('description');
  feed.id = id;
  feed.url = url;
  feed.title = title.innerHTML.replace('<![CDATA[', '').replace(']]>', '');
  feed.description = description.innerHTML.replace('<![CDATA[', '').replace(']]>', '');
  return feed;
};

const generatePosts = (parsedData, feedId) => {
  const items = parsedData.querySelectorAll('item');
  const posts = Array.from(items).map((item) => {
    const post = {};
    const id = Date.now();
    const title = item.querySelector('title');
    const link = item.querySelector('link');
    const description = item.querySelector('description');
    const pubDate = item.querySelector('pubDate');
    post.title = title.innerHTML.replace('<![CDATA[', '').replace(']]>', '');
    post.link = link.innerHTML.replace('<![CDATA[', '').replace(']]>', '');
    post.description = description.innerHTML.replace('<![CDATA[', '').replace(']]>', '');
    post.pubDate = pubDate.innerHTML;
    post.id = id;
    post.feedId = feedId;
    return post;
  });
  return posts;
};

const checkForNewPosts = (state) => {
  const requests = state.feeds.map((feed) => {
    const response = axios.get(`https://allorigins.hexlet.app/get?url=${encodeURIComponent(feed.url)}`);
    response.catch((e) => console.log(e));
    return response;
  });
  const promise = Promise.all(requests);
  promise.then((responses) => {
    const newPosts = responses.map((response) => {
      const parsedData = parse(response.data.contents);
      console.log(state);
    })
  });
  setTimeout(() => checkForNewPosts(state), 5000);
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
    watchedState.form.process = 'filling';
    watchedState.sendButton.isDisabled = true;
    event.preventDefault();
    const url = new FormData(event.target).get('url');
    generateSchema().validate({ url }).then(() => {
      axios.get(`https://allorigins.hexlet.app/get?url=${encodeURIComponent(url)}`)
        .then((response) => {
          const parsedData = parse(response.data.contents);
          return parsedData;
        })
        .then((parsedData) => {
          const feedId = state.feeds.length + 1;
          const feed = generateFeed(parsedData, url, feedId);
          const posts = generatePosts(parsedData, feed.id);
          watchedState.form.isValid = true;
          watchedState.form.error = '';
          watchedState.form.process = 'processed';
          watchedState.sendButton.isDisabled = false;
          watchedState.feeds.unshift(feed);
          watchedState.posts.unshift(...posts);
          // loop begins here
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
});

// https://lorem-rss.hexlet.app/feed
// https://ru.hexlet.io/lessons.rss
