import { StackHandler } from "@stackframe/stack";
import { stackServerApp } from "@/stack/server";

const handler = StackHandler({
  app: stackServerApp,
});

export const POST = handler;
export const GET = handler;
