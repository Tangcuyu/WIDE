import { Injectable } from '@angular/core';
import SparkMD5 from 'spark-md5';

import { Container, Chunk } from '../models/model';

@Injectable({
  providedIn: 'root'
})
export class FilechunkService {

  public hashPercentage: number;

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
  public async calculateFileHashIdle(chunks) {
    return new Promise(resolve => {
      const spark = new SparkMD5.ArrayBuffer();
      console.log(spark);
      const count = 0;

      const appendToSpark = async (file) => {
        return new Promise( (aresolve) => {
          const reader = new FileReader();
          reader.readAsArrayBuffer(file);
          reader.onload = (e) => {
            spark.append(e.target.result);
            aresolve();
          };
        });
      };

      const workLoop = () => {};
    });
  }

  /**
   * 利用worker进行切片的Hash计算
   */
  public calculateFileHashWorker(chunks: any, container: Container) {
    return new Promise(resolve => {
      // container.worker = new Worker('./public/hash.js');
      // container.worker.postMessage(chunks);
      // container.worker.onmessage = e => {
      //   const { percentage, hash } = e.data;
      //   this.hashPercentage = percentage;
      //   if (hash) {
      //     resolve(hash);
      //   }
      // };
    });
  }
}
