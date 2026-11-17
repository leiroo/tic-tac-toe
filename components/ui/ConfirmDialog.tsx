import { useEffect, useRef } from "react";

type ConfirmDialogProps = {
  modeName: string;
  isPractice: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({ modeName, isPractice, onConfirm, onCancel }: ConfirmDialogProps) {
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
      className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-h-[calc(100dvh-2rem)] max-w-md overflow-y-auto rounded-2xl border border-purple/40 bg-surface p-5 text-foreground backdrop:bg-background/80"
    >
      <h2 id="reset-title" className="text-xl font-bold">Reset match?</h2>
      <p id="reset-description" className="mt-3 text-sm leading-6 text-muted">
        {isPractice
          ? `Clear the board, move history, and all wins and draws for ${modeName}? Start fresh with X selected. Other modes’ scores will stay unchanged.`
          : `Clear the board and all wins and draws for ${modeName}? Start a fresh match with X going first, then alternate starters. Any pending computer move will be canceled. Other modes’ scores will stay unchanged.`}
      </p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button ref={cancelRef} type="button" onClick={onCancel} className="button-secondary">Cancel</button>
        <button ref={confirmRef} type="button" onClick={onConfirm} className="button-primary">Reset Match</button>
      </div>
    </dialog>
  );
}
