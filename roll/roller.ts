
import { ToDo, ToDoState } from "./todo";

export default class Roller<Ti, To>{
    private _todo: ToDo<Ti, To>;
    private _fn: (data: Ti) => Promise<To>;

    constructor(todo: ToDo<Ti, To>, fn: (data: Ti) => Promise<To>) {
        this._todo = todo;
        this._fn = fn;
    }

    public roll(): Promise<void> {
        return this._todo.dispatch()
            .then(task => {
                if (!task.end) {
                    const result = task.result!;
                    return this._fn(task.data!)
                        .then(data => {
                            result.state = ToDoState.SUCCESS;
                            result.data = data;
                        }, (err: Error) => {
                            result.state = ToDoState.FAIL;
                            result.err = err;
                        })
                        .then(() => this.roll())
                }
            });
    }
}
