# makinghistory
The new "Make history" player

# Configuration

Configuration object should be in _default.js_ file with these props:

```js
config = {
  remoteBaseURL: string, /* required, the website url (to display the audio page) */
  feedURL string, /* required */
  getPageCallback (page: JQuery): Function => void /* optional, do whatever you want (like remove unnecessary nodes etc.)  */,
  getContent(response: JQuery): Function => string, /* required, `page` is a jQuery element which hold the body of the page, should returns string */
}
```
