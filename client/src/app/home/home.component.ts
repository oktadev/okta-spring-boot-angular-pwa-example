import { Component } from '@angular/core';
import { AuthPortComponent } from 'angular-stormpath';

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
export class HomeComponent extends AuthPortComponent {
}
