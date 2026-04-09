import { StackHandler } from "@stackframe/stack";
import BackHomeButton from "@/components/BackHomeButton";

export default function StackRouteHandler() {
  return (
    <div
      className="relative flex min-h-screen flex-col bg-[url('/imgs/bg-home.png')] bg-cover bg-center"
      style={{ backgroundImage: "url('/imgs/bg-home.png')" }}
    >
      <div className="pointer-events-none absolute inset-0 bg-black/60" />
      <div className="relative z-[1] flex min-h-screen w-full flex-1 items-center justify-center px-4 py-10 text-neutral-content sm:px-6">
        <div className="stack-auth-card flex w-full max-w-[22rem] flex-col gap-6 rounded-2xl border border-white/10 bg-black/45 p-5 shadow-2xl backdrop-blur-md sm:max-w-sm sm:p-6">
          <StackHandler fullPage={false} />
          <div className="border-t border-white/10 pt-2">
            <BackHomeButton />
          </div>
        </div>
      </div>
    </div>
  );
}
