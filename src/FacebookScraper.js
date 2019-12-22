import moment from 'moment';

import HttpClient from 'toda-http-client';

class FacebookScraper {

    constructor(cookie, agent = null) {
        this.cookie = cookie;
        this.user_id = '';
        const user = this.cookie.match(/c_user=(\d+)/);

        if (!agent) {
            agent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.87 Safari/537.36';
        }

        if (user) {
            this.user_id = user[1];
            this.client = new HttpClient({
                headers: {
                    'User-Agent': agent,
                    'Cookie': this.cookie
                }
            });
        }
    }

    async sendInboxMessage(fb_id, message, time_now = false) {
        const url = 'https://m.facebook.com/messages/read/?tid=' + fb_id;
        if (time_now) {
            const time = moment().format('HH:mm:ss');
            message = `[${time}] ${message}`;
        }

        let html = await this.client.get(url);

        let matches = html.match(/<input type="hidden" name="fb_dtsg" value="(.*?)"/);

        if (matches) {
            let data = {};
            data['body'] = message;
            data['wwwupp'] = 'C3';
            data['fb_dtsg'] = matches[1];
            data[`ids[${fb_id}]`] = fb_id;

            matches = html.match(/<input type="hidden" name="tids" value="(.*?)"/);
            if (matches) {
                data['tids'] = matches[1];
                return this.client.post('https://m.facebook.com/messages/send', data);
            }
        }
        return null;
    }

    async readLastInboxMessage(fb_id) {
        const url = 'https://m.facebook.com/messages/read/?tid=' + fb_id;

        const DOM = await this.client.responseDOM().get(url);

        const group = DOM.querySelector('#messageGroup');

        if (group) {
            return {
                name: group.lastChild.lastChild.querySelector('a').text,
                msg: group.lastChild.lastChild.querySelector('span').text
            };
        }
        return null;
    }
}

export default FacebookScraper;