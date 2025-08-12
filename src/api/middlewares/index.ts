import Auth from './auth.middleware';
import UrlSession from './urlSession.middleware';
import LogMetaData from './logMetaData.middleware';
import Security from './security.middleware';
import CheckUserStatus from './checkUserStatus.middleware';
import { CheckAccountLocked } from './checkAccountLock.middleware';
import { ContextMiddleware } from './context.middleware';

export default {
    Auth,
    UrlSession,
    LogMetaData,
    Security,
    CheckUserStatus,
    CheckAccountLocked,
    ContextMiddleware,
};
