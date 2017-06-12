import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { BeerListComponent } from './beer-list/beer-list.component';
import { BeerService } from './shared/beer/beer.service';
import { GiphyService } from './shared/giphy/giphy.service';
import { MaterialModule } from '@angular/material';
import { AppShellModule } from '@angular/app-shell';
import { OAuthModule } from 'angular-oauth2-oidc';
import { HomeComponent } from './home/home.component';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './shared/auth/auth.guard';
import { StormpathConfiguration, StormpathModule } from 'angular-stormpath';

const appRoutes: Routes = [
  { path: 'beer-list', component: BeerListComponent, canActivate: [AuthGuard] },
  { path: 'home', component: HomeComponent },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', redirectTo: 'home' }
];

export function stormpathConfig(): StormpathConfiguration {
  const spConfig: StormpathConfiguration = new StormpathConfiguration();
  spConfig.endpointPrefix = 'http://localhost:8080';
  spConfig.autoAuthorizedUris.push(new RegExp(spConfig.endpointPrefix + '/*'));
  return spConfig;
}

@NgModule({
  declarations: [
    AppComponent,
    BeerListComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    MaterialModule,
    AppShellModule.runtime(),
    OAuthModule.forRoot(),
    RouterModule.forRoot(appRoutes),
    StormpathModule
  ],
  providers: [BeerService, GiphyService, AuthGuard,
    {
      provide: StormpathConfiguration, useFactory: stormpathConfig
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
