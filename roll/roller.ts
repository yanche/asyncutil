
import { ToDo, ToDoState } from "./todo";

export default class Roller<Ti, To>{
    private readonly _todo: ToDo<Ti, To>;
    private readonly _fn: (data: Ti) => PromiseLike<To>;

    constructor(todo: ToDo<Ti, To>, fn: (data: Ti) => PromiseLike<To>) {
        this._todo = todo;
        this._fn = fn;
    }

    public async roll(): Promise<void> {
        while (true) {
            const task = this._todo.dispatch();
            if (task.end) {
                return;
            }

            const result = task.result!;
            try {
                const output = await this._fn(task.data!);
                result.state = ToDoState.SUCCESS;
                result.data = output;
            }
            catch (err) {
                result.state = ToDoState.FAIL;
                result.err = err;
            }
        }
    }
}
