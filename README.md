# Spring Boot API with Angular PWA
 
This is an example app that shows how to add Authentication with Okta to an Angular PWA that works offline.

To see how this application was created, please read [Add Authentication to Your Angular PWA](https://developer.okta.com/blog/2017/06/13/add-authentication-angular-pwa) on the Okta Developer blog.

You will need to have an [Okta Developer account](https://developer.okta.com/signup/) and your Okta settings configured to run this application.

> [Okta](https://developer.okta.com/) has Authentication and User Management APIs that reduce development time with instant-on, scalable user infrastructure. Okta's intuitive API and expert support make it easy for developers to authenticate, manage and secure users and roles in any application.

* [Getting Started](#getting-started)
* [Links](#links)
* [Help](#help)
* [License](#license)

## Getting Started

To install this example application, run the following commands:

```bash
git clone git@github.com:oktadeveloper/okta-spring-boot-angular-pwa-example.git
cd okta-spring-boot-angular-pwa-example
```

This will get a copy of the project installed locally. To install all of its dependencies and start each app, follow the instructions below.

To run the server, cd into the `server` folder and run:
 
```bash
./mvnw spring-boot:run
```

To run the client, cd into the `client` folder and run:
 
```bash
npm install && npm start
```

### Create Applications in Okta

You will need to [create an application in Okta](https://developer.okta.com/blog/2017/06/13/add-authentication-angular-pwa#create-open-id-connect-app) to configure the Spring Boot both Angular and Spring Boot.

Log in to your Okta Developer account and navigate to **Applications** > **Add Application**. Click **Single-Page App**, click **Next**, and give the app a name you’ll remember (e.g., "Angular PWA"). Change all instances of `localhost:8080` to `localhost:4200` and click **Done**.

**TIP:** Add `http://localhost:4200` as a **Logout redirect URI** so Logout functionality works in your Angular app.

Copy the client ID into your `server/src/main/resources/application.properties` file. While you're in there, add a `okta.oauth2.issuer` property that matches your Okta domain. For example:

```properties
okta.oauth2.issuer=https://{yourOktaDomain}.com/oauth2/default
okta.oauth2.clientId={clientId}
```

Replace the placeholders in `client/src/app/app.component.ts` to configure your Okta application settings (replacing `{clientId}` and `{yourOktaDomain}` with the values from your "Angular PWA" OIDC app).
                            
```typescript
import { JwksValidationHandler, OAuthService } from 'angular-oauth2-oidc';

...

  constructor(private oauthService: OAuthService) {
    this.oauthService.redirectUri = window.location.origin;
    this.oauthService.clientId = '{clientId}';
    this.oauthService.scope = 'openid profile email';
    this.oauthService.oidc = true;
    this.oauthService.issuer = 'https://{yourOktaDomain}.com/oauth2/default';
    this.oauthService.tokenValidationHandler = new JwksValidationHandler();

    this.oauthService.loadDiscoveryDocumentAndTryLogin();
  }
...
```

You'll also need to specify the `url` in `client/src/home/home.component.ts`.

```typescript
const authClient = new OktaAuth({
  url: 'https://{yourOktaDomain}.com',
  issuer: 'default'
});
```

**NOTE:** The value of `{yourOktaDomain}` should be something like `dev-123456.oktapreview.com`. Make sure you don't include `-admin` in the value!

After making these changes, you should be able to log in with your credentials at `http://localhost:4200`.

You will be prompted to log in when you first load the client.

![Angular Login Form](static/angular-login-form.png)

You can use Chrome Developer Tools to toggle offline in the Network tab and prove that it works offline.

![Offline baby!](static/offline-works.png)

### Deploy to the Cloud

See [deploy.sh](deploy.sh) to see how to deploy to Cloud Foundry. See [heroku.sh](heroku.sh) to see how to deploy to Heroku.

### Lighthouse Score

You can see that this app scores 100 as a PWA using [Lighthouse](https://developers.google.com/web/tools/lighthouse/).

Cloud Foundry                                                  |  Heroku
:-------------------------------------------------------------:|:----------------------------------------------------:
![Lighthouse on Cloud Foundry](static/lighthouse-with-512.png) | ![Lighthouse on Heroku](static/lighthouse-heroku.png)

## Links

This example uses the following libraries provided by Okta:

* [Okta Spring Boot Starter](https://github.com/okta/okta-spring-boot)
* [Okta Auth SDK](https://github.com/okta/okta-auth-js)

It also uses the following library provided by [Manfred Steyer](https://github.com/manfredsteyer):

* [angular-oauth2-oidc](https://github.com/manfredsteyer/angular-oauth2-oidc)

## Help

Please post any questions as comments on the [blog post](https://developer.okta.com/blog/2017/06/13/add-authentication-angular-pwa), or visit our [Okta Developer Forums](https://devforum.okta.com/). You can also email developers@okta.com if would like to create a support ticket. You can also hit me up on Twitter [@mraible](https://twitter.com/mraible).

## License

Apache 2.0, see [LICENSE](LICENSE).