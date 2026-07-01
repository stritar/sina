"use client";

/**
 * SecureWireDialogPlaceholder — the governed component the gate FORCES when a wire
 * escalates. The real secondary-approval flow lands in Phase 5; this is a clearly
 * labeled stub so the P4/P5 boundary stays honest.
 */

import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@sina-design-system/core";
import { Lock } from "@phosphor-icons/react/dist/ssr";

export function SecureWireDialogPlaceholder() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm" iconLeft={<Lock className="size-control-2xs" />}>
          Open SecureWireDialog
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>SecureWireDialog</DialogTitle>
        <DialogDescription>
          Secondary managerial approval is required before this wire can execute. The full
          approval flow lands in <span className="font-medium text-text">Phase 5</span> — this is
          a placeholder.
        </DialogDescription>
        <div className="mt-2 flex items-center justify-between gap-3">
          <span className="font-mono text-xs text-text-subtle">requiredComponent · placeholder</span>
          <div className="flex gap-2">
            <DialogClose asChild>
              <Button variant="secondary">Close</Button>
            </DialogClose>
            <Button disabled>Approve</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
