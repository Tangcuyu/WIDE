import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
//  引入angular-web-worker用于计算大文件切片的hash值
import { AppWorker } from '../app.worker';
import { WorkerManager, WorkerClient } from 'angular-web-worker/angular';

import { FilechunkService } from '../core/filechunk.service';
import { Chunk, Status, Container } from '../models/model';

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

  // 处理上传文件按钮点击事件
  public async handleUpload() {
    if (!this.container.file) {
      return;
    }
    this.chunks = this.fileChunkService.createFileChunk(this.container.file, this.chunkSize);
    console.log(this.chunks);
    await this.fileChunkService.calculateFileHashIdle(this.chunks);
    // console.log(this.fileChunkService.hashPercentage);
    // this.hashPercentage = this.fileChunk.hashPercentage;
    await this.createWorker();

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
