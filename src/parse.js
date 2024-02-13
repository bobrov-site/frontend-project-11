import * as _ from 'lodash';

const parse = (data) => {
  const error = {};
  const parser = new DOMParser();
  const document = parser.parseFromString(data, 'application/xml');
  const rss = document.querySelector('rss');
  if (!document.contains(rss)) {
    error.isParserError = true;
    return { error };
  }
  const feed = {};
  feed.title = rss.querySelector('title').textContent;
  feed.description = rss.querySelector('description').textContent;
  const items = document.querySelectorAll('item');
  const posts = Array.from(items).map((item) => {
    const post = {};
    const title = item.querySelector('title');
    const link = item.querySelector('link');
    const description = item.querySelector('description');
    post.title = title.textContent;
    post.link = link.textContent;
    post.description = description.textContent;
    post.id = _.uniqueId();
    return post;
  });
  return { feed, posts, error };
};

export default parse;
