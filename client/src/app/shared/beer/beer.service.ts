import { Injectable } from '@angular/core';
import { Http, RequestOptions, Response, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs';
import { OAuthService } from 'angular-oauth2-oidc';

@Injectable()
export class BeerService {

  constructor(private http: Http, private oauthService: OAuthService) {
  }

  getAll(): Observable<any> {
    const headers: Headers = new Headers();
    headers.append('Authorization', this.oauthService.authorizationHeader());

    const options = new RequestOptions({ headers: headers });

    return this.http.get('http://localhost:8080/good-beers', options)
      .map((response: Response) => response.json());
  }
}
