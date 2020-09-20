export class Chunk {
  constructor(
    public progress: number = 0,
    public hash = ''
  ) {}
}

export enum Status {
  Wait,
  Pause,
  Uploading,
  Error,
  Done,
}

export class Container {
  constructor(
    public file: File = null,
    public hash: string = '',
    public worker: Worker = null,
  ) {}
}
