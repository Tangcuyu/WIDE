import { ApiProvider } from './api.service';
import { AppConst, UploadFormData, UploadVerifyResponse, UploadChunkResponse } from '../models/model';
import { catchError, retry, map, concatMap, mergeMap, mergeAll, last, tap, count, filter } from 'rxjs/operators';
import { debug } from './debug.service';
import { environment } from '../../environments/environment';
import { HttpErrorResponse, HttpHeaders, HttpEventType, HttpResponse, HttpEvent, HttpRequest, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MessageService } from './message.service';
import { Observable, throwError, Subject, of, from, concat, pipe} from 'rxjs';
import { UploadData, Container } from './../models/model';


// TODO: This is prepare for the i18n
import { extractComponentInlineTemplate } from '@biesbjerg/ngx-translate-extract/dist/utils/utils';

const httpOptions = {
  reportProgress: true,
  responseType: 'text'
};

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  // 获取环境配置文件中的参数：后台API路径
  private storeApiPath: string = environment.storeApiPath;
  private verifyUploadUrl = this.storeApiPath + AppConst.STORE_API_PATHS.verifyUpload;
  private concurrency = 3;

  constructor(public apiProvider: ApiProvider, private http: HttpClient) { }

  public upload(container: Container): Observable<string> {
    const source$ = from(container.fileChunks);
    const uploadStream$ = source$.pipe(
      // map( () =>  this.verifyUpload(container)),
      map((d, i) => this.prepareUploadData(container, d.file, i)),
      mergeMap((formData) => {
        return this.uploadChunk(formData);
      }),
      // mergeAll(this.concurrency)
    );
    const mergeChunks$ = this.mergeRequest(container);

    return concat(uploadStream$, mergeChunks$);
  }

  // 上传切片
  public uploadChunk(chunk: FormData): Observable<string> {
    const chunkUploadUrl = this.storeApiPath + AppConst.STORE_API_PATHS.chunkUpload;
    return this.apiProvider.httpPost(chunkUploadUrl, chunk, httpOptions);
    // this will be the our resulting map
    // const status: UploadChunkResponse = {};
    // httpOptions.headers = httpOptions.headers.set('Content-Type',  'multipart/form-data');
    // const req = new HttpRequest('POST', chunkUploadUrl, chunk, {
    //   reportProgress: true
    // });

    // console.log(req.detectContentTypeHeader());

    // return this.http.request(req);
    // // const progress = new Subject<number>();
    // const chunkUpload$ = this.http.request(req).pipe(
    //   map((): UploadChunkResponse => {
    //     return;
    //   }),
    // );
    // .subscribe(
    //   (event) => {
    //     if (event.type === HttpEventType.UploadProgress) {
    //       // calculate the progress percentage

    //       const percentDone = Math.round((100 * event.loaded) / event.total);
    //       // pass the percentage into the progress-stream
    //       progress.next(percentDone);
    //     } else if (event instanceof HttpResponse) {
    //       // Close the progress-stream if we get an answer form the API
    //       // The upload is complete
    //       progress.complete();
    //     }
    //   });
    // return chunkUpload$;
  }

  // 向服务器发送合并切片的请求
  public mergeRequest(container: Container): Observable<string> {
    const chunkMergeUrl = this.storeApiPath + AppConst.STORE_API_PATHS.chunkMerge;
    return this.apiProvider.httpPost(chunkMergeUrl, {
      filename: container.file.name,
      size: container.chunkstatus.chunkSize,
      fileHash: container.chunkstatus.hash
    });
  }

  /*
  * 验证上传的文件和HASH是否已经在服务器端存在，如果已经存在就是秒传
  * 上传前的检查：根据HASH+文件扩展名，检查是否该文件已经上传过，如果已经上传过，那么就是秒传。
  * 如果没有上传过，从服务器获取已经上传的切片列表
  */

  private verifyUpload(container: Container): Observable<UploadVerifyResponse> {
    const filename = container.file.name;
    const hash = container.chunkstatus.hash;
    const data = JSON.stringify({ filename, hash });
    return this.apiProvider.httpPost(this.verifyUploadUrl, data)
      .pipe(
        catchError(this.handleError)
      );
  }

  private prepareUploadData(container: Container, chunk: Blob, index: number): FormData {
    const result = new FormData();
    result.append('filename', container.file.name);
    result.append('fileHash', container.chunkstatus.hash);
    result.append('hash', container.chunkstatus.hash + '-' + index);
    result.append('chunk', chunk);
    return result;
  }

  // private filterChunks(data: UploadData[], uploadedList: string[]): Observable<UploadData[]> {
  //   const requestList = data.filter(chunk => uploadedList.indexOf(chunk.chunkName) === -1);
  //   return of(requestList);
  // }

  // 生成上传表单数据

  // 通过队列来控制并发上传到服务器的切片数量
  private sendRequest() { }

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
