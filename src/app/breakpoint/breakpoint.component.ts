import { Component, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'zsim-breakpoint',
  templateUrl: './breakpoint.component.html',
  styleUrls: ['./breakpoint.component.scss']
})
export class BreakpointComponent implements OnInit {
  @ViewChild('file', { static: false }) file;

  constructor() { }

  ngOnInit(): void {
  }

  public handleFileChange() {
    const files: { [key: string]: File } = this.file.nativeElement.files;
    console.log(files);
  }

  public handleResume() {

  }

  public handleUpload() {

  }

  

}
