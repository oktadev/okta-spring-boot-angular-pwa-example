import { Component } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app works!';

  constructor(private oauthService: OAuthService) {
    this.oauthService.redirectUri = window.location.origin;
    this.oauthService.clientId = 'MjlYvTtFW26gOoOAHKOz';
    this.oauthService.scope = 'openid profile email';
    this.oauthService.oidc = true;
    this.oauthService.issuer = 'https://dev-158606.oktapreview.com/oauth2/default';

    this.oauthService.loadDiscoveryDocument().then(() => {
      this.oauthService.tryLogin({});
    });
  }
}
