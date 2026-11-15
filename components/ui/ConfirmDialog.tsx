import { useEffect, useRef } from "react";

type ConfirmDialogProps = {
  modeName: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({ modeName, onConfirm, onCancel }: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current!;
    const previousFocus = document.activeElement as HTMLElement | null;
    dialog.showModal();
    cancelRef.current?.focus();
    return () => {
      dialog.close();
      previousFocus?.focus();
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="reset-title"
      aria-describedby="reset-description"
      onCancel={(event) => { event.preventDefault(); onCancel(); }}
      onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        if (event.shiftKey && document.activeElement === cancelRef.current) {
          event.preventDefault();
          confirmRef.current?.focus();
        } else if (!event.shiftKey && document.activeElement === confirmRef.current) {
          event.preventDefault();
          cancelRef.current?.focus();
        }
      }}
      className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-purple/40 bg-surface p-6 text-foreground backdrop:bg-background/80"
    >
      <h2 id="reset-title" className="text-xl font-bold">Reset scores?</h2>
      <p id="reset-description" className="mt-3 text-sm leading-6 text-muted">
        Clear all wins and draws for {modeName}? Your current board and other modes’ scores will stay unchanged.
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button ref={cancelRef} type="button" onClick={onCancel} className="button-secondary">Cancel</button>
        <button ref={confirmRef} type="button" onClick={onConfirm} className="button-primary">Reset Scores</button>
      </div>
    </dialog>
  );
}
