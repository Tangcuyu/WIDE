import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry, map } from 'rxjs/operators';
import { ApiProvider } from './api.service';
import { AppConst, UploadVerifyResponse } from '../models/model';
import { environment } from '../../environments/environment';

// TODO: This is prepare for the i18n
import {extractComponentInlineTemplate} from '@biesbjerg/ngx-translate-extract/dist/utils/utils';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  // 获取环境配置文件中的参数：后台API路径
  private storeApiPath: string = environment.storeApiPath;

  constructor(public apiProvider: ApiProvider) { }

  // 验证上传的文件和HASH是否已经在服务器端存在，如果已经存在就是秒传
  public verifyUpload(filename: string, fileHash: string): Observable<UploadVerifyResponse>  {
    const verifyUploadUrl = this.storeApiPath + AppConst.STORE_API_PATHS.verifyUpload;
    const data = JSON.stringify({filename, fileHash});
    console.log(data);
    return this.apiProvider.httpPost(verifyUploadUrl, data , httpOptions)
    .pipe(
      catchError(this.handelError)
    );
  }

  private handelError(err: HttpErrorResponse | any) {
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
