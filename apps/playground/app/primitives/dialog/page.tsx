import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@sina-design-system/core";
import { Demo, StoryShell } from "../_components/StoryShell";

export default function DialogStory() {
  return (
    <StoryShell title="Dialog">
      <Demo label="Focus-trapped modal (Esc / overlay to close)">
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Confirm transfer</DialogTitle>
            <DialogDescription>
              Review the details before continuing. This is a domain-agnostic shell — fintech
              meaning is applied only when composed in Phase 5.
            </DialogDescription>
            <div className="mt-2 flex justify-end gap-3">
              <DialogClose asChild>
                <Button variant="secondary">Cancel</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button>Confirm</Button>
              </DialogClose>
            </div>
          </DialogContent>
        </Dialog>
      </Demo>
    </StoryShell>
  );
}
