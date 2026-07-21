import * as core from "@sina-design-system/core";

/**
 * The docs slug list derived from `@sina-design-system/core`'s runtime
 * exports. Shared by the `primitive-docs` guard (every primitive has a live
 * docs page) and the `dsds` guard (every primitive has a DSDS component
 * entity) so both enforce the same universe. Subcomponents and non-component
 * exports live in EXCLUDE — they are documented on their parent's page.
 */
const EXCLUDE = new Set([
  // Dialog subcomponents
  "DialogTrigger",
  "DialogContent",
  "DialogTitle",
  "DialogDescription",
  "DialogClose",
  // Select subcomponents
  "SelectTrigger",
  "SelectValue",
  "SelectContent",
  "SelectItem",
  "SelectGroup",
  "SelectLabel",
  "SelectSeparator",
  // Tooltip subcomponents
  "TooltipProvider",
  "TooltipTrigger",
  "TooltipContent",
  // DropdownMenu subcomponents
  "DropdownMenuTrigger",
  "DropdownMenuContent",
  "DropdownMenuItem",
  "DropdownMenuGroup",
  "DropdownMenuLabel",
  "DropdownMenuSeparator",
  // Toast subcomponents
  "ToastProvider",
  "ToastViewport",
  "ToastTitle",
  "ToastDescription",
  "ToastAction",
  "ToastClose",
  // Other subcomponents (documented on their parent's page)
  "RadioGroupItem",
  "CredentialOTP",
]);

export const toSlug = (name: string) =>
  name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();

export const corePrimitiveSlugs = (): string[] =>
  Object.entries(core)
    .filter(
      ([name, value]) =>
        /^[A-Z]/.test(name) && !EXCLUDE.has(name) && typeof value !== "undefined",
    )
    .filter(([, value]) => typeof value === "function" || typeof value === "object")
    .map(([name]) => toSlug(name))
    .sort();
