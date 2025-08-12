import { AsyncLocalStorage } from 'node:async_hooks';
import { Request } from 'express';
import { IUser } from '../core/interfaces/user.interface';

type Context = {
    user?: IUser; // Replace with your user type
    req?: Request;
};

const asyncLocalStorage = new AsyncLocalStorage<Context>();

export const Context = {
    run: (context: Context, callback: (...args: any[]) => void) => {
        asyncLocalStorage.run(context, callback);
    },
    get: (): Context => {
        return asyncLocalStorage.getStore() || {};
    },
    getUser: () => {
        return Context.get().user;
    },
    getRequest: () => {
        return Context.get().req;
    },
};
