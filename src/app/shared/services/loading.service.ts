import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private _isLoading$ = new BehaviorSubject(false);
  isLoading$ = this._isLoading$.asObservable();

  showSpinner() {
    this._isLoading$.next(true);
  }

  hideSpinner() {
    this._isLoading$.next(false);
  }
}
