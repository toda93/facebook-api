import HttpClient from '@azteam/http-client';


const END_POINT = 'https://graph.facebook.com';

class FacebookAPI {
    constructor(appId, appSecret) {
        this.client = new HttpClient();
        this.appId = appId;
        this.appSecret = appSecret;
    }

    async checkTokenInApp(token) {
        const res = await this.client.get(`${END_POINT}/debug_token`, {
            input_token: token,
            access_token: `${this.appId}|${this.appSecret}`
        });
        return !!(res && res.data && res.data.is_valid);
    }

    async getProfile(token) {
        const res = await this.client.get(`${END_POINT}/me`, {
            fields: 'id,name,email',
            access_token: token
        });
        if (res && res.id) {
            return {
                ...res,
                avatar: `${END_POINT}/${res.id}/picture?type=large`
            }
        }
        return null;
    }

}

export default FacebookAPI;
