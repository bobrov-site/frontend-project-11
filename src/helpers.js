const buildUrl = (originalUrl) => {
    const url = new URL('https://allorigins.hexlet.app/get');
    url.searchParams.set('disableCache', true);
    url.searchParams.set('url', originalUrl);
    return url.href;
};

export default buildUrl;
