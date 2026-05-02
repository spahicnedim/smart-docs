-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "docType" TEXT,
    "supplier" TEXT,
    "docNumber" TEXT,
    "issueDate" TEXT,
    "dueDate" TEXT,
    "currency" TEXT,
    "lineItems" TEXT,
    "subtotal" DOUBLE PRECISION,
    "tax" DOUBLE PRECISION,
    "total" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'uploaded',
    "validationIssues" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);
