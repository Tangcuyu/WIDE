import { Component, OnInit, ViewChild } from '@angular/core';

import { FilechunkService } from '../core/filechunk.service';
import { Chunk, Status } from '../models/model';



@Component({
  selector: 'zsim-breakpoint',
  templateUrl: './breakpoint.component.html',
  styleUrls: ['./breakpoint.component.scss']
})
export class BreakpointComponent implements OnInit {
  @ViewChild('file', { static: false }) file;
  public chunks = [];
  public container = { file: File };
  public chunkSize = 1 * 1024 * 1024;

  constructor(private fileChunk: FilechunkService) { }

  ngOnInit(): void {
  }

  public handleFileChange() {
    const [file] = this.file.nativeElement.files;
    if (!file) {
      return;
    }
    this.container.file = file;
  }

  public handleResume() {

  }

  public handleUpload() {
    if (!this.container.file) {
      return;
    }
    this.chunks = this.fileChunk.createFileChunk(this.container.file, this.chunkSize);
    console.log(this.chunks);

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
