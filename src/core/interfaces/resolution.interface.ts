import { Document, Types } from "mongoose";

export interface IResolution extends Document {
    _id: Types.ObjectId;
    paidBy: Types.ObjectId;
    paidTo: Types.ObjectId;
    paidAmount: number;
    note: string;
    groupId?: string;
    isAcknowledged: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}