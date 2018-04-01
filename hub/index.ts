
export class Hub<T> {
    private _fn: () => PromiseLike<T>;
    private _timeout: number;
    private _lastRunTs?: number;
    private _activePromise?: Promise<T>;

    /**
     * @return cached data timed-out or not.
     */
    public timeout(): boolean {
        return Boolean(this._timeout > 0 && this._lastRunTs && ((this._timeout + this._lastRunTs) <= new Date().getTime()));
    }

    /**
     * invoke async function to get data.
     * @return the promise for returned data.
     */
    public get(): Promise<T> {
        if (this._activePromise && !this.timeout())
            return this._activePromise;
        else {
            this._lastRunTs = new Date().getTime();
            return this._activePromise = new Promise<T>((res, rej) => {
                try {
                    this._fn().then(res, (err: Error) => {
                        rej(err);
                        this._activePromise = undefined;
                    });
                }
                catch (err) {
                    // error in this._fn()
                    rej(err);
                    this._activePromise = undefined;
                }
            });
        }
    }

    /**
     * construct a Hub instance, it will guarantee the async function (fn) will be called only once at one time.
     * to avoid traffic jam
     * @param fn A function to fetch data.
     * @param timeout The timeout of cached data in ms, 0 is for never timeout.
     */
    constructor(fn: () => PromiseLike<T>, timeout: number = 0) {
        this._fn = fn;
        this._timeout = timeout; //in ms
    }
};
