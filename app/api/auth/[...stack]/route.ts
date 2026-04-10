import { StackHandler } from "@stackframe/stack";
import { stackServerApp } from "@/stack/server";

export const { GET, POST } = StackHandler({
  app: stackServerApp,
});