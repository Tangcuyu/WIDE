import { Injectable } from '@angular/core';
import {pipe} from 'rxjs/index';
import {environment} from '../../environments/environment';
import {tap} from 'rxjs/internal/operators';

@Injectable({
  providedIn: 'root'
})
export class DebugService {

  constructor() { }

}

export const debug = (message: string) => pipe(
  tap(
    (next) => {
      if (!environment.production) {
        console.log(message, next);
      }
    },
    (err) => {
      if (!environment.production) {
        console.error('ERROR >>', message, err);
      }
    },
    () => {
      if (!environment.production) {
        console.log('Completed - ');
      }
    }
  )
);
