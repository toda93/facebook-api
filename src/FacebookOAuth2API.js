import querystring from 'querystring';
import HttpClient from '@azteam/http-client';

import {ErrorException} from '@azteam/error';

const OAUTH_ENDPOINT = 'https://www.facebook.com/v3.2/dialog/oauth';
const OAUTH_TOKEN_ENDPOINT = 'https://graph.facebook.com/v3.2/oauth/access_token';

class FacebookOAuth2API {
    constructor(option) {
        option = {
            token: null,
            ...option
        };
        if (!option.client_id || !option.client_secret) {
            throw new ErrorException('FACEBOOK_OAUTH_INIT', {
                msg: 'client ID or client secret not found'
            });
        }
        this.client_id = option.client_id;
        this.client_secret = option.client_secret;
        this.redirect_uri = option.redirect_uri;
        this.scope = option.scope;
        this.token = option.token;
    }

    getUrlAuthCode() {
        const params = {
            client_id: this.client_id,
            redirect_uri: this.redirect_uri,
            scope: this.scope,
        };
        return `${OAUTH_ENDPOINT}?${querystring.stringify(params)}`;
    }

    async getTokenByCode(code) {
        const client = new HttpClient();

        const json = await client.responseJSON().get(OAUTH_TOKEN_ENDPOINT, {
            code,
            client_id: this.client_id,
            client_secret: this.client_secret,
            redirect_uri: this.redirect_uri,
        });
        if (json.expires_in) {
            json.expired = Math.round((new Date()).getTime() / 1000) + (json.expires_in - 500);

            this.token = json;
            return this.token;
        }
        throw new ErrorException('FACEBOOK_OAUTH_VERIFY_CODE', json);
    }
}

export default FacebookOAuth2API;