import { Injectable } from '@angular/core';
import SparkMD5 from 'spark-md5';

@Injectable({
  providedIn: 'root'
})
export class FilechunkService {

  constructor() { }

  // 对文件进行切片
  public createFileChunk(file: any, sliceSize: number): Array<Blob> {
    const fileChunkList = [];
    let cur = 0;
    while (cur < file.size) {
      fileChunkList.push({
        file: file.slice(cur, cur + sliceSize)
      });
      cur += sliceSize;
    }
    return fileChunkList;
  }

  // 利用window.requestIdleCallback()方法对切片进行Hash计算
  public async calculateFileHashIdle() {}
}
