export interface Chunk {
  progress: number;
  hash?: string;
}

export enum Status {
  Wait,
  Pause,
  Uploading,
  Error,
  Done,
}
