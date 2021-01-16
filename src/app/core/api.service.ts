import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs/';
import 'rxjs/add/operator/catch';

@Injectable({
  providedIn: 'root'
})
export class ApiProvider {

  constructor(private http: HttpClient) { }

  httpGet<T>(url, options?: any): Observable<T> {
    return this.http
      .get<T>(url, options)
      .catch(err => {
        console.log('httpGet error:', err);
        return this.handleNetworkErrors(err);
      });
  }

  /**
   * Performs a request with `post` http method.
   */
  httpPost(url, body: any, options?: any): Observable<any> {

    return this.http
      .post(url, body, options)
      .catch(err => {
        return this.handleNetworkErrors(err);
      });
  }

  /**
   * Performs a request with `put` http method.
   */
  httpPut(url, body: any, options?: any): Observable<any> {
    return this.http
      .put(url, body, options)
      .catch(err => {
        return this.handleNetworkErrors(err);
      });
  }

  /**
   * Performs a request with `delete` http method.
   */
  httpDelete(url, options?: any): Observable<any> {
    return this.http
      .delete(url, options)
      .catch(err => {
        return this.handleNetworkErrors(err);
      });
  }

  /**
   * Handles all the network errors from the Http methods
   */
  handleNetworkErrors(errObject: HttpErrorResponse): Observable<any> {
    return throwError({
      status: errObject.status,
      body: errObject.error
    });
  }

}

