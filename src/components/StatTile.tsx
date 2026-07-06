import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function StatTile({
  label,
  value,
  icon: Icon,
  href,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  href?: string;
}) {
  const content = (
    <Card className={href ? "py-4 transition-shadow hover:shadow-md" : "py-4"}>
      <CardContent className="flex flex-col items-center gap-2 text-center sm:flex-row sm:text-left">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
          <Icon className="size-4" />
        </div>
        <div>
          <p className="text-xl leading-none font-semibold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}
