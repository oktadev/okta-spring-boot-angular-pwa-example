# Adding Authentication to Your Angular PWA

You're developing a Progressive Web Application (PWA) and your service worker and web app manifest are working swimmingly. You've even taken the time to deploy it to a server with HTTPS and you're feeling pretty good about  things. But wait, you don't have any way of knowing who your users are! Don't you want to provide them with an opportunity to authenticate and tell you who they are? Once you know who they are, you can give them all kinds of personalization options and inspire them to ❤️ your app!

In this article, I'll show you how you can lock down a Spring Boot app, then use modern authentication protocols like Open ID Connect (OIDC) to authenticate and gain access to its APIs. 

## Secure Your API

You might've heard that [Stormpath joined forces with Okta](https://www.okta.com/blog/2017/03/stormpath-welcome-to-Okta/) a few months ago (February 2017). Since the transition, we've been working hard to make the Stormpath SDKs work with Okta's API. The good news is we've made great progress! 

In this example, you'll use a Stormpath's Spring Boot Starter to add security to a Spring Boot app. I'll show you how this starter provides functionality such as login, forgot password, and user registration. 

Then I'll show you how you can use OIDC and Okta's Auth SDK in an Angular app to login and get data from the Spring Boot app. Finally, I'll show how Stormpath's Angular SDK has similar functionality to the Spring Boot Starter, providing login, user registration and forgot password features.

Let's get started! 

Rather than building Spring Boot and Angular application's from scratch, you can clone an existing GitHub project to get you going quickly.

```
git clone https://github.com/oktadeveloper/spring-boot-angular-pwa-example.git
```

If you'd prefer to build this application yourself, please read [Build Your First Progressive Web Application with Angular and Spring Boot](https://developer.okta.com/blog/2017/05/09/progressive-web-applications-with-angular-and-spring-boot).

In this project's `server/pom.xml` file, you'll need to add the following XML:

```xml
<properties>
    <stormpath.version>2.0.0-okta-rc1</stormpath.version>
</properties>

<dependencies>
    ...
    <dependency>
        <groupId>com.stormpath.spring</groupId>
        <artifactId>stormpath-default-spring-boot-starter</artifactId>
    </dependency>
</dependencies>

<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>com.stormpath.sdk</groupId>
            <artifactId>stormpath-bom</artifactId>
            <version>${stormpath.version}</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
```

## Get Started with Okta

**Should I just link to https://github.com/stormpath/stormpath-sdk-java/blob/okta/OktaGettingStarted.md instead of putting all of this painfulness in the article?** 

*If so, you might want to grammar check that bad boy, it says to "press" buttons instead of "click" them.*
 
To begin, you'll need to create an Okta Developer account. This account is free forever and provides the complete Okta Identity Platform for up to 3 applications and 100 users.

1. Head on over to <https://www.okta.com/developer/signup>
2. Fill out the signup form, and click the "Get Started" button
3. Within a few minutes you will get a conformation email
4. Follow the instructions in the email to finish setting up your account

When setting up a developer account, you end up with a couple URLs.
The first is an admin console URL that looks something like this: 

https://dev-123456-admin.oktapreview.com/admin/getting-started

Use this one to manually change organization settings, create users, or other general administrative work.  

The other URL looks similar, but is missing the `admin` part: 

https://dev-123456.oktapreview.com/

This is the one your users could interact with, and will be the base URL for any API access.

**Important:** The second URL (the non-admin one) is the one you will need to remember, you will use this URL for API access.
 
To setup your Okta account for Spring Boot, you'll first need to create an application. 

### Create an Application

1. Navigate to your Admin console: i.e. https://dev-123456-admin.oktapreview.com/admin/dashboard
2. On the top menu click on **Applications**
3. Click the **Add Application** button
4. Click the **Create New App** button
5. On the *Create a New Application Integration* popup fill select the following values, then click the **Create** button
    - Platform - Native
    - Sign-on Method - OpenID Connect
6. On the *Create OpenID Connect Integration* page enter the following value, then click the **Next** button
    - Application Name - Spring Boot Awesomesauce
7. Use `http://localhost:8080/client/callback` for the Redirect URI's, and press the **Finish** button

Your application has been created, but you still have a few settings to change. On the *General* tab, click the **Edit** button on the **General Settings** panel.

