# Guest Remarks Database Schema Addition

## Instructions
Add the following model to `minecomplyapi/prisma/schema.prisma`:

```prisma
model GuestRemark {
  id          String   @id @default(uuid())
  reportId    String   // Link to CMVR or ECC report
  reportType  String   // "CMVR" or "ECC"
  guestName   String
  guestEmail  String?
  guestRole   String   // "Member", "Guest", "Stakeholder"
  remarks     String   @db.Text
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  createdById String?  // User ID if logged in
  createdBy   User?    @relation("UserGuestRemarks", fields: [createdById], references: [id])

  @@index([reportId], map: "idx_guest_remark_report")
  @@index([createdById], map: "idx_guest_remark_creator")
}
```

## Also Update User Model
Add this relation to the `User` model:

```prisma
model User {
  // ... existing fields ...
  guestRemarks GuestRemark[] @relation("UserGuestRemarks")
}
```

## Migration Command
```bash
cd minecomplyapi
npx prisma migrate dev --name add_guest_remarks_model
npx prisma generate
```

## What This Enables
- Internal guest/member remarks submission
- Replaces external Google Forms dependency
- Links remarks directly to reports
- Tracks who submitted remarks
- Supports both authenticated and anonymous submissions

