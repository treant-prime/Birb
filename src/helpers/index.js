function headers(token) {
  const bearer = "Bearer " + token;
  return {
    Authorization: bearer,
    Accept: "application/json",
  };
}

function sortByTitle(a, b) {
  if( a.title > b.title) {
    return 1;
  } else {
    return -1;
  }
}

export { headers, sortByTitle }
