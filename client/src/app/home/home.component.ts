import { Component } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { Router } from '@angular/router';
declare let OktaAuth: any;

@Component({
  template: `
    <md-card *ngIf="givenName">
      <h2>Welcome, {{givenName}}!</h2>
      <button md-raised-button (click)="logout()">Logout</button>
      <a md-button routerLink="/beer-list" routerLinkActive="active">Beer List</a>
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
export class HomeComponent {
  private username: string;
  private password: string;
  private error: string;

  constructor(private oauthService: OAuthService, private router: Router) {
  }

  login() {
    this.oauthService.initImplicitFlow();
  }

  loginWithPassword() {
    console.log('issuer', this.oauthService.issuer);
    console.log('clientId', this.oauthService.clientId);
    this.oauthService.createAndSaveNonce().then(nonce => {
      const authClient = new OktaAuth({
        url: this.oauthService.issuer
      });
      authClient.signIn({
        username: this.username,
        password: this.password
      }).then((response) => {
        console.log('response', response);
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
