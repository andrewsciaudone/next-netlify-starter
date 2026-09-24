import { Action } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="shell flex min-h-[60vh] flex-col items-start justify-center gap-5">
      <p className="label text-muted">Error 404 — Form not found</p>
      <p className="max-w-[26rem] text-2xl leading-snug">There is no form catalogued under this number.</p>
      <Action href="/" variant="outline">
        Return to the start
      </Action>
    </div>
  );
}
