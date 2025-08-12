import { Model, Types } from 'mongoose';

/**
 * Retrieves one or multiple records from a Mongoose model by their ObjectId(s), with optional field selection.
 * Uses `.lean()` for improved query performance and returns plain JavaScript objects.
 *
 * @template T - The type of the document returned by the model.
 * @param {Types.ObjectId | Types.ObjectId[]} ids - A single ObjectId or an array of ObjectIds to fetch.
 * @param {Model<T>} model - The Mongoose model to query.
 * @param {string | string[]} [fields=[]] - Optional fields to select, specified as a space-separated string or an array of field names.
 * @returns {Promise<T | T[] | null>} - Returns a single document, an array of documents, or null if not found.
 * @throws {Error} If the model is invalid or ids are not provided or of incorrect type.
 */
export default async function findRecordsById(
    ids: Types.ObjectId | Types.ObjectId[],
    model: Model<any>,
    fields: string | string[] = []
): Promise<Object | Object[] | null> {
    if (!model || typeof model.find !== 'function') {
        throw new Error('Invalid model passed to findRecordsById');
    }

    if (!ids) {
        throw new Error('ID(s) are required');
    }

    const selectFields = Array.isArray(fields) ? fields.join(' ') : fields;

    if (Array.isArray(ids)) {
        if (ids.length === 0) return [];
        return await model.find({ _id: { $in: ids } }).select(selectFields).lean();
    } else if (ids instanceof Types.ObjectId || typeof ids === 'string') {
        return await model.findOne({ _id: ids }).select(selectFields).lean();
    } else {
        throw new Error('IDs must be a string or array of strings');
    }
}