export class ErrorUtil {
    public static throwIfNull<T>(args: T): T {
        if(args === null || args === undefined) {
            throw new Error("");
        }
        return args
    }
}
