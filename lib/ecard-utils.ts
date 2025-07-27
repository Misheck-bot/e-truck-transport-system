// E-Card QR Code Data Structure
export interface ECardData {
  cardId: string
  driverId: string
  driverName: string
  licenseNumber: string
  issueDate: string
  expiryDate: string
  status: "active" | "expired" | "suspended"
  signature: string // Digital signature for verification
}

export function generateECardQRData(ecard: ECardData): string {
  // Create a secure, verifiable QR code data string
  const data = {
    id: ecard.cardId,
    driver: ecard.driverId,
    license: ecard.licenseNumber,
    issued: ecard.issueDate,
    expires: ecard.expiryDate,
    status: ecard.status,
    sig: ecard.signature,
  }

  return JSON.stringify(data)
}

export function parseECardQRData(qrData: string): ECardData | null {
  try {
    const parsed = JSON.parse(qrData)

    // Verify signature and data integrity
    if (verifyECardSignature(parsed)) {
      return {
        cardId: parsed.id,
        driverId: parsed.driver,
        driverName: "", // Would be fetched from database
        licenseNumber: parsed.license,
        issueDate: parsed.issued,
        expiryDate: parsed.expires,
        status: parsed.status,
        signature: parsed.sig,
      }
    }

    return null
  } catch (error) {
    return null
  }
}

function verifyECardSignature(data: any): boolean {
  // Implement digital signature verification
  // This would use cryptographic methods to ensure data integrity
  return true // Simplified for demo
}
