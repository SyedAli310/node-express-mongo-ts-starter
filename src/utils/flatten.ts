/**
 * Flattens a nested array of objects with child prop to 'N' levels
 *
 * @param nestedArray  The nested array of objects to flatten
 * @param prop  The name of the child prop to flatten
 * @returns Flattend array with all child prop values in a single level
 */
export function flatten(
    nestedArray: any[],
    childProp: string = 'children',
    flatArray: any[] = []
): any[] {
    if (!nestedArray?.length) return flatArray;

    const [first, ...rest] = nestedArray;

    flatArray.push(first);

    if (first[childProp.toString()]?.length) {
        flatten(first[childProp.toString()], childProp, flatArray);
    }

    return flatten(rest, childProp, flatArray);
}