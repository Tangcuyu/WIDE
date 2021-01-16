import { AngularWebWorker, bootstrapWorker, OnWorkerInit, Accessable, Callable, Subscribable } from 'angular-web-worker';
import { Subject } from 'rxjs';
import SparkMD5 from 'spark-md5';

/// <reference lib="webworker" />
export interface Wdata {
    percentage: number;
    hash: string;
}

@AngularWebWorker()
export class AppWorker implements OnWorkerInit {

    @Accessable() percentage: number;
    // @Subscribable() event: BehaviorSubject<number[]>;
    @Subscribable() event: Subject<Wdata>;
    @Accessable() data: any = {
        percentage: 0,
        chunks: '',
        hash: ''
    };

    constructor() { }

    onWorkerInit() {
        this.event = new Subject();
    }

    @Callable({ shallowTransfer: true })
    async calculatefileHash(chunks: Array<any>): Promise<any> {
        const spark = new SparkMD5.ArrayBuffer();
        let count = 0;
        let per = 0;

        const loadNext = (index): any => {
            const reader = new FileReader();
            reader.readAsArrayBuffer(chunks[index].file);
            reader.onload = (e) => {
                count++;
                spark.append(e.target.result);
                if (count === chunks.length) {
                    this.event.next({
                        percentage: 100,
                        hash: spark.end()
                    });
                } else {
                    per += 100 / chunks.length;
                    this.event.next({
                        percentage: per,
                        hash: spark.end()
                    });
                    loadNext(count);
                }
            };
        };
        loadNext(0);
    }

}
bootstrapWorker(AppWorker);
