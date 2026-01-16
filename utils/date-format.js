const formatDate = (dateStr) => {
  const date = new Date(dateStr);

  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

module.exports = formatDate;
