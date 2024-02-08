import * as _ from 'lodash';

const parse = (data) => {
  const parser = new DOMParser();
  const document = parser.parseFromString(data, 'application/xml');
  const rss = document.querySelector('rss');
  if (!document.contains(rss)) {
    throw new Error('Rss not valid');
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
    post.id = Number(_.uniqueId());
    return post;
  });
  return { feed, posts };
};

export default parse;
