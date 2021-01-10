module.exports = (arr, limit, currPage) => {
  const pageArr = arr.filter((page) => page.url !== currPage);
  pageArr.sort(() => {
    return 0.5 - Math.random();
  });
  return pageArr.slice(0, limit);
};