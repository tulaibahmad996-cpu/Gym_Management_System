exports.buildPagination = ({ page = 1, limit = 10 }) => {
  const take = parseInt(limit, 10) > 0 ? parseInt(limit, 10) : 10;
  const skip = (parseInt(page, 10) > 1 ? parseInt(page, 10) - 1 : 0) * take;
  return { take, skip };
};
