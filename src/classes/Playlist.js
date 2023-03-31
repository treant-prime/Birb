const Playlist = class {
  constructor(item) {
    this.title = item.snippet.title
    this.thumbnail = item.snippet.thumbnails.medium.url
    this.itemCount = item.contentDetails.itemCount
    this.id = item.id
  }

  // Playlist.prototype.fetchURL(nextPageToken)
  // fetchURL(nextPageToken) {
  //   const part = 'id,snippet,contentDetails'
  //   const itemPerPage = 50
  //   let url = `https://youtube.googleapis.com/youtube/v3/playlists?part=${part}&mine=true&maxResults=${itemPerPage}`
  //   if (nextPageToken) url = url + `&pageToken=${nextPageToken}`
  //   return url
  // }

  static fetchURL(nextPageToken) {
    const part = 'id,snippet,contentDetails'
    const itemPerPage = 50
    let url = `https://youtube.googleapis.com/youtube/v3/playlists?part=${part}&mine=true&maxResults=${itemPerPage}`
    if (nextPageToken) url = url + `&pageToken=${nextPageToken}`
    return url
  }
}

export { Playlist }
