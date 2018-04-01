
export const enum ToDoState {
    PENDING,
    SUCCESS,
    FAIL
}

export interface ToDoResult<T> {
    state: ToDoState;
    data?: T;
    err?: Error;
}

export class ToDo<Ti, To> {
    private _gen: IterableIterator<Ti>;
    private _results: ToDoResult<To>[];

    public get results() { return this._results; }

    public dispatch(): Promise<{ end: boolean, data?: Ti, result?: ToDoResult<To> }> {
        const ret = this._gen.next();
        if (ret.done) return Promise.resolve({ end: true });
        else {
            const result: ToDoResult<To> = {
                state:ToDoState.PENDING
            };
            this._results.push(result);
            return Promise.resolve({ end: false, data: ret.value, result: result });
        }
    }

    constructor(gen: IterableIterator<Ti>) {
        this._results = [];
        this._gen = gen;
    }
}
