import { Types, Document } from "mongoose";

export interface IGroup extends Document {
    _id: Types.ObjectId;
    name: string;
    description?: string;
    groupId: string;
    members: Array<Types.ObjectId>;
    expenses: Array<Types.ObjectId>;
    createdBy: Types.ObjectId;
    createdByName: string;
    status: number;
    avatarUrl?: string;
    createdAt?: Date;
    updatedAt?: Date;

    isMember: (userId: Types.ObjectId) => boolean;
    memberCount: () => number;
}