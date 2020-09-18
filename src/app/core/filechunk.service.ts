import { Injectable } from '@angular/core';

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
}
