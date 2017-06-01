import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Stormpath } from 'angular-stormpath';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private stormpath: Stormpath, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.stormpath.getToken()) {
      return true;
    }

    this.router.navigate(['/login']);
    return false;
  }
}
