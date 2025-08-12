import { Enum } from "./enum";

export class LoginType extends Enum {
    static GOOGLE = 1;
    static CUSTOM = 2;
    static 1 = 'GOOGLE';
    static 2 = 'CUSTOM';
};

export class Month extends Enum {
    static January = 1;
    static February = 2;
    static March = 3;
    static April = 4;
    static May = 5;
    static June = 6;
    static July = 7;
    static August = 8;
    static September = 9;
    static October = 10;
    static November = 11;
    static December = 12;
    static 1 = 'January';
    static 2 = 'February';
    static 3 = 'March';
    static 4 = 'April';
    static 5 = 'May';
    static 6 = 'June';
    static 7 = 'July';
    static 8 = 'August';
    static 9 = 'September';
    static 10 = 'October';
    static 11 = 'November';
    static 12 = 'December';
};

export class UserStatus extends Enum {
    static ACTIVE = 1;
    static DISABLED = 2;
    static BANNED = 3;
    static 1 = 'Active';
    static 2 = 'Disabled';
    static 3 = 'Banned';
};

export class GroupStatus extends Enum {
    static ACTIVE = 1;
    static ARCHIVED = 2;
    static DELETED = 3;
    static 1 = 'Active';
    static 2 = 'Archived';
    static 3 = 'Deleted';
};

export default {
    LoginType,
    Month,
    UserStatus,
    GroupStatus,
}