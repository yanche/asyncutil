
export class Hub<T> {
    private readonly _fn: () => PromiseLike<T>;
    private _timeout: number;
    private _lastRunTs?: number;
    private _activePromise?: Promise<T>;

    /**
     * @return cached data timed-out or not.
     */
    public timeout(): boolean {
        return Boolean(this._timeout > 0 && this._lastRunTs && ((this._timeout + this._lastRunTs) <= Date.now()));
    }

    /**
     * invoke async function to get data.
     * @return the promise for returned data.
     */
    public get(): Promise<T> {
        if (this._activePromise && !this.timeout())
            return this._activePromise;
        else {
            this._lastRunTs = Date.now();
            return this._activePromise = new Promise<T>((res, rej) => {
                try {
                    this._fn().then(res, (err: Error) => {
                        rej(err);
                        this._lastRunTs = this._activePromise = undefined;
                    });
                }
                catch (err) {
                    // error in this._fn()
                    rej(err);
                    this._lastRunTs = this._activePromise = undefined;
                }
            });
        }
    }

    /**
     * construct a Hub instance, it will guarantee the async function (fn) will be called only once at one time.
     * to avoid traffic jam
     * @param dataFetchFn A function to fetch data.
     * @param timeoutInMs The timeout of cached data in ms, use 0 for never timeout.
     */
    constructor(dataFetchFn: () => PromiseLike<T>, timeoutInMs: number = 0) {
        this._fn = dataFetchFn;
        this._timeout = timeoutInMs;
    }
};
