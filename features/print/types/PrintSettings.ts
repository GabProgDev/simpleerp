export interface PrintSettings {
  companyName: string;
  logoUrl?: string; // Pode ser URL ou Base64
  headerText: string;
  footerText: string;
  showLogo: boolean;
  showCompanyInfo: boolean;
  showCustomerAddress: boolean;
  showSignatureLine: boolean;
}