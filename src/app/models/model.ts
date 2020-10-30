import { Observable } from 'rxjs';

export interface UploadVerifyResponse {
  uploaded: boolean;
  uploadedList: string[];
}

export interface UploadChunkResponse {
  [key: string]: { progress: Observable<number> };
}

export interface UploadData {
  filename: string;
  fileHash: string;
  chunkIndex: number;
  chunkHash: string;
  chunk: Blob;
  chunkSize: number;
  percentage: number;
}

export interface UploadFormData {
  formData: FormData;
  filename: string;
  chunkHash: string;
}

export class ChunkStatus {
  constructor(
    public progress: number = 0,
    public hash = ''
  ) {}
}

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
    public fileChunks: Blob[] = [],
    public files: File[] = [],
    public chunkstatus: ChunkStatus = new ChunkStatus(),
    public hash: string[] = [],
    public uploadchunkres: UploadChunkResponse = {},
    public worker: Worker = null,
  ) {}
}

export class AppConst {
  public static readonly STORE_API_PATHS = {
      verifyUpload: '/verify',
      chunkUpload: '/upload',
      chunkMerge: '/merge'
  };
}
