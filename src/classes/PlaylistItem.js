const PlaylistItem = class {
  constructor(item) {
    this.id = item.id
    this.title = item.snippet.title
    this.description = item.snippet.description
    this.thumbnail = item.snippet.thumbnails?.default?.url
    this.position = item.snippet.position
    this.isNotAvailable = !item.snippet?.videoOwnerChannelId
    this.videoId = item.snippet.resourceId.videoId
  }

  static fetchURL(nextPageToken, playlistId) {
    const itemPerPage = 50
    const part = 'snippet,id,contentDetails,status'
    let url = `https://youtube.googleapis.com/youtube/v3/playlistItems?part=${part}&playlistId=${playlistId}&maxResults=${itemPerPage}`
    if (nextPageToken) url = url + `&pageToken=${nextPageToken}`
    return url
  }

  static deletetURL(playlistItemId) {
    return `https://youtube.googleapis.com/youtube/v3/playlistItems?id=${playlistItemId}`
  }

  static postUrl(playlistId) {
    const part = 'snippet'
    return `https://youtube.googleapis.com/youtube/v3/playlistItems?part=${part}&playlistId=${playlistId}`
  }
}

export { PlaylistItem }
