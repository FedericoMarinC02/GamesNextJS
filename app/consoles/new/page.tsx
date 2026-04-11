import CoverUploadField from "@/components/CoverUploadField";
import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import SideBar from "@/components/sidebar";
import ValidatedConsoleForm, { ConsoleFieldError } from "@/components/ValidatedConsoleForm";
import { saveUploadedConsoleImage } from "@/src/lib/game-cover";
import { consoleFormSchema, getConsoleFormValues } from "@/src/lib/console-form-schema";
import { getCurrentUser } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";

export const dynamic = "force-dynamic";

const fallbackImage = "no-image.png";
type ConsoleFieldErrorName = Parameters<typeof ConsoleFieldError>[0]["name"];
type CreateConsoleResult =
  | void
  | {
      error?: string;
      fieldErrors?: Partial<Record<ConsoleFieldErrorName, string[]>>;
      redirectTo?: string;
    };

export default async function NewConsolePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/handler/sign-in");
  }

  async function createConsole(formData: FormData): Promise<CreateConsoleResult> {
    "use server";

    const authUser = await getCurrentUser();

    if (!authUser) {
      redirect("/handler/sign-in");
    }

    const parsed = consoleFormSchema.safeParse(getConsoleFormValues(formData));
    const coverFile = formData.get("coverFile");

    if (!parsed.success) {
      return {
        error: "Revisa los campos obligatorios antes de continuar.",
        fieldErrors: parsed.error.flatten().fieldErrors as Partial<
          Record<ConsoleFieldErrorName, string[]>
        >,
      };
    }

    const name = parsed.data.name.trim();
    const manufacturer = parsed.data.manufacturer.trim();
    const releaseDate = parsed.data.releaseDate;
    const description = parsed.data.description.trim();

    let image = fallbackImage;

    try {
      if (coverFile instanceof File && coverFile.size > 0) {
        try {
          image = await saveUploadedConsoleImage(coverFile);
        } catch (uploadError) {
          console.error("Console image upload error:", uploadError);
        }
      }

      const created = await prisma.console.create({
        data: {
          name,
          image,
          manufacturer,
          releaseDate: new Date(releaseDate),
          description,
        },
      });

      revalidatePath("/consoles");
      return {
        redirectTo: `/consoles/view/${created.id}?created=1`,
      };
    } catch (error: any) {
      console.error("Create console error:", error);

      if (error?.code === "P2002") {
        return {
          error: "Ya existe una consola con ese nombre. Usa un nombre diferente.",
          fieldErrors: {
            name: ["Ya existe una consola con ese nombre"],
          },
        };
      }

      return {
        error: "No se pudo crear la consola. Intenta de nuevo en unos segundos.",
      };
    }
  }

  return (
    <SideBar currentPath="/consoles">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/consoles" className="btn btn-ghost btn-sm">
            Back to consoles
          </Link>
        </div>

        <section className="overflow-hidden rounded-[2rem] border border-base-300 bg-base-200/45 shadow-2xl">
          <div className="bg-gradient-to-r from-cyan-500/10 via-transparent to-transparent px-6 py-6 md:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/45">
              Add Console
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">
              Create a new console
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-white/65">
              Completa la informacion principal de la consola y guarda cuando todo este listo.
            </p>
          </div>

          <ValidatedConsoleForm action={createConsole} className="grid gap-8 px-6 py-8 md:px-8">
            <div className="grid gap-6 lg:grid-cols-2">
              <label className="form-control w-full">
                <div className="label">
                  <span className="label-text text-white/75">Name</span>
                </div>
                <input type="text" name="name" className="input input-bordered w-full bg-base-100/70" />
                <ConsoleFieldError name="name" />
              </label>

              <label className="form-control w-full">
                <div className="label">
                  <span className="label-text text-white/75">Manufacturer</span>
                </div>
                <input
                  type="text"
                  name="manufacturer"
                  className="input input-bordered w-full bg-base-100/70"
                />
                <ConsoleFieldError name="manufacturer" />
              </label>

              <label className="form-control w-full lg:col-span-2">
                <div className="label">
                  <span className="label-text text-white/75">Release Date</span>
                </div>
                <input
                  type="date"
                  name="releaseDate"
                  className="input input-bordered w-full bg-base-100/70"
                />
                <ConsoleFieldError name="releaseDate" />
              </label>

              <div className="lg:col-span-2 rounded-[1.75rem] border border-white/10 bg-base-200/35 p-5 shadow-xl">
                <CoverUploadField initialCover="" title="New console" />
              </div>

              <label className="form-control w-full lg:col-span-2">
                <div className="label">
                  <span className="label-text text-white/75">Description</span>
                </div>
                <textarea
                  name="description"
                  className="textarea textarea-bordered min-h-40 w-full bg-base-100/70"
                />
                <ConsoleFieldError name="description" />
              </label>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Link href="/consoles" className="btn btn-ghost">
                Cancel
              </Link>
              <button type="submit" className="btn btn-primary text-white">
                Create Console
              </button>
            </div>
          </ValidatedConsoleForm>
        </section>
      </div>
    </SideBar>
  );
}
