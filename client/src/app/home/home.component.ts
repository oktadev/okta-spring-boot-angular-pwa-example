import { Component } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';

@Component({
  template: `<div *ngIf="givenName">
    <h2>Welcome, {{givenName}}!</h2>
    <button (click)="logout()">Logout</button>
    <p><a routerLink="/beer-list" routerLinkActive="active">Beer List</a></p>
  </div>

  <div *ngIf="!givenName">
    <button (click)="login()">Login</button>
  </div>`
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
