import crypto from 'crypto';
import querystring from 'querystring';
import HttpClient from '@azteam/http-client';

import FacebookOAuth2API from './FacebookOAuth2API';

const END_POINT = 'https://graph.facebook.com/v3.2';

class FacebookAPI extends FacebookOAuth2API {

    async getMyInfo() {
        const client = this._getClient();
        const info = await client.get(`${END_POINT}/me?fields=id,name,email`);
        return {
            ...info,
            picture: `http://graph.facebook.com/${info.id}/picture?type=normal`
        }
    }

    sendPageSettingMenu(buttons) {
        const client = this._getClient();
        return client.post(`${END_POINT}/me/messenger_profile`, {
            get_started: {
                payload: 'GET_STARTED',

            },
            persistent_menu: [
                {
                    locale: 'default',
                    call_to_actions: buttons
                }
            ]
        });
    }

    sendPageMessage(sender, msg) {
        const client = this._getClient();
        return client.post(`${END_POINT}/me/messages`, {
            recipient: {
                id: sender
            },
            message: {
                text: msg
            },
        });
    }

    sendPageMessageWithButtons(sender, msg, buttons) {
        const client = this._getClient();
        return client.post(`${END_POINT}/me/messages`, {
            recipient: {
                id: sender
            },
            message: {
                attachment: {
                    type: 'template',
                    payload: {
                        template_type: 'button',
                        text: msg,
                        buttons: buttons
                    }
                },
                text: msg
            },
        });
    }

    postPhoto(message, url) {
        const client = this._getClient();
        return client.post(`${END_POINT}/me/photos`, {
            message,
            url
        });
    }

    postFeed(message, link = null) {

        const data = {
            message
        };

        if (link) {
            data.link = link;
        }
        const client = this._getClient();
        return client.post(`${END_POINT}/me/feed`, data);
    }

    sharePost(id, message = '') {
        const link = `https://www.facebook.com/${id}`;
        return this.postFeed(message, link);
    }


    static getTokenAndroid(email, password) {
        let data = {
            api_key: '882a8490361da98702bf97a021ddc14d', //Android API_KEY
            email: email,
            format: 'JSON',
            locale: 'vi_vn',
            method: 'auth.login',
            password: password,
            return_ssl_resources: '0',
            v: '1.0'
        };

        let sig = '';

        data.map((value, key) => {
            sig += `${key}=${value}`;
        });

        sig += '62f8ce9f74b12f84c123cc23437a4a32'; //Android API_SECRET
        data.sig = crypto.createHash('md5').update(sig.toString()).digest('hex');

        const client = new HttpClient();
        return client.get('https://api.facebook.com/restserver.php?' + querystring.stringify(data));
    }

    static createButtonPostBack(title, payload) {
        return {
            title,
            payload,
            type: 'postback'
        }
    }

    static createButtonUrl(title, url, webview_height_ratio = 'FULL') {
        return {
            title,
            url,
            webview_height_ratio,
            type: 'web_url',
        }
    }

    static createButtonCall(title, payload) {
        return {
            title,
            payload,
            type: 'phone_number',
        }
    }


    _getClient() {
        console.log(`${this.token.token_type} ${this.token.access_token}`);

        return new HttpClient({
            headers: {
                'Authorization': `Bearer ${this.token.access_token}`
            }
        });

    }
}

export default FacebookAPI;