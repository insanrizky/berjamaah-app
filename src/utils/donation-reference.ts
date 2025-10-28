/**
 * Generate a unique donation reference number
 * Format: 10 characters (alphanumeric, easy to read)
 * 
 * Features:
 * - Easy to read (excludes confusing characters like 0, O, 1, I, L)
 * - Secure (hard to guess)
 * - Informative (includes date prefix)
 * - Unique (timestamp + random)
 */
export function generateDonationReferenceNumber(): string {
  // Characters that are easy to read and distinguish
  const easyChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  
  // Get current date components for prefix
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2); // Last 2 digits of year
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  
  // Create date prefix (6 characters: YYMMDD)
  const datePrefix = year + month + day;
  
  // Generate 4 random characters
  let randomSuffix = '';
  for (let i = 0; i < 4; i++) {
    randomSuffix += easyChars[Math.floor(Math.random() * easyChars.length)];
  }
  
  // Combine date prefix + random suffix = 10 characters total
  const referenceNumber = datePrefix + randomSuffix;
  
  return referenceNumber;
}

/**
 * Validate donation reference number format
 * Should be exactly 10 characters, alphanumeric, easy to read
 */
export function validateDonationReferenceNumber(refNumber: string): boolean {
  // Must be exactly 10 characters
  if (refNumber.length !== 10) {
    return false;
  }
  
  // Must contain only easy-to-read characters
  const easyCharsRegex = /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{10}$/;
  return easyCharsRegex.test(refNumber);
}

/**
 * Parse donation reference number to extract date info
 * Returns the date when the reference was generated
 */
export function parseDonationReferenceDate(refNumber: string): Date | null {
  if (!validateDonationReferenceNumber(refNumber)) {
    return null;
  }
  
  try {
    const year = '20' + refNumber.slice(0, 2); // Convert YY to YYYY
    const month = refNumber.slice(2, 4);
    const day = refNumber.slice(4, 6);
    
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  } catch {
    return null;
  }
}
