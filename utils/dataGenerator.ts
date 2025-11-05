export class DataGenerator {
  /**
   * Generate a random email address
   * @param prefix - Optional prefix for the email (default: 'test.user')
   * @param domain - Optional domain (default: 'gmail.com')
   * @returns Generated email address
   */
  static generateEmail(prefix: string = 'sailesh.ebpearls', domain: string = 'gmail.com'): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `${prefix}+${timestamp}${random}@${domain}`;
  }

  /**
   * Generate a random Australian mobile phone number
   * @returns Generated 10-digit Australian mobile number (04XX XXX XXX format)
   */
  static generatePhoneNumber(): string {
    // Australian mobile numbers start with 04
    const prefix = '04';
    
    // Second digit can be 0-9
    const secondDigit = Math.floor(Math.random() * 10);
    
    // Generate remaining 7 digits
    const remaining = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
    
    return `${prefix}${secondDigit}${remaining}`;
  }

  /**
   * Generate a random first name
   * @returns Random first name
   */
  static generateFirstName(): string {
    const names = [
      'John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Jessica',
      'William', 'Ashley', 'James', 'Amanda', 'Christopher', 'Melissa', 'Daniel', 'Nicole'
    ];
    return names[Math.floor(Math.random() * names.length)];
  }

  /**
   * Generate a random last name
   * @returns Random last name
   */
  static generateLastName(): string {
    const names = [
      'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
      'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas'
    ];
    return names[Math.floor(Math.random() * names.length)];
  }
}
