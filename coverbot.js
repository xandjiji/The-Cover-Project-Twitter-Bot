const fetch     = require('cloudscraper');
const $         = require('cheerio');
const sharp     = require('sharp');
const Twitter   = require('twitter');
const fs        = require('fs');

const utils     = require('./utils');
const config    = require('./keys.env');

const url       = 'http://www.thecoverproject.net/view.php?cover_id=';
const baseURL   = 'http://www.thecoverproject.net';

var client      = new Twitter(config);

async function main() {
    let errorFlag = false;
    
    // getting a random page from The Cover Project
    let randomPage = await getRandomPage();
    if(randomPage.error) {
        utils.errorMsg(randomPage.errorMsg);
        errorFlag = true;
    }

    // getting game title and image link
    if(!errorFlag) {
        var data = cheerioParsing(randomPage.body);
    }

    // downloading image
    if(!errorFlag) {
        let download = await downloadImage(data.link);
        if(download.error) {
            utils.errorMsg(download.errorMsg);
            errorFlag = true;
        }   
    }

    // compressing image
    if(!errorFlag) {
        sharp.cache(false);
        let compress = await compressImg();
        if(compress.error) {
            utils.errorMsg(compress.errorMsg);
            errorFlag = true;
        }
    }

    // uploading image
    if(!errorFlag) {
        var img = await uploadImg();
        if(img.error) {
            utils.errorMsg(img.errorMsg);
            errorFlag = true;
        }        
    }

    // tweeting
    if(!errorFlag) {
        let status = utils.makeTweet(data.title, img.link);
        let tweet = await postTweet(status);
        if(tweet.error) {
            utils.errorMsg(tweet.errorMsg);
            errorFlag = true;
        }
    }

    if(!errorFlag) {
        utils.successMsg(data);
    }    
}

async function getRandomPage() {
    let randomID = Math.floor((Math.random() * 16769) + 1);

    try {
        let response = await fetch(url + randomID);

        return { error: false, body: response };
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
    try {
        await fetch.get({ uri: link, encoding: null })
        .then(async function (bufferAsBody) {
            fs.writeFile('./cover.png', bufferAsBody, (error) => {
                if(error) {
                    return { error: error };
                }
            });

            return { error: false };
        })
    } catch (error) {
        return { error: error };
    }
    
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
