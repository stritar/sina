import type { Metadata } from "next";
import "../broadsheet/broadsheet.css";
import { Sandbox } from "./Sandbox";

export const metadata: Metadata = {
  title: "Broadsheet components: SINA marketing",
  description:
    "Live overview of the SINA marketing (Broadsheet) components. Toggle every variant and prop.",
  robots: { index: false, follow: false },
};

/**
 * The marketing component overview. Wraps the sandbox in the `.broadsheet`
 * marker so the `--sinamk-*` foundation (and its dark variant) is in scope.
 */
export default function ShowcasePage() {
  return (
    <div className="broadsheet">
      <Sandbox />
    </div>
  );
}
