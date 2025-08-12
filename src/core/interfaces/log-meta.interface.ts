export interface ILogMeta {
    userId: string | null;
    email: string | null;
    ip: string | string[] | undefined;
    path: string;
    method: string;
    userAgent: string | undefined;
    timestamp: string;
}