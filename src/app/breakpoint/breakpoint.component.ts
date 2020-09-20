import { Component, OnInit, ViewChild } from '@angular/core';

import { FilechunkService } from '../core/filechunk.service';
import { Chunk, Status, Container } from '../models/model';



@Component({
  selector: 'zsim-breakpoint',
  templateUrl: './breakpoint.component.html',
  styleUrls: ['./breakpoint.component.scss']
})
export class BreakpointComponent implements OnInit {
  @ViewChild('file', { static: false }) file;
  public chunks = [];
  public container: Container = new Container();
  public chunkSize = 1 * 1024 * 1024;
  public hashPercentage: number;

  constructor(private fileChunkService: FilechunkService) { }

  ngOnInit(): void {
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

  // public cubeWidth() {
  //   const cubewidth = Math.ceil(Math.sqrt(this.chunks.length)) * 16;
  //   console.log(cubewidth);
  //   return  {width: cubewidth + 'px'};
  // }

}
