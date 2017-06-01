# Adding Authentication to Your Angular PWA

## Secure Your API

Use Stormpath's Spring Boot Starter. This will give you authentication for your UI and security for your REST endpoints. The 2.0.0-rc1 release is compatible with Okta. In your pom.xml, you'll need the following XML:

```xml
<properties>
    <stormpath.version>2.0.0-okta-rc1</stormpath.version>
</properties>

<dependencies>
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

```
cd server 
./mvnw spring-boot:run
```

## Getting Started with Okta

Getting Started With Okta
=========================

Okay, so you've been using Stormpath for a while and now you want to check out out Okta. This guide will walk you through
setting up a new account, creating an API token, and everything else you'll need to get up and running on Okta.

Create an Okta Developer Account
--------------------------------

1. Head on over to: https://www.okta.com/developer/signup/
2. Fill out the signup form, and click the "Get Started" button
3. Within a few minutes you will get a conformation email
4. Follow the instructions in the email to finish setting up your account


Your Okta URLs
--------------

When setting up a developer account, you end up with a couple URLs.
The first is an admin console URL that looks something like this: 

https://dev-123456-admin.oktapreview.com/admin/getting-started

Use this one to manually change organization settings, create users, or other general administrative work.  

The other URL looks similar, but is missing the `admin` part: 

https://dev-123456.oktapreview.com/

This is the one your users could interact with, and will be the base URL for any API access.

**Important:** The second URL (the non-admin one) is the one you will need to remember, you will use this URL for API access.
 
Setup your Okta 'Organization'
------------------------------

### Create an Application

1. Navigate to your Admin console: i.e. https://dev-123456-admin.oktapreview.com/admin/dashboard
2. On the top menu click on 'Applications'
3. Press the 'Add Application' button
4. Press the 'Create New App' button
5. On the 'Create a New Application Integration' popup fill select the following values, then press the 'Create' button
  - Platform - Native
  - Sign-on Method - OpenID Connect
6. On the 'Create OpenID Connect Integration' page enter the following values, and press the 'Next' button
  - Application Name - 'My Test Application'
7. Use `http://localhost:8080/client/callback` for the Redirect URI's, and press the 'Finish' button
8. Your application has been created, but you still have a few settings to change. On the 'General' tab, click the 'Edit' button on the 'General Settings' panel
9. Select the 'Refresh Token', and 'Resource Owner Password' checkboxes and click the 'Save' button
10. Click the 'Edit' button on the 'Client Credentials' panel
11. Select the 'Use Client Authentication' radio button, and press the 'Save' button
12. Click on the 'Groups' tab
13. Select the 'Assign' button in the 'Everyone' column, and press the 'Done' button
14. Grab the ID portion of the URL of your browsers current page, for example: if my URL was: `https://dev-123456-admin.oktapreview.com/admin/app/oidc_client/instance/00icu81200icu812/#tab-groups` then `00icu81200icu812` would be your application's ID

**Important:** You will need to remember your application's ID.

### Create an Access Token

1. Navigate to your Admin console: i.e. https://dev-123456-admin.oktapreview.com/admin/dashboard
2. On the top menu click on 'Security' -> 'API'
3. Select the 'Tokens' tab
4. Press the 'Create Token' button
5. On the popup, give your new token a name, for example: 'My Test Token', and press the 'Create Token' button

**Important:** You will need to remember this token value, so copy/paste it somewhere safe.

For more information take a look at the official [Create an API token](http://developer.okta.com/docs/api/getting_started/getting_a_token.html) guide.

## Authenticate with OIDC

```
npm install
```

```
ng serve
```

```
Your global Angular CLI version (1.0.3) is greater than your local
version (1.0.0). The local Angular CLI version is used.

To disable this warning use "ng set --global warnings.versionMismatch=false".
```

```
Fetch API cannot load http://localhost:8080/good-beers. No 'Access-Control-Allow-Origin' 
header is present on the requested resource. Origin 'http://localhost:4200' is therefore 
not allowed access. The response had HTTP status code 403. If an opaque response serves 
your needs, set the request's mode to 'no-cors' to fetch the resource with CORS disabled.
```

```
stormpath.web.cors.allowed.originUris=http://localhost:4200
```

```
npm install --save angular-oauth2-oidc
```

Modify `app.component.ts` to import `OAuthService` and configure your app to use your Okta application settings.

```typescript
import { OAuthService } from 'angular-oauth2-oidc';

...

  constructor(private oauthService: OAuthService) {
    this.oauthService.redirectUri = window.location.origin;
    this.oauthService.clientId = '[client-id]';
    this.oauthService.scope = 'openid profile email';
    this.oauthService.oidc = true;
    this.oauthService.issuer = 'https://dev-[dev-id].oktapreview.com';

    this.oauthService.loadDiscoveryDocument().then(() => {
      this.oauthService.tryLogin({});
    });
  }
...
```




## Authenticate with Stormpath Angular SDK

## Deploy to Cloud Foundry

## Happy Authenticating!
