import { Document, Types } from "mongoose";

interface CustomSplit {
    userId: Types.ObjectId;
    shareAmount: number;
}

export interface IExpense extends Document {
    _id: Types.ObjectId;
    title: string;
    description?: string;
    groupId: string;
    sharedAmong: Array<Types.ObjectId>;
    paidBy: Types.ObjectId;
    expenseAmount: number;
    creatorIncluded: boolean;
    isPrivate: boolean;
    paidOn: Date;
    categoryId: Types.ObjectId;
    customSplits: CustomSplit[];
    locationTag?: string;
    createdAt: Date;
    updatedAt: Date;

    getUserShare: (userId: Types.ObjectId) => number;
}