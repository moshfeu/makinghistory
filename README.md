# Live version
http://makinghistory.smydesign.co.il

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

Also, You need a simple php server to run the _proxy.php_.
For localhost I'm using the [built-in php server](http://php.net/manual/en/features.commandline.webserver.php)
