import { cn } from "@/lib/utils"

const steps = [
  { id: 1, label: "Informasi Produk" },
  { id: 2, label: "Pengelolaan Produk" },
  { id: 3, label: "Simpan" },
]

export function Stepper({
  currentStep,
}: {
  currentStep: number
}) {
  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center w-full">
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium",
              currentStep >= step.id
                ? "bg-primary text-white"
                : "bg-muted text-muted-foreground"
            )}
          >
            {step.id}
          </div>

          <span className="ml-2 text-sm font-medium">
            {step.label}
          </span>

          {index !== steps.length - 1 && (
            <div
              className={cn(
                "mx-4 h-px flex-1",
                currentStep > step.id
                  ? "bg-primary"
                  : "bg-muted"
              )}
            />
          )}
        </div>
      ))}
    </div>
  )
}
