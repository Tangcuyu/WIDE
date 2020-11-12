import { Injectable } from '@angular/core';
import SparkMD5 from 'spark-md5';

import { Container, ChunkHashStatus } from '../models/model';

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
  public async calculateFileHashIdle(chunks: Array<any>, hashPercentage: number): Promise<string> {
    return new Promise(resolve => {
      const spark = new SparkMD5.ArrayBuffer();
      let count = 0;

      // 文件切片加入SparkMD5中，进行HASH计算
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

      /*
        deadline是一个IdleDeadline接口类型的参数。IdleDeadline 接口用作通过调用 Window.requestIdleCallback()
        建立的空闲回调的输入参数的数据类型。它提供了一个方法 timeRemaining()，
        它可以让您确定用户代理估计它将保持空闲多长时间，还提供了一个属性 didTimeout，
        它可以让你确定你的回调是否正在执行，因为它未到的超时持续时间。
      */
      const workLoop = async (deadline) => {
        // 当有chunks数组中还有需要进行Hash处理的切片任务，并且当前帧还没结束时
        while (count < chunks.length && deadline.timeRemaining() > 1) {
          await appendToSpark(chunks[count].file);
          count ++;

          // 检查切片是否计算完毕时
          if (count < chunks.length) {
            hashPercentage = Number((( 100 * count ) / chunks.length).toFixed(2));
          } else {
            hashPercentage = 100;
            resolve(spark.end());
          }
        }
        // const handle = Window.requestIdleCallback();
      };
      // window.requestIdleCallback(workLoop);
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

  /* 同步计算文件的Hash */
  public calculateFileHashSync(chunks: Array<any>, hashPercentage: number): Promise<any> {
    return new Promise((resolve) => {
      const spark = new SparkMD5.ArrayBuffer();
      let count = 0;

      const loadNext = (index) => {
        const reader = new FileReader();
        reader.readAsArrayBuffer(chunks[index].file);
        reader.onload = (e) => {
          count++;
          spark.append(e.target.result);

          if (count === chunks.length) {
            const hash = spark.end();
            hashPercentage = 100;
            resolve({hash, hashPercentage});
          } else {
            hashPercentage +=  100 / chunks.length;
            loadNext(count);
          }
        };
      };
      loadNext(0);
    });
  }
}
