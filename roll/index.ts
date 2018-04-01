
import { ToDo, ToDoState } from "./todo";
import Roller from "./roller";

/**
 * Process given data set in a smooth way, eg. 5 data to be processed at one time.
 * @param gen The data set to process or a generator for the data set.
 * @param fn The async function to process data.
 * @param rlimit The limit of data to be processed simutaneously.
 */
export function roll<Ti, To>(gen: Ti[] | IterableIterator<Ti>, fn: (t: Ti) => Promise<To>, rlimit: number): Promise<RollResult<To>> {
    if (rlimit <= 0 || Math.ceil(rlimit) !== rlimit) {
        return Promise.reject(new Error("rlimit must be a positive integer"));
    }

    const gen2 = Array.isArray(gen) ? arr2Gen(gen) : gen;
    const rolls = new Array<Roller<Ti, To>>(rlimit);
    const todo = new ToDo<Ti, To>(gen2);
    for (let i = 0; i < rlimit; ++i) {
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
                data: todo.results.map(r => r.data)
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
