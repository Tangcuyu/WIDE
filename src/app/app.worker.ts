import { AngularWebWorker, bootstrapWorker, OnWorkerInit } from 'angular-web-worker';
import { Subject } from 'rxjs';
/// <reference lib="webworker" />

@AngularWebWorker()
export class AppWorker implements OnWorkerInit {
    private event: Subject<any>;
    private data: any;

    constructor() {}

   async onWorkerInit() {
        this.event = new Subject<any>();
        const resp = await fetch('http://www.sina.com.cn');
        this.data = await resp.json();
    }

}
bootstrapWorker(AppWorker);
