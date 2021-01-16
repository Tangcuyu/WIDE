import { Observable } from 'rxjs';

export enum Status {
  Normal,
  WaitHash,
  Busy,
  Pause,
  Uploading,
  Error,
  Done,
}


export class Container {
  constructor(
    public file: File = null,
    public fileChunks: {file: Blob}[] = [],
    public files: File[] = [],
    public chunkstatus: ChunkHashStatus = new ChunkHashStatus(),
    public hash: string[] = [],
    public uploadchunkres: UploadChunkResponse = {},
    public worker: Worker = null,
  ) {}
}

export interface UploadData {
  filename: string;
  fileHash: string;
  hash: string;
  chunk: Blob;
}

export interface UploadVerifyResponse {
  uploaded: boolean;
  uploadedList: string[];
}

export interface UploadChunkResponse {
  [key: string]: { progress: Observable<number> };
}

export interface UploadFormData {
  formData: FormData;
}

export class ChunkHashStatus {
  constructor(
    public progress: number = 0,
    public hash = '',
    public chunkSize = 0
  ) {}
}



export class AppConst {
  public static readonly STORE_API_PATHS = {
      verifyUpload: '/verify',
      chunkUpload: '/upload',
      chunkMerge: '/merge'
  };
}
