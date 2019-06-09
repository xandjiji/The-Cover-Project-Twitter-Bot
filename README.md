# The Cover Project Bot

A Twitter bot that periodically scraps a video game cover from [The Cover Project](http://www.thecoverproject.net/), compresses it and post it on Twitter.

<p align="center">
  <img src="https://i.imgur.com/aUDMbZg.png">
</p>

### Installation

  - You need [Node.js](https://nodejs.org/) to run this bot
  - You need the [node-fetch](https://www.npmjs.com/package/node-fetch) package to make HTTP requests
  - You need the [cheerio](https://www.npmjs.com/package/cheerio) package to parse through HTML data
  - You need the [sharp](https://www.npmjs.com/package/sharp) package to compress the images
  - You need the [twitter](https://www.npmjs.com/package/twitter) package to communicate with the Twitter API

Install the dependencies with:

```
npm install node-fetch
npm install cheerio
npm install sharp
npm install twitter
```

Or simply:

```
npm install
```

Feed your Twitter API keys in the ```keys.env``` file:

```javascript
module.exports = {
     consumer_key:            '...',
     consumer_secret:         '...',
     access_token_key:        '...',
     access_token_secret:     '...'
}
```

Simply run it with:

```
node index.js
```
