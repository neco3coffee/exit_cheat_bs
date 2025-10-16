"use client";
import { redirect } from "next/navigation";
export default function Page() {
  const locale = localStorage.getItem("locale");
  if (locale) {
    return redirect(`/${locale}`);
  }

  redirect("/en");
}
