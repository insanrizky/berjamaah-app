import { protectedProcedure, publicProcedure, router } from '../lib/trpc';
import { donationRouter } from './donation';
import { programRouter } from './program';
import { userRouter } from './user';
import { reportRouter } from './report';

export const appRouter = router({
  healthCheck: publicProcedure.query(() => {
    return 'OK';
  }),
  privateData: protectedProcedure.query(({ ctx }) => {
    return {
      message: 'This is private',
      user: ctx.session.user,
    };
  }),
  donation: donationRouter,
  program: programRouter,
  user: userRouter,
  report: reportRouter,
});
export type AppRouter = typeof appRouter;
