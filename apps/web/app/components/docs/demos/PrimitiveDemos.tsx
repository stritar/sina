"use client";

import { useState } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
  CurrencyField,
  Grid,
  Badge,
  Stack,
} from "@sina-design-system/core";
import styles from "./PrimitiveDemos.module.css";

/**
 * Read-only, interactive `core` demos embedded in the docs Components section.
 * Each imports a real published primitive — the same code a consumer runs — so
 * the docs dogfood `core` rather than screenshotting it. None of these carry
 * domain logic; a `CurrencyField` is display formatting only (governance lives
 * server-side in the constitution).
 */

export function DialogDemo() {
  const [open, setOpen] = useState(false);
  return (
    <div className={styles.stage}>
      <Button variant="primary" onClick={() => setOpen(true)}>
        Open dialog
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className={styles.dialog}>
          <DialogTitle>Focus-trapped dialog</DialogTitle>
          <DialogDescription>
            Radix-backed: focus is trapped, <kbd>Esc</kbd> closes, and the trigger
            regains focus on close. Tab through — focus never escapes.
          </DialogDescription>
          <div className={styles.dialogActions}>
            <DialogClose asChild>
              <Button variant="secondary">Close</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function CurrencyFieldDemo() {
  return (
    <div className={styles.stage}>
      <CurrencyField
        label="Amount"
        currencySymbol="$"
        defaultValue="25000"
        description="Groups digits on blur. Display formatting only — no limit logic."
      />
    </div>
  );
}

export function GridDemo() {
  return (
    <div className={styles.stage}>
      <Grid cols={3} gap={3}>
        {["Dialog", "Field", "Alert", "Badge", "Stack", "Grid"].map((name) => (
          <Stack key={name} align="center" className={styles.cell}>
            <Badge>{name}</Badge>
          </Stack>
        ))}
      </Grid>
    </div>
  );
}
