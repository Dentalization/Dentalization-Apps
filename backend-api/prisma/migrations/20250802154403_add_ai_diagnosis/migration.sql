-- CreateTable
CREATE TABLE "ai_diagnoses" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "patientId" TEXT,
    "imageUrl" TEXT,
    "detectionResult" TEXT NOT NULL,
    "reasoningResult" TEXT NOT NULL,
    "reportUrl" TEXT,
    "requestId" TEXT,
    "aiServerResponse" TEXT,
    "diagnosisDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_diagnoses_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ai_diagnoses" ADD CONSTRAINT "ai_diagnoses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_diagnoses" ADD CONSTRAINT "ai_diagnoses_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patient_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
