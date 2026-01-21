"use client"

import { useState } from "react"
import { Stepper } from "../../components/stepper"
import { Step1Info } from "../../components/step-1-info"
import { Step2Management } from "../../components/step-2-management"
import { Step3Submit } from "../../components/step-3-submit"
import { Button } from "@/components/ui/button"

export default function CreateProductPage() {
  const [step, setStep] = useState(1)
  const [productType, setProductType] = useState<"single" | "variant">("single")

  return (
    <div className="space-y-6">
      <Stepper currentStep={step} />

      {step === 1 && (
        <Step1Info
          productType={productType}
          setProductType={setProductType}
        />
      )}

      {step === 2 && (
        <Step2Management productType={productType} />
      )}

      {step === 3 && <Step3Submit />}

      <div className="flex justify-between">
        <Button
          variant="outline"
          disabled={step === 1}
          onClick={() => setStep(step - 1)}
        >
          Kembali
        </Button>

        {step < 3 && (
          <Button onClick={() => setStep(step + 1)}>
            Lanjut
          </Button>
        )}
      </div>
    </div>
  )
}
