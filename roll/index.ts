
import { ToDo, ToDoState } from "./todo";
import Roller from "./roller";

/**
 * Process given data set under a given concurrency level, eg. 5 data to be processed at one time.
 * @param gen The data set to process or a generator for the data set.
 * @param fn The async function to process data.
 * @param concurrencyLevel The limit of data to be processed simutaneously.
 * @returns Promise of processing result.
 */
export function roll<Ti, To>(gen: Ti[] | IterableIterator<Ti>, fn: (t: Ti) => PromiseLike<To>, concurrencyLevel: number): Promise<RollResult<To>>;
/**
 * Process given data set under a given concurrency level, eg. 5 data to be processed at one time.
 * @param totalRounds The number of total rounds to run.
 * @param fn The async function to process data.
 * @param concurrencyLevel The limit of data to be processed simutaneously.
 * @returns Promise of processing result.
 */
export function roll<To>(totalRounds: number, fn: (round: number) => PromiseLike<To>, concurrencyLevel: number): Promise<RollResult<To>>;
export function roll<Ti, To>(gen: number | Ti[] | IterableIterator<Ti>, fn: (t: Ti) => PromiseLike<To>, concurrencyLevel: number): Promise<RollResult<To>> {
    if (!Number.isInteger(concurrencyLevel) || concurrencyLevel <= 0) {
        return Promise.reject(new Error("concurrencyLevel must be a positive integer"));
    }
    if (typeof gen === "number") {
        if (!Number.isInteger(gen) || gen < 0) {
            return Promise.reject(new Error("totalRounds must be a non-negative integer"));
        }
        gen = <any>totalRoundsToGen(gen);
    }

    const gen2 = <IterableIterator<Ti>>(Array.isArray(gen) ? arr2Gen(gen) : gen);
    // roller is like a thread
    const rolls = new Array<Roller<Ti, To>>(concurrencyLevel);
    const todo = new ToDo<Ti, To>(gen2);
    for (let i = 0; i < concurrencyLevel; ++i) {
        rolls[i] = new Roller(todo, fn);
    }

    return Promise.all(rolls.map(r => r.roll()))
        .then(() => {
            const errors = todo.results.map((r, idx) => {
                return { err: r.err, index: idx, state: r.state };
            }).filter(r => r.state === ToDoState.FAIL);

            return <RollResult<To>>{
                hasError: errors.length > 0,
                errors: errors,
                data: todo.results.map(r => r.data),
            };
        });
}

export interface RollResult<To> {
    readonly hasError: boolean;
    readonly errors?: { err: Error; index: number }[];
    readonly data: To[];
}

function* arr2Gen<T>(arr: Array<T>): IterableIterator<T> {
    yield* arr;
}

function* totalRoundsToGen(totalRounds: number): IterableIterator<number> {
    let cur = 0;
    while (cur < totalRounds) {
        yield cur++;
    }
}
