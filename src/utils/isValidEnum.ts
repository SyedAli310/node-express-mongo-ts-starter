export function isValidEnum(enumObj: object, value: any): boolean {
    return Object.values(enumObj).includes(value);
}