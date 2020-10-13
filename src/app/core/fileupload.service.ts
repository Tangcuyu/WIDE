import { UploadData, Container } from './../models/model';
import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpHeaders, HttpClient, HttpRequest, HttpEventType, HttpResponse } from '@angular/common/http';
import { Observable, throwError, Subject, of } from 'rxjs';
import { catchError, retry, map } from 'rxjs/operators';
import { ApiProvider } from './api.service';
import { AppConst, UploadVerifyResponse } from '../models/model';
import { environment } from '../../environments/environment';

// TODO: This is prepare for the i18n
import { extractComponentInlineTemplate } from '@biesbjerg/ngx-translate-extract/dist/utils/utils';
import { error, promise } from 'protractor';

const httpOptions = {
  headers: new HttpHeaders({})
};


@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  // 获取环境配置文件中的参数：后台API路径
  private storeApiPath: string = environment.storeApiPath;

  constructor(public apiProvider: ApiProvider, private http: HttpClient) { }

  // 验证上传的文件和HASH是否已经在服务器端存在，如果已经存在就是秒传
  public verifyUpload(filename: string, hash: string): Observable<UploadVerifyResponse> {
    const verifyUploadUrl = this.storeApiPath + AppConst.STORE_API_PATHS.verifyUpload;
    const data = JSON.stringify({ filename, hash });
    return this.apiProvider.httpPost(verifyUploadUrl, data)
      .pipe(
        catchError(this.handleError)
      );
  }

  public prepareUploadData(container: Container, uploadedList: any): Observable<UploadData[]> {
    const uploadData =  container.fileChunks.map(({ file }, index): UploadData => {
      return {
        filename: container.file.name,
        fileHash: container.chunkstatus.hash,
        chunkIndex: index,
        chunkHash: container.hash[index] + '-' + index,
        chunk: file,
        chunkSize: file.size,
        percentage: uploadedList.includes(index) ? 100 : 0,
      };
    });

    return of(uploadData);
  }

  // 上传切片，同时过滤掉已经上传的切片
  public uploadChunks(data: UploadData[], uploadedList?: string[]): { [key: string]: { progress: Observable<number> } } {
    const chunkUploadUrl = this.storeApiPath + AppConst.STORE_API_PATHS.chunkUpload;
    const requestList = data
      .filter(chunk => uploadedList.indexOf(chunk.chunkHash) === -1)
      .map(({ filename, fileHash, chunk, chunkHash, chunkIndex }) => {
        const formData = new FormData();
        formData.append('filename', filename);
        formData.append('fileHash', fileHash);
        formData.append('hash', chunkHash);
        formData.append('chunk', chunk);
        return { formData, filename, chunkIndex };
      });
    const status: { [key: string]: { progress: Observable<number> } } = {};

    try {
      console.log(requestList);
      requestList.forEach(file => {
        // create a http-post request and pass the form
        // tell it to report the upload progress
        const req = new HttpRequest('POST', chunkUploadUrl, file.formData, {
          reportProgress: true
        });
        // create a new progress-subject for every file
        const progress = new Subject<number>();

        // send the http-request and subscribe for progress-updates
        const startTime = new Date().getTime();
        this.http.request(req).subscribe(event => {
          if (event.type === HttpEventType.UploadProgress) {
            // calculate the progress percentage

            const percentDone = Math.round((100 * event.loaded) / event.total);
            // pass the percentage into the progress-stream
            progress.next(percentDone);
          } else if (event instanceof HttpResponse) {
            // Close the progress-stream if we get an answer form the API
            // The upload is complete
            progress.complete();
          }
        });

        // Save every progress-observable in a map of all observables
        status[file.filename] = {
          progress: progress.asObservable()
        };
      });

      // return the map of progress.observables
      return status;

    } catch (error) {
      console.log(error);
    }
  }

  // public uploadFiles(files: Set<File>): { [key: string]: { progress: Observable<number> } } {
  //   const chunkUploadUrl = this.storeApiPath + AppConst.STORE_API_PATHS.chunkUpload;
  //   // this will be the our resulting map
  //   const status: { [key: string]: { progress: Observable<number> } } = {};

  //   files.forEach(file => {
  //     // create a new multipart-form for every file
  //     const formData: FormData = new FormData();
  //     formData.append('file', file, file.name);

  //     // create a http-post request and pass the form
  //     // tell it to report the upload progress
  //     const req = new HttpRequest('POST', chunkUploadUrl, formData, {
  //       reportProgress: true
  //     });

  //     // create a new progress-subject for every file
  //     const progress = new Subject<number>();

  //     // send the http-request and subscribe for progress-updates

  //     const startTime = new Date().getTime();
  //     this.http.request(req).subscribe(event => {
  //       if (event.type === HttpEventType.UploadProgress) {
  //         // calculate the progress percentage

  //         const percentDone = Math.round((100 * event.loaded) / event.total);
  //         // pass the percentage into the progress-stream
  //         progress.next(percentDone);
  //       } else if (event instanceof HttpResponse) {
  //         // Close the progress-stream if we get an answer form the API
  //         // The upload is complete
  //         progress.complete();
  //       }
  //     });

  //     // Save every progress-observable in a map of all observables
  //     status[file.name] = {
  //       progress: progress.asObservable()
  //     };
  //   });

  //   // return the map of progress.observables
  //   return status;
  // }


  private handleError(err: HttpErrorResponse | any) {
    const translateNetworkErr = extractComponentInlineTemplate('发生客户端或网络错误');
    const translate401Err = extractComponentInlineTemplate('您输入的电子邮件和密码无效。');
    const translate403Err = extractComponentInlineTemplate('服务器禁止： 无效CSRF');
    const translateServerErr = extractComponentInlineTemplate('服务器故障,请联系管理员');

    if (err.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it here.
      console.error('An error occurred:', err.error.message);
      return throwError(translateNetworkErr);
    } else {
      // The backend returned an unsucessful response code.
      // The response body may contain clues as to what went wrong.
      if (err.status === 401) {
        return throwError(translate401Err);
      }
      if (err.status === 403) {
        return throwError(translate403Err);
      }
      // console.error(`Backend returned code ${err.status}` + `body was: ${JSON.stringify(err.error)}`);
    }

    return throwError(translateServerErr);
  }
}
