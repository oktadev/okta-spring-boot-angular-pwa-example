import { Component, OnInit } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { Router } from '@angular/router';
import { AuthPortComponent, Stormpath } from 'angular-stormpath';
import { Observable } from 'rxjs/Observable';
declare let OktaAuth: any;

@Component({
  styles: ['sp-authport { margin-top: 20px; display: block; }'],
  template: `    
    <md-card *ngIf="(user$ | async)">
      <md-card-title>Welcome, {{ ( user$ | async ).fullName }}!</md-card-title>
      <md-card-content>
        <button md-raised-button (click)="logout(); return">Logout</button>
        <a md-button routerLink="/beer-list" routerLinkActive="active">Beer List</a>
      </md-card-content>
    </md-card>

    <sp-authport></sp-authport>`
})
export class MainComponent implements OnInit {
  user$: Observable<Account | boolean>;

  constructor(private stormpath: Stormpath, private router: Router) {
  }

  ngOnInit() {
    this.user$ = this.stormpath.user$;
    this.user$.subscribe(data => {
      if (data) {
        this.router.navigate(['/login']);
      }
    });
  }

  logout(): void {
    this.stormpath.logout();
  }
}
