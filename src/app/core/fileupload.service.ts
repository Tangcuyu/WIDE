import { UploadData, Container } from './../models/model';
import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpHeaders, HttpClient, HttpRequest, HttpEventType, HttpResponse, HttpEvent } from '@angular/common/http';
import { Observable, throwError, Subject, of, from } from 'rxjs';
import { catchError, retry, map, } from 'rxjs/operators';
import { ApiProvider } from './api.service';
import { AppConst, UploadFormData, UploadVerifyResponse, UploadChunkResponse } from '../models/model';
import { environment } from '../../environments/environment';

// TODO: This is prepare for the i18n
import { extractComponentInlineTemplate } from '@biesbjerg/ngx-translate-extract/dist/utils/utils';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'multipart/form-data'
  })
};


@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  // 获取环境配置文件中的参数：后台API路径
  private storeApiPath: string = environment.storeApiPath;
  private verifyUploadUrl = this.storeApiPath + AppConst.STORE_API_PATHS.verifyUpload;



  constructor(public apiProvider: ApiProvider, private http: HttpClient) { }

  // 验证上传的文件和HASH是否已经在服务器端存在，如果已经存在就是秒传
  // 上传前的检查：根据HASH+文件扩展名，检查是否该文件已经上传过，如果已经上传过，那么就是秒传。如果没有上传过，从服务器获取已经上传的切片列表

  public verifyUpload(filename: string, hash: string): Observable<UploadVerifyResponse> {
    const data = JSON.stringify({ filename, hash });
    return this.apiProvider.httpPost(this.verifyUploadUrl, data)
      .pipe(
        catchError(this.handleError)
      );
  }

  // public prepareUploadData(container: Container, uploadedList: string[]): Observable<UploadData[]> {
  //   return of(container.fileChunks.map(({ file }, index): UploadData => {
  //     return {
  //       filename: container.file.name,
  //       fileHash: container.chunkstatus.hash,
  //       chunkIndex: index,
  //       chunkHash: container.chunkstatus.hash + '-' + index,
  //       chunk: file,
  //       chunkSize: file.size,
  //       percentage: uploadedList.includes(container.chunkstatus.hash + '-' + index) ? 100 : 0,
  //     };
  //   }));
  // }

  public filterChunks(data: UploadData[], uploadedList: string[]): Observable<UploadData[]> {
    const requestList = data.filter(chunk => uploadedList.indexOf(chunk.chunkHash) === -1);
    return of(requestList);
  }

  // 生成上传表单数据
  public createformData(data: UploadData[]): Observable<UploadFormData[]> {
    const reqFormDataList: UploadFormData[] = data.map((d) => {
      const result: UploadFormData = {
        formData: new FormData(),
        filename: '',
        chunkHash: ''
      };
      result.filename = d.filename;
      result.chunkHash = d.chunkHash;
      result.formData.append('filename', d.filename);
      result.formData.append('fileHash', d.fileHash);
      result.formData.append('hash', d.chunkHash);
      result.formData.append('chunk', d.chunk);
      return result;
    });
    return of(reqFormDataList);
  }

  // 上传切片
  public uploadChunk(chunk: UploadFormData): Observable<UploadChunkResponse> {
    const chunkUploadUrl = this.storeApiPath + AppConst.STORE_API_PATHS.chunkUpload;
    // this will be the our resulting map
    const status: UploadChunkResponse = {};
    const req = new HttpRequest('POST', chunkUploadUrl, chunk.formData, {
      reportProgress: true,
      responseType: 'text'
    });
    const progress = new Subject<number>();

    this.http.request(req).subscribe(
      (event) => {
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
    status[chunk.chunkHash] = {
      progress: progress.asObservable()
    };
    return of(status);
  }


  // 通过队列来控制并发上传到服务器的切片数量
  public sendRequest() { }

  // 向服务器发送合并切片的请求
  public mergeRequest(container: Container, chunksize: number): Observable<string> {
    const chunkMergeUrl = this.storeApiPath + AppConst.STORE_API_PATHS.chunkMerge;
    return this.apiProvider.httpPost(chunkMergeUrl, {
      filename: container.file.name,
      size: chunksize,
      fileHash: container.chunkstatus.hash
    });
  }

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
