import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { OAuthService } from 'angular-oauth2-oidc';

@Injectable()
export class BeerService {

  constructor(private http: HttpClient, private oauthService: OAuthService) {}

  getAll(): Observable<any> {
    return this.http.get('https://localhost:8080/good-beers', {headers: this.getHeaders()});
  }

  getHeaders(): HttpHeaders {
    return new HttpHeaders().set('Authorization', this.oauthService.authorizationHeader());
  }
}
