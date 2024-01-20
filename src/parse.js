const parse = (data) => {
    const parser = new DOMParser();
    const document = parser.parseFromString(data, 'application/xml');
    const rss = document.querySelector('rss');
    if (!document.contains(rss)) {
        throw new Error('errowResourceNotValid');
    }
    return rss;
}

export default parse;
