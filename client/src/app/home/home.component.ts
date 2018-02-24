import { ChangeDetectorRef, Component } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import * as OktaAuth from '@okta/okta-auth-js';

@Component({
  template: `
    <mat-card *ngIf="givenName">
      <h2>Welcome, {{givenName}}!</h2>
      <button mat-raised-button (click)="logout()">Logout</button>
      <a mat-button routerLink="/beer-list">Beer List</a>
    </mat-card>

    <mat-card *ngIf="!givenName">
      <mat-card-title>Login with Redirect</mat-card-title>
      <button mat-raised-button (click)="login()">Login</button>
    </mat-card>

    <mat-card *ngIf="!givenName">
      <mat-card-title>Login Directly</mat-card-title>

      <form (ngSubmit)="loginWithPassword()" ngNativeValidate>
        <p style="color:red; font-weight:bold" *ngIf="error">
          {{error}}
        </p>

        <p>
          <mat-form-field>
            <input matInput [(ngModel)]="username" name="username"
                   placeholder="Name" required>
          </mat-form-field>
        </p>

        <p>
          <mat-form-field>
            <input matInput [(ngModel)]="password" name="password"
                   type="password" placeholder="Password" required>
          </mat-form-field>
        </p>

        <button mat-raised-button type="submit">Login</button>
      </form>
    </mat-card>`
})
export class HomeComponent {
  private username: string;
  private password: string;
  private error: string;

  constructor(private oauthService: OAuthService, private changeDetector: ChangeDetectorRef) {
  }

  login() {
    this.oauthService.initImplicitFlow();
  }

  logout() {
    this.oauthService.logOut();
  }

  get givenName() {
    const claims: any = this.oauthService.getIdentityClaims();
    if (!claims) {
      return null;
    }
    return claims.name;
  }

  loginWithPassword() {
    this.oauthService.createAndSaveNonce().then(nonce => {
      const authClient = new OktaAuth({
        url: 'https://dev-158606.oktapreview.com',
        issuer: 'default'
      });
      return authClient.signIn({
        username: this.username,
        password: this.password
      }).then((response) => {
        if (response.status === 'SUCCESS') {
          return authClient.token.getWithoutPrompt({
            clientId: this.oauthService.clientId,
            responseType: ['id_token', 'token'],
            scopes: ['openid', 'profile', 'email'],
            sessionToken: response.sessionToken,
            nonce: nonce,
            redirectUri: window.location.origin
          })
            .then((tokens) => {
              const idToken = tokens[0].idToken;
              const accessToken = tokens[1].accessToken;
              const keyValuePair = `#id_token=${encodeURIComponent(idToken)}&access_token=${encodeURIComponent(accessToken)}`;
              this.oauthService.tryLogin({
                customHashFragment: keyValuePair,
                disableOAuth2StateCheck: true
              }).then(() => {
                // notify Angular that things have changed
                this.changeDetector.detectChanges();
              });
            });
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
