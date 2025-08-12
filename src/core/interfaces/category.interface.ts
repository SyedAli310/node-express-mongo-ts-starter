import { Document, Types } from "mongoose";

export interface ICategory extends Document {
    _id: Types.ObjectId;
    name: string;
    groupId: Types.ObjectId;
    budget?: number | null;
    budgetType?: number;
    sequenceOrder: number;
    createdBy: Types.ObjectId;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}