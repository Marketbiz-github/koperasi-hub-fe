import Image from "next/image"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export type TopSellingItem = {
  name?: string
  type?: string
  image?: string
  sold?: number
  revenue?: string
}

type TopSellingProps = {
  title?: string
  description?: string
  items: TopSellingItem[]
}

export function TopSelling({
  title,
  description,
  items,
}: TopSellingProps) {
  return (
    <Card>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && (
            <CardDescription>{description}</CardDescription>
          )}
        </CardHeader>
      )}

      <CardContent className="space-y-4">
        {items.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Tidak ada data untuk ditampilkan
          </p>
        )}

        {items.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-4"
          >
            {/* IMAGE */}
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border bg-muted">
              {item.image && (
                <Image
                  src={item.image}
                  alt={item.name ?? "item"}
                  fill
                  className="object-cover"
                />
              )}
            </div>

            {/* INFO */}
            <div className="flex-1">
              <p className="font-medium leading-none">
                {item.name ?? "-"}
              </p>
              <p className="text-xs text-muted-foreground">
                {item.type ?? "Item"}
                {item.sold !== undefined && ` • ${item.sold} terjual`}
              </p>
            </div>

            {/* META */}
            {item.revenue && (
              <Badge variant="secondary">
                {item.revenue}
              </Badge>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
