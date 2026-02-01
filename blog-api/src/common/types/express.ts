
/* eslint-disable @typescript-eslint/no-namespace */

import type { JwtPayload } from './jwt-payload.interface';
import type { Logger } from 'pino';


declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
            logger: Logger;
            correlationId: string;
        }
    }
}

export {};