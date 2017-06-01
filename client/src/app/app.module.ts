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
import { HomeComponent } from "app/home/home.component";
import { AuthGuard } from './shared/auth/auth.guard.service';
import { RouterModule, Routes } from '@angular/router';
import { StormpathConfiguration, StormpathModule } from 'angular-stormpath';
import { MainComponent } from './main/main.component';

const appRoutes: Routes = [
  { path: 'beer-list', component: BeerListComponent, canActivate: [AuthGuard] },
  { path: 'login', component: MainComponent},
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];

export function stormpathConfig(): StormpathConfiguration {
  let spConfig: StormpathConfiguration = new StormpathConfiguration();
  spConfig.endpointPrefix = 'http://localhost:8080';
  spConfig.autoAuthorizedUris.push(new RegExp(spConfig.endpointPrefix + '/*'));
  return spConfig;
}

@NgModule({
  declarations: [
    AppComponent,
    BeerListComponent,
    HomeComponent,
    MainComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    MaterialModule,
    AppShellModule.runtime(),
    RouterModule.forRoot(appRoutes),
    OAuthModule.forRoot(),
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
