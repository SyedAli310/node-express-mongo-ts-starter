/**
 * Converts value to milliseconds based on provided args
 *
 * @param number  The value of to convert, Ex: 5
 * @param type  The type to convert the value, Ex: 'second' | 'minute' | 'hour'
 * @returns converted value in milliseconds
 */
export function millisecondsIn(number: number, type: string): number | null {
    if (typeof number !== "number" || isNaN(Number(number))) {
        return null;
    }
    switch (type?.toLowerCase()) {
        case "second":
            return number * 1000; // 1 second = 1000 milliseconds
        case "minute":
            return number * 60 * 1000; // 1 minute = 60 seconds, 1 second = 1000 milliseconds
        case "hour":
            return number * 60 * 60 * 1000; // 1 hour = 60 minutes, 1 minute = 60 seconds, 1 second = 1000 milliseconds
        case "day":
            return number * 24 * 60 * 60 * 1000; // 1 day = 24 hours, 1 hour = 60 minutes, 1 minute = 60 seconds, 1 second = 1000 milliseconds
        case "week":
            return number * 7 * 24 * 60 * 60 * 1000; // 1 week = 7 days, 1 day = 24 hours, 1 hour = 60 minutes, 1 minute = 60 seconds, 1 second = 1000 milliseconds
        case "month":
            return number * 30 * 24 * 60 * 60 * 1000; // Assuming 1 month = 30 days
        case "year":
            return number * 365 * 24 * 60 * 60 * 1000; // Assuming 1 year = 365 days
        default:
            return null; // Return null for an unsupported type
    }
};

// console.log(millisecondsIn(7, 'hour')); // tester method
