import { Field } from "@sina-design-system/core";
import { Demo, StoryShell } from "../_components/StoryShell";

const inputClassName =
  "h-7 w-full rounded-md border border-subtle bg-surface px-2.5 text-ui text-text placeholder:text-text-subtle focus-visible:outline-none focus-visible:border-focus-ring focus-visible:ring-1 focus-visible:ring-focus-ring aria-[invalid=true]:border-danger";

export default function FieldStory() {
  return (
    <StoryShell title="Field">
      <Demo label="Label only">
        <div className="w-72">
          <Field label="Recipient">
            <input className={inputClassName} placeholder="Jane Doe" />
          </Field>
        </div>
      </Demo>

      <Demo label="Description">
        <div className="w-72">
          <Field label="Recipient" description="Full legal name on the account">
            <input className={inputClassName} placeholder="Jane Doe" />
          </Field>
        </div>
      </Demo>

      <Demo label="Error (announced, aria-invalid wired)">
        <div className="w-72">
          <Field label="Reference" error="This field is required">
            <input className={inputClassName} />
          </Field>
        </div>
      </Demo>

      <Demo label="Required">
        <div className="w-72">
          <Field label="Reference" required>
            <input className={inputClassName} />
          </Field>
        </div>
      </Demo>

      <Demo label="Control types (a11y wiring clones onto any control)">
        <div className="w-72">
          <Field label="Region" description="Pick one">
            <select className={inputClassName}>
              <option>North</option>
              <option>South</option>
              <option>East</option>
              <option>West</option>
            </select>
          </Field>
        </div>
        <div className="w-72">
          <Field label="Notes" description="Free-form text">
            <textarea
              rows={3}
              className="w-full rounded-md border border-subtle bg-surface px-2.5 py-1.5 text-ui text-text placeholder:text-text-subtle focus-visible:outline-none focus-visible:border-focus-ring focus-visible:ring-1 focus-visible:ring-focus-ring aria-[invalid=true]:border-danger"
              placeholder="Add a note"
            />
          </Field>
        </div>
        <div className="w-72">
          <Field label="Quantity" description="Whole units" required>
            <input type="number" className={inputClassName} placeholder="0" />
          </Field>
        </div>
      </Demo>
    </StoryShell>
  );
}
