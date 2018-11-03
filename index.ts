
export * from "./hub";
export * from "./roll";

/**
 * Wait.
 * @param ms Timeout in milliseconds.
 */
export function delay(ms: number): Promise<void> {
    return new Promise(res => {
        setTimeout(res, ms);
    });
}

/**
 * Wait until condition returns true.
 * @param condition The condition callback.
 * @param intervalInMs The interval of condition callback gets called.
 * @param timeoutInMs The timeout in milliseconds.
 */
export async function waitUntilTrue(condition: () => boolean | PromiseLike<boolean>, intervalInMs: number, timeoutInMs: number): Promise<void> {
    const startTs = Date.now();
    while (!(await condition())) {
        await delay(intervalInMs);
        const msUsed = Date.now() - startTs;
        if (msUsed > timeoutInMs) {
            throw new Error(`waitUntilTrue timeout after ${msUsed}ms`);
        }
    }
}
