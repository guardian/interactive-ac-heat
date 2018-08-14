var el = document.createElement('script');

el.src = '<%= path %>/app.js';
document.body.appendChild(el);

const twitterBaseUrl = 'https://twitter.com/intent/tweet?text=';
const facebookBaseUrl = 'https://www.facebook.com/dialog/feed?display=popup&app_id=741666719251986&redirect_uri=http://www.theguardian.com&link=';
const googleBaseUrl = 'https://plus.google.com/share?url=';

function share(title, shareURL, fbImg, twImg, hashTag) {
    var twImgText = twImg ? ` ${twImg.trim()} ` : ' ';
    var fbImgQry = fbImg ? `&picture=${encodeURIComponent(fbImg)}` : '';
    return function (network, extra='') {
        var twitterMessage = `${extra}${title}`;
        var shareWindow;

        if (network === 'twitter') {
            shareWindow = twitterBaseUrl + encodeURIComponent(twitterMessage + ' ') + shareURL;
        } else if (network === 'facebook') {
            shareWindow = facebookBaseUrl + 'https://www.theguardian.com/cities/ng-interactive/2018/aug/14/which-cities-are-liveable-without-air-conditioning-and-for-how-much-longer';
        } else if (network === 'email') {
            shareWindow = 'mailto:?subject=' + encodeURIComponent(title) + '&body=' + 'https://www.theguardian.com/cities/ng-interactive/2018/aug/14/which-cities-are-liveable-without-air-conditioning-and-for-how-much-longer';
        } else if (network === 'google') {
            shareWindow = googleBaseUrl + '';
        }

        window.open(shareWindow, network + 'share', 'width=640,height=320');
    }
}


var shareFn = share("Which cities are liveable without air-conditioning?", 'https://gu.com/p/96xak', '');
[].slice.apply(document.querySelectorAll('.interactive-share')).forEach(shareEl => {
    var network = shareEl.getAttribute('data-network');
    shareEl.addEventListener('click',() => shareFn(network));
});