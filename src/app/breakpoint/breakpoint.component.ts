import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
//  引入angular-web-worker用于计算大文件切片的hash值
import { AppWorker } from '../app.worker';
import { WorkerManager, WorkerClient } from 'angular-web-worker/angular';

import { FilechunkService } from '../core/filechunk.service';
import { Chunk, Status, Container } from '../models/model';
import { Observable } from 'rxjs';

@Component({
  selector: 'zsim-breakpoint',
  templateUrl: './breakpoint.component.html',
  styleUrls: ['./breakpoint.component.scss']
})
export class BreakpointComponent implements OnInit, OnDestroy{
  @ViewChild('file', { static: false }) file;
  public chunks = [];
  public container: Container = new Container();
  public chunkSize = 2 * 1024 * 1024;
  public hashPercentage: number;
  private client: WorkerClient<AppWorker>;
  private subscription: Subscription;
  private observable$: Observable<number>;



  constructor(private fileChunkService: FilechunkService, private workerManager: WorkerManager) { }

  ngOnInit() {
    if (this.workerManager.isBrowserCompatible) {
      this.client = this.workerManager.createClient(AppWorker);
      console.log('worker support');
    } else {
      // 如果浏览器不兼容web worker，那么在worker中的代码就运行在主线程中
      this.client = this.workerManager.createClient(AppWorker, true);
    }
  }

  ngOnDestroy() {
    this.client.destroy();
  }

  async createWorker() {
    await this.client.connect();
    await this.client.call(w => w.calculatefileHash(this.chunks));
    await this.client.subscribe(w => w.event, (no) => {
      this.hashPercentage = no.percentage;
      this.container.hash = no.hash;
      console.log(no);
    });
    // await this.client.set(w => w.chunks, ['test']);
    // const wr = this.client.get(w => w.chunks);
  }

  // 在文件选择框中把选择的文件放入 container 属性中；
  public handleFileChange() {
    const [selectedfile] = this.file.nativeElement.files;
    if (!selectedfile) {
      return;
    }
    this.container.file = selectedfile;
  }

  public handleResume() {

  }

  public async handleSlice() {
    if (!this.container.file) {
      return;
    }
    this.chunks = await this.fileChunkService.createFileChunk(this.container.file, this.chunkSize);
    this.createWorker();
  }

  // 处理上传文件按钮点击事件
  public async handleUpload() {
    // console.log(this.fileChunkService.hashPercentage);
    // await this.handleSlice();

  }

  public getChunkClass(chunk: Chunk) {
    return {
      uploading: chunk.progress > 0 && chunk.progress < 100,
      success: chunk.progress === 100,
      error: chunk.progress < 0,
    };
  }

  public getChunkStyle(chunk: Chunk) {
    if (!chunk.progress) {
      return;
    }
    chunk.progress = 100;
    return {
      height: chunk.progress,
    };
  }

}
