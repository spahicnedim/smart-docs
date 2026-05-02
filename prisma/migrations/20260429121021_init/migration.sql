-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "filename" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "docType" TEXT,
    "supplier" TEXT,
    "docNumber" TEXT,
    "issueDate" TEXT,
    "dueDate" TEXT,
    "currency" TEXT,
    "lineItems" TEXT,
    "subtotal" REAL,
    "tax" REAL,
    "total" REAL,
    "status" TEXT NOT NULL DEFAULT 'uploaded',
    "validationIssues" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
