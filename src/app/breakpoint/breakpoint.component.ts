import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
//  引入angular-web-worker用于计算大文件切片的hash值
import { AppWorker } from '../app.worker';
import { WorkerManager, WorkerClient } from 'angular-web-worker/angular';

import { ChunkStatus, Status, Container } from '../models/model';
import { FilechunkService } from '../core/filechunk.service';
import { Observable, of, Subscription } from 'rxjs';

@Component({
  selector: 'zsim-breakpoint',
  templateUrl: './breakpoint.component.html',
  styleUrls: ['./breakpoint.component.scss']
})
export class BreakpointComponent implements OnInit, OnDestroy{
  @ViewChild('file', { static: false }) file;
  public status: Status = Status.Normal;
  public container: Container = new Container();
  public chunkSize = 2 * 1024 * 1024;
  private client: WorkerClient<AppWorker>;

  constructor(private fileChunkService: FilechunkService, private workerManager: WorkerManager) { }

  ngOnInit() {
    if (this.workerManager.isBrowserCompatible) {
      this.client = this.workerManager.createClient(AppWorker);
    } else {
      // 如果浏览器不兼容web worker，那么在worker中的代码就运行在主线程中
      this.client = this.workerManager.createClient(AppWorker, true);
    }
  }

  // 在文件选择框中把选择的文件放入 container 属性中；
  public handleFileChange() {
    this.status = Status.WaitHash;
    const [selectedfile] = this.file.nativeElement.files;
    if (!selectedfile) {
      return;
    }
    this.container.fileChunks = [];
    this.container.hash = [];
    this.container.chunkstatus.hash = '';
    this.container.chunkstatus.progress = 0;
    // this.container = new Container();
    this.container.file = selectedfile;
    console.log(this.container);
  }

  // 对选择的文件进行切片
  public async handleSlice() {
    if (!this.container.file) {
      return;
    }
    this.container.fileChunks = await this.fileChunkService.createFileChunk(this.container.file, this.chunkSize);
    console.log(this.container);
  }

  public async hashCalculate() {
    if (this.container.fileChunks.length === 0) {
      return;
    }
    if (this.status === Status.WaitHash) {
      this.status =  await this.createWorker();
    }
    console.log(this.container);
  }

  // 使用web worker计算每个切片及整个文件的HASH值
  async createWorker() {
    const arrh = [];
    await this.client.connect();
    await this.client.call(w => w.calculatefileHash(this.container.fileChunks));
    await this.client.subscribe(w => w.event, (no) => {
      this.container.chunkstatus.progress = no.percentage;
      this.container.chunkstatus.hash = no.hash;
      arrh.push(no.hash);
    });
    this.container.hash = arrh;
    return Status.Normal;
  }

  public handleResume() {

  }

  public handlePause() {

  }


  // 处理上传文件按钮点击事件
  public async handleUpload() {
    // console.log(this.fileChunkService.hashPercentage);
    // await this.handleSlice();

  }

  public getChunkClass(chunk: ChunkStatus) {
    return {
      uploading: chunk.progress > 0 && chunk.progress < 100,
      success: chunk.progress === 100,
      error: chunk.progress < 0,
    };
  }

  public getChunkStyle(chunk: ChunkStatus) {
    if (!chunk.progress) {
      return;
    }
    chunk.progress = 100;
    return {
      height: chunk.progress,
      color: '#9be9a8'
    };
  }


  ngOnDestroy() {
    this.client.destroy();
  }

}
