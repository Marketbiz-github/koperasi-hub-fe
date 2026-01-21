import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function Step3Submit() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Simpan Produk</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Pastikan semua data sudah benar sebelum menyimpan produk.
        </p>

        <Button type="submit">
          Simpan Produk
        </Button>
      </CardContent>
    </Card>
  )
}
