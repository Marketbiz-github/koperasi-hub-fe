import {
  IconTrendingDown,
  IconTrendingUp,
} from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type SectionCardItem = {
  title?: string
  value?: string
  trend?: "up" | "down"
  percent?: string
  description?: string
  footer?: string
}

export function SectionCards({ items }: { items: SectionCardItem[] }) {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {items.map((item, i) => {
        const TrendIcon =
          item.trend === "up"
            ? IconTrendingUp
            : item.trend === "down"
            ? IconTrendingDown
            : null

        return (
          <Card key={i} className="@container/card">
            <CardHeader>
              {item.title && (
                <CardDescription>{item.title}</CardDescription>
              )}

              {item.value && (
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                  {item.value}
                </CardTitle>
              )}

              {/* 🔑 Badge hanya muncul kalau trend ADA */}
              {item.trend && item.percent && TrendIcon && (
                <CardAction>
                  <Badge variant="outline">
                    <TrendIcon />
                    {item.percent}
                  </Badge>
                </CardAction>
              )}
            </CardHeader>

            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              {/* 🔑 Icon di footer juga conditional */}
              {item.description && (
                <div className="line-clamp-1 flex gap-2 font-medium">
                  {item.description}
                  {TrendIcon && <TrendIcon className="size-4" />}
                </div>
              )}

              {item.footer && (
                <div className="text-muted-foreground">
                  {item.footer}
                </div>
              )}
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}
