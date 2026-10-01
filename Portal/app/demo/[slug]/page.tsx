import { notFound } from "next/navigation";
import { getWorkApp } from "@/lib/work-apps";
import DemoWorkbench from "./DemoWorkbench";

export const metadata = {
  title: "Trải nghiệm quy trình | Vireon Labs",
  robots: { index: false, follow: true },
};
export default async function DemoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const app = getWorkApp((await params).slug);
  if (!app) notFound();
  return <DemoWorkbench app={app} />;
}
