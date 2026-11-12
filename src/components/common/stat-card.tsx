import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { AppIcon } from "@/types/icon";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: AppIcon;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        {Icon ? (
          <CardAction>
            <Icon className="size-4 text-muted-foreground" />
          </CardAction>
        ) : null}
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        <div className="text-2xl font-light tracking-tight tabular-nums">
          {value}
        </div>
        {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}
