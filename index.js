const fetch     = require('node-fetch');
const $         = require('cheerio');
const sharp     = require('sharp');
const Twitter   = require('twitter');
const fs        = require('fs');

const utils     = require('./utils');
const config    = require('./config');

const url       = 'http://www.thecoverproject.net/view.php?cover_id=';
const baseURL   = 'http://www.thecoverproject.net';

var client      = new Twitter(config);

async function main() {
    // getting a random page from The Cover Project
    let randomPage = await getRandomPage();
    if(randomPage.error) {
        utils.errorMsg(randomPage.errorMsg);
    }

    // getting game title and image link
    let data = cheerioParsing(randomPage.body);

    // downloading image
    let download = await downloadImage(data.link);
    if(download.error) {
        utils.errorMsg(download.errorMsg);
    }

    // compressing image
    sharp.cache(false);
    let compress = await compressImg();
    if(compress.error) {
        utils.errorMsg(compress.errorMsg);
    }

    // uploading image
    let img = await uploadImg();
    if(img.error) {
        utils.errorMsg(img.errorMsg);
    }

    // tweeting
    let status = utils.makeTweet(data.title, img.link);
    let tweet = await postTweet(status);
    if(tweet.error) {
        utils.errorMsg(tweet.errorMsg);
    }

    utils.successMsg(data.title);
}

async function getRandomPage() {
    let randomID = Math.floor((Math.random() * 16706) + 1);

    try {
        let response = await fetch(url + randomID);
        let body = await response.text();

        return { error: false, body: body };
    } catch(error) {
        return { error: true, errorMsg: error };
    }

}

function cheerioParsing(body) {
    // parsing the image link
    var link = baseURL + $('h2 > a', body).attr('href');

    // parsing the game title
    var title = $('title', body).text();
    title = title.substring(0, title.length - 20);

    return { title: title, link: link };
}

async function downloadImage(link) {
    let response = await fetch(link);

    await new Promise((resolve, reject) => {
        const file = fs.createWriteStream('cover.png');
        response.body.pipe(file);
        response.body.on('error', (error) => {
            reject(error);
            
            return { error: true, errorMsg: error };
        });
        file.on('finish', function() {
            resolve();
            
            return { error: false };
        });
    });

    return { error: false };
}

async function compressImg() {
    try {
        await sharp('cover.png')
            .jpeg( { quality: 50 } )
            .toFile('cover_compressed.jpeg')

        return { error: false };
    } catch(error) {
        return { error: true, errorMsg: error };
    }
}

async function uploadImg() {
    let imgPath = fs.readFileSync('cover_compressed.jpeg');

    try {
        let imgData = await client.post('media/upload', {media: imgPath});

        return { error: false, link: imgData.media_id_string };
    } catch(error) {
        return { error: true, errorMsg: error };
    }
}

async function postTweet(status) {
    try {
        await client.post('statuses/update', status);
        return { error: false };
    } catch (error) {
        return { error: true, errorMsg: error };
    }
}

main();
