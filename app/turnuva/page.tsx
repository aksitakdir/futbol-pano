import { redirect } from "next/navigation";

/** Legacy /turnuva path — permanent redirect */
export default function TurnuvaLegacyRedirect() {
  redirect("/arena");
}
