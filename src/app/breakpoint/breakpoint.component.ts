import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
//  引入angular-web-worker用于计算大文件切片的hash值
import { AppWorker } from '../app.worker';
import { WorkerManager, WorkerClient } from 'angular-web-worker/angular';

import { ChunkHashStatus, Container, Status, UploadData } from '../models/model';
import { FilechunkService } from '../core/filechunk.service';
import { FileUploadService } from '../core/fileupload.service';

@Component({
  selector: 'zsim-breakpoint',
  templateUrl: './breakpoint.component.html',
  styleUrls: ['./breakpoint.component.scss']
})
export class BreakpointComponent implements OnInit, OnDestroy {
  @ViewChild('file', { static: false }) file;

  public status: Status = Status.Normal;  // 应用的状态跟踪
  public container: Container = new Container();
  public chunkSize = 2 * 1024 * 1024; // 切片大小
  private client: WorkerClient<AppWorker>;
  private uploadData: UploadData[]; // 准备上传的数据
  private uploadedList = []; // 已经上传完成的切片列表
  private shouldUpload: boolean;

  constructor(
    private fileChunkService: FilechunkService,
    private workerManager: WorkerManager,
    private fileUploadService: FileUploadService) { }

  ngOnInit() {
    if (this.workerManager.isBrowserCompatible) {
      this.client = this.workerManager.createClient(AppWorker);
    } else {
      // 如果浏览器不兼容web worker，那么在worker中的代码就运行在主线程中
      this.client = this.workerManager.createClient(AppWorker, true);
    }
  }

  // 选择文件后，初始化container，并把在文件选择框中把选择的文件放入 container 属性中；
  public handleFileChange() {
    this.status = Status.Normal;
    const [selectedfile] = this.file.nativeElement.files;
    if (!selectedfile) {
      return;
    }
    this.container = new Container();
    this.container.file = selectedfile;
    this.container.chunkstatus.chunkSize = this.chunkSize;
  }

  // 对选择的文件进行切片
  public async handleSlice() {
    if (!this.container.file) {
      return;
    }
    this.container.fileChunks = await this.fileChunkService.createFileChunk(this.container.file, this.chunkSize);
    this.status = Status.WaitHash;
  }

  // 对切片进行HASH值计算
  public async hashCalculate() {
    if (this.container.fileChunks.length === 0) {
      return;
    }
    this.client.destroy();  // 结束上次还没停止的HASH计算
    if (this.status === Status.WaitHash) {
      this.status = await this.runWorker();
      console.log(this.container);
    }
  }

  // 使用web worker计算每个切片及整个文件的HASH值
  async runWorker() {
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

  // 处理上传
  public handleUpload() {
    if (!this.container.file) {
      return;
    }
    this.status = Status.Uploading;
    this.fileUploadService.upload(this.container).subscribe();
  }


  public handleResume() {

  }

  public handlePause() {

  }

  public handleCancel() {

  }

  public getChunkClass(chunk: ChunkHashStatus) {
    return {
      uploading: chunk.progress > 0 && chunk.progress < 100,
      success: chunk.progress === 100,
      error: chunk.progress < 0,
    };
  }

  public getChunkStyle(chunk: ChunkHashStatus) {
    if (!chunk.progress) {
      return;
    }
    chunk.progress = 100;
    return {
      height: chunk.progress,
      color: '#9be9a8'
    };
  }

  public formatLabel(value: number) {
    if (value >= 1000) {
      return Math.round(value / 1000) + 'k';
    }

    return value;
  }

  ngOnDestroy() {
    this.client.destroy();
  }

}
