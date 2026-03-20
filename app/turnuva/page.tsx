import { redirect } from "next/navigation";

/** Eski /turnuva adresi — kalıcı yönlendirme */
export default function TurnuvaLegacyRedirect() {
  redirect("/arena");
}
