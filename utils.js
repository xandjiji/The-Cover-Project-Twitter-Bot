let utils = {}

utils.timeStamp = function timeStamp() {
    let time = new Date().toLocaleTimeString('en-US', {hour12: false, hour: 'numeric', minute: 'numeric', second: 'numeric'});

    return `[${time}]`;
}

utils.successMsg = function successMsg(game) {
    
    let msg = `${utils.timeStamp()} tweet feito com sucesso (${game})`;

    return console.log(msg);
}

utils.errorMsg = function errorMsg(error) {
    let msg = `${utils.timeStamp()} ${error}`;

    return console.log(msg);
}

utils.makeTweet = function makeTweet(title, imgLink) {
    let composedTweet = {
        status: title,
        media_ids: imgLink
    };

    return composedTweet;
}

module.exports = utils;
