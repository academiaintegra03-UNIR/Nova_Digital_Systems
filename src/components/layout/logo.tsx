import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { siteName, siteTagline } from "@/lib/data/home-content";

export function Logo({
  withTagline = true,
  className,
}: {
  withTagline?: boolean;
  className?: string;
}) {
  return (
    <Link href="/" className={cn("flex shrink-0 items-center gap-2.5", className)}>
      <Image src="/Nova-PNG.png" alt="" width={36} height={36} className="rounded-full" priority />
      <span>
        <span className="block text-lg leading-tight font-extrabold tracking-tight text-heading">
          {siteName}
        </span>
        {withTagline ? (
          <span className="block text-xs leading-tight text-muted-foreground">{siteTagline}</span>
        ) : null}
      </span>
    </Link>
  );
}