1. Check the *Refresh Token*, and *Resource Owner Password* checkboxes and click the **Save** button
2. Click the **Edit** button on the Client Credentials panel
3. Select the *Use Client Authentication* radio button, and click the **Save** button
4. Click on the *Groups* tab
5. Select the *Assign* button in the *Everyone* column, and click the **Done** button
6. Grab the ID portion of the URL of your browsers current page, for example: if my URL was: `https://dev-123456-admin.oktapreview.com/admin/app/oidc_client/instance/00icu81200icu812/#tab-groups` then `00icu81200icu812` is your application's ID

**Important:** You will need to remember your application's ID.

### Create an Access Token

1. Navigate to your Admin console.
2. On the top menu click on **Security** > **API**
3. Click the *Tokens* tab and the **Create Token** button
5. On the popup, give your new token a name, for example: "Bootiful Token", and click the **Create Token** button

**Important:** You will need to remember this token value, so copy/paste it somewhere safe.

For more information take a look at the official [Create an API token](http://developer.okta.com/docs/api/getting_started/getting_a_token.html) guide.

To make your Spring Boot app aware of your Okta settings, you need to set a few environment variables. You can also use [other options](https://docs.stormpath.com/java/servlet-plugin/config.html) for setting these variables.

```bash
export STORMPATH_CLIENT_BASEURL=[baseurl_from_above]
export OKTA_APPLICATION_ID=[application_id_from_above]
export OKTA_API_TOKEN=[api_token_from_above]
```

Now, start it up...

### Run the Spring Boot App

To make your Spring Boot app aware of your Okta settings, you need to set a few environment variables. You can also use [other options](https://docs.stormpath.com/java/servlet-plugin/config.html) for setting these variables.

```bash
export STORMPATH_CLIENT_BASEURL=[baseurl_from_above]
export OKTA_APPLICATION_ID=[application_id_from_above]
export OKTA_API_TOKEN=[api_token_from_above]
```

Now, start it up...

```
cd server 
./mvnw spring-boot:run
```

Navigate to <http://localhost:8080> and you'll be prompted to login.

![Spring Boot Login](static/spring-boot-login.png)

If you call the API with a different `Accept` header (e.g. `application/json`), you'll get a JSON response. The command below uses [HTTPie](https://httpie.org/).

```bash
$ http localhost:8080/login
HTTP/1.1 200
Cache-Control: no-cache, no-store, max-age=0, must-revalidate
Content-Type: application/json
Date: Fri, 02 Jun 2017 00:09:20 GMT
Expires: 0
Pragma: no-cache
Set-Cookie: JSESSIONID=5A22B9431D01E5928E2EFAAC50A0EA38; Path=/; HttpOnly
Transfer-Encoding: chunked
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
```
```json
{
    "accountStores": [],
    "form": {
        "fields": [
            {
                "label": "Username or Email",
                "name": "login",
                "placeholder": "Username or Email",
                "required": true,
                "type": "text"
            },
            {
                "label": "Password",
                "name": "password",
                "placeholder": "Password",
                "required": true,
                "type": "password"
            }
        ]
    }
}
```

<a name="create-open-id-connect-app"></a>
## Create an OpenID Connect App in Okta

OpenID Connect (OIDC) is built on top of the OAuth 2.0 protocol. It allows clients to verify the identity of the user and, as well as to obtain their basic profile information. To integrate [Okta's Identity Platform](https://developer.okta.com) for user authentication, you'll first need to [register](https://www.okta.com/developer/signup/) and create an OIDC application.

Login to your Okta account, or [create one](https://www.okta.com/developer/signup/) if you don’t have one. Click on **Create an OpenID Connect web application** Navigate to **Admin > Add Applications** and click on the **Create New App** button. Select **Single Page App (SPA)** for the Platform and **OpenID Connect** for the sign on method. Click the **Create** button and give your application a name. On the next screen, add `http://localhost:4200` as a Redirect URI and click **Finish**. You should see settings like the following.

<!--{% img static/oidc-settings.png alt:"OIDC App Settings" width:"800" %}-->

![Okta OIDC Settings](static/oidc-settings.png)

Click on the **Assignments** tab and select **Assign** > **Assign to People**. Assign yourself as a user, or someone else that you know the credentials for.

## Authenticate with OpenID Connect

Start the Angular application by running the following commands.

```bash
cd client
npm install
ng serve
```

If you receive an error like the one below, modify `package.json` to use the latest version of `@angular/cli`. 

```
Your global Angular CLI version (1.0.3) is greater than your local
version (1.0.0). The local Angular CLI version is used.

To disable this warning use "ng set --global warnings.versionMismatch=false".
```

When you navigate to <http://localhost:4200>, you'll likely see cross-origin request error.

```
Fetch API cannot load http://localhost:8080/good-beers. No 'Access-Control-Allow-Origin' 
header is present on the requested resource. Origin 'http://localhost:4200' is therefore 
not allowed access. The response had HTTP status code 403. If an opaque response serves 
your needs, set the request's mode to 'no-cors' to fetch the resource with CORS disabled.
```

To fix this, add the following property to the Spring Boot app's `src/main/resources/application.properties`.

```
stormpath.web.cors.allowed.originUris=http://localhost:4200
```

Also, remove the `@CrossOrigin` annotation from `BeerController.java` since it's no longer needed. 

Install [Manfred Steyer's](https://github.com/manfredsteyer) project to [add OAuth 2 and OpenID Connect support](https://github.com/manfredsteyer/angular-oauth2-oidc) using npm.

```bash
npm install --save angular-oauth2-oidc
```

Modify `app.component.ts` to import `OAuthService` and configure your app to use your Okta application settings.

```typescript
import { OAuthService } from 'angular-oauth2-oidc';

...

  constructor(private oauthService: OAuthService) {
    this.oauthService.redirectUri = window.location.origin;
    this.oauthService.clientId = '[oidc-client-id]';
    this.oauthService.scope = 'openid profile email';
    this.oauthService.oidc = true;
    this.oauthService.issuer = 'https://dev-[dev-id].oktapreview.com';

    this.oauthService.loadDiscoveryDocument().then(() => {
      this.oauthService.tryLogin({});
    });
  }
...
```

Create `src/app/home/home.component.ts` and configure it to have **Login** and **Logout** buttons.

{% raw %}
```typescript
import { Component } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';

@Component({
  template: `
    <md-card *ngIf="givenName">
      <md-card-title>Welcome, {{givenName}}!</md-card-title>
      <button md-raised-button (click)="logout()">Logout</button>
      <a md-button routerLink="/beer-list">Beer List</a>
    </md-card>

    <md-card *ngIf="!givenName">
      <button md-raised-button (click)="login()">Login</button>
    </md-card>`
})
export class HomeComponent {
  constructor(private oauthService: OAuthService) {
  }

  login() {
    this.oauthService.initImplicitFlow();
  }

  logout() {
    this.oauthService.logOut();
  }

  get givenName() {
    const claims = this.oauthService.getIdentityClaims();
    if (!claims) {
      return null;
    }
    return claims.name;
  }
}
```
{% endraw %}

Modify `src/app/shared/beer/beer.service.ts` to read the access token from `oauthService` and add an `Authorization` header.

```typescript
import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs';
import { OAuthService } from 'angular-oauth2-oidc';

@Injectable()
export class BeerService {

  constructor(private http: Http, private oauthService: OAuthService) {
  }

  getAll(): Observable<any> {
    const headers: Headers = new Headers();
    headers.append('Authorization', this.oauthService.authorizationHeader());

    let options = new RequestOptions({ headers: headers });

    return this.http.get('http://localhost:8080/good-beers', options)
      .map((response: Response) => response.json());
  }
}
```

Create `src/app/shared/auth/auth.guard.service.ts` to navigate to the `HomeComponent` if the user is not authenticated.

```typescript
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { OAuthService } from 'angular-oauth2-oidc';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private oauthService: OAuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.oauthService.hasValidIdToken()) {
      return true;
    }

    this.router.navigate(['/home']);
    return false;
  }
}
```

Import the `OAuthModule` in `app.module.ts`, configure the new `HomeComponent`, and lock the `/beer-list` route down with the `AuthGuard`.

```typescript
import { OAuthModule } from 'angular-oauth2-oidc';
import { HomeComponent } from './home/home.component';
import { AuthGuard } from './shared/auth/auth.guard.service';

const appRoutes: Routes = [
  { path: 'beer-list', component: BeerListComponent, canActivate: [AuthGuard]},
  { path: 'home', component: HomeComponent },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', redirectTo: 'home' }
];

@NgModule({
  declarations: [
    ...
    HomeComponent
  ],
  imports: [
    ...
    OAuthModule.forRoot()
  ],
  providers: [AuthGuard],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

After making these changes, you should be able to run `ng serve` and see a login button.

![Angular Login Button](static/angular-login-button.png)

Click the **Login** button and sign-in with one of the people that's configured in your Okta application.

![Angular Okta Login](static/angular-okta-login.png)

After logging in, you'll see a welcome message.

![Angular Welcome](static/angular-welcome.png)

Click on **Beer List** to see data from your Spring Boot app.

![Angular Beer List](static/angular-beer-list.png)

To add the "Home" link at the top, modify `beer-list.component.html` to have the following HTML.

{% raw %}
```html
<a md-button routerLink="/home">Home</a>

<md-card>
  <md-card-title>Beer List</md-card-title>
  <md-card-content>
    <md-list>
      <md-list-item *ngFor="let beer of beers">
        <img md-list-avatar src="{{beer.giphyUrl}}" alt="{{beer.name}}">
        <h3 md-line>
          {{beer.name}}
        </h3>
      </md-list-item>
    </md-list>

    <p>
    </p>
  </md-card-content>
</md-card>
```
{% endraw %}

And if you toggle "offline" in Chrome Developer Tools' Network tab, you'll see it all works offline too!

![Angular PWA Works Offline](static/angular-beer-list-offline.png)

If it works - great! If you want to build your own login form in your app, continue reading to learn how to use the [Okta Auth SDK](https://github.com/okta/okta-auth-js) with `OAuthService`.

### Authenticating with the Okta Auth SDK

The Okta Auth SDK builds on top of Otka's [Authentication API](/docs/api/resources/authn.html) and [OAuth 2.0 API](/docs/api/resources/oidc.html) to enable you to create a fully branded sign-in experience using JavaScript.

Install it using npm:

```bash
npm install @okta/okta-auth-js --save
```

Add a reference to this library’s main JavaScript file in `.angular-cli.json`:

```json
"scripts": [
  "../node_modules/@okta/okta-auth-js/dist/okta-auth-js.min.js"
],
```

Change `HomeComponent` to declare `OktaAuth` and modify its `template` so it has a sign-in form.

{% raw %}
```typescript
declare let OktaAuth: any;

@Component({
  template: `
    <md-card *ngIf="givenName">
      <h2>Welcome, {{givenName}}!</h2>
      <button md-raised-button (click)="logout()">Logout</button>
      <a md-button routerLink="/beer-list">Beer List</a>
    </md-card>

    <md-card *ngIf="!givenName">
      <md-card-title>Login with Redirect</md-card-title>
      <button md-raised-button (click)="login()">Login</button>
    </md-card>

    <md-card *ngIf="!givenName">
      <md-card-title>Login Directly</md-card-title>

      <form (ngSubmit)="loginWithPassword()" ngNativeValidate>
        <p style="color:red; font-weight:bold" *ngIf="error">
          {{error}}
        </p>

        <p>
          <md-input-container>
            <input mdInput [(ngModel)]="username" name="username"
                   placeholder="Name" required>
          </md-input-container>
        </p>

        <p>
          <md-input-container>
            <input mdInput [(ngModel)]="password" name="password"
                   type="password" placeholder="Password" required>
          </md-input-container>
        </p>

        <button md-raised-button type="submit">Login</button>
      </form>
    </md-card>`
})
```
{% endraw %}

After making these changes, the `HomeComponent` should render as follows.

![Angular Login Form](static/angular-login-form.png)

Import Angular’s `Router`, add it as a dependency in the constructor, and add local variables for the username and password fields. Then implement a `loginWithPassword()` method in `HomeComponent`. This method uses the `OktaAuth` library to get a session token and exchange it for ID and access tokens.

```typescript
import { Router } from '@angular/router';
...
export class HomeComponent {
  private username: string;
  private password: string;
  private error: string;

  constructor(private oauthService: OAuthService, private router: Router) {
  }
  ...
  loginWithPassword() {
    this.oauthService.createAndSaveNonce().then(nonce => {
      const authClient = new OktaAuth({
        url: this.oauthService.issuer
      });
      authClient.signIn({
        username: this.username,
        password: this.password
      }).then((response) => {
        if (response.status === 'SUCCESS') {
          authClient.token.getWithoutPrompt({
            clientId: this.oauthService.clientId,
            responseType: ['id_token', 'token'],
            scopes: ['openid', 'profile', 'email'],
            sessionToken: response.sessionToken,
            nonce: nonce,
            redirectUri: window.location.origin
          })
            .then((tokens) => {
              // oauthService.processIdToken doesn't set an access token
              // set it manually so oauthService.authorizationHeader() works
              localStorage.setItem('access_token', tokens[1].accessToken);
              this.oauthService.processIdToken(tokens[0].idToken, tokens[1].accessToken);
              this.router.navigate(['/home']);
            })
        } else {
          throw new Error('We cannot handle the ' + response.status + ' status');
        }
      }).fail((error) => {
        console.error(error);
        this.error = error.message;
      });
    });
  }
}
```

You should be able to sign in using the form, using one of your app's registered users. After logging in, you'll be able to click the **Beer List** link and view the beer list.

## Authenticate with Stormpath Angular SDK

If you're a former Stormpath migrating to Okta, you might've used our Angular, AngularJS, or React SDK. The good news is these libraries should still work with Okta! 

To save the code your wrote for OIDC, I recommend committing your changes to Git.

```
git commit -a -m "Add Security with OIDC and Okta"
```

Then create a new branch for the Stormpath Angular SDK integration.

```
git checkout -b stormpath
```

Install Stormpath’s Angular SDK to make it possible to communicate with the secured server.

```
npm install --save angular-stormpath
```

Modify `src/app/app.module.ts` to import `StormpathConfiguration` and `StormpathModule`. Then create a function to configure the `endpointPrefix` to point to `http://localhost:8080`.

```
import { StormpathConfiguration, StormpathModule } from 'angular-stormpath';

export function stormpathConfig(): StormpathConfiguration {
  let spConfig: StormpathConfiguration = new StormpathConfiguration();
  spConfig.endpointPrefix = 'http://localhost:8080';
  return spConfig;
}
```

Add `StormpathModule` to the imports in `@NgModule` and use the `stormpathConfig` function to override the default `StormpathConfiguration` in the `providers` list.

<pre class="lang:typescript toolbar:always nums:true nums-toggle:true mark:5,8" title="src/app/app.module.ts">
@NgModule({
  …
  imports: [
    ...
    StormpathModule
  ],
  providers: [{
    provide: StormpathConfiguration, useFactory: stormpathConfig
  }],
  bootstrap: [AppComponent]
})
</pre>

Modify `app.component.html` to add the Stormpath `<sp-authport></sp-authport>` component and a section to show the user’s name and a logout link.

<pre class="lang:html toolbar:always nums:true nums-toggle:true" title="src/app/app.component.html">
<sp-authport></sp-authport>

<div *ngIf="(user$ | async)" class="row text-center">
  <h2>
    Welcome, {{ ( user$ | async ).givenName }}!
  </h2>
  <ul class="nav nav-pills nav-stacked text-centered">
    <li role="presentation" (click)="logout(); false"><a href="">Logout</a></li>
  </ul>
</div>
<div [hidden]="!(user$ | async)">
  <!-- secure main component or <router-outlet></router-outlet> -->
</div>
</pre>

You’ll notice the `user$` variable in the HTML. In order to resolve this, you need to change your `AppComponent` so it extends `AuthPortComponent`.

<pre class="lang:ts toolbar:always nums:true nums-toggle:true" title="src/app/app.component.ts">
import { AuthPortComponent } from 'angular-stormpath';
...
export class AppComponent extends AuthPortComponent {
</pre>

You can also inject the `Stormpath` service into your component, subscribe to `stormpath.user$` and implement `logout()` yourself.

<pre class="lang:ts toolbar:always nums:true nums-toggle:true" title="src/app/app.component.ts">
import { Account, Stormpath } from 'angular-stormpath';
...
export class AppComponent {
  user$: Observable<Account | boolean>;

  constructor(private stormpath: Stormpath) {
    this.user$ = this.stormpath.user$;
  }

  logout(): void {
    this.stormpath.logout();
  }
}
</pre>

Make sure your server is started (with `mvn spring-boot:run` in the server directory, and `ng serve` in the client directory) and navigate to http://localhost:4200. 

## Deploy to Cloud Foundry

## Happy Authenticating!
