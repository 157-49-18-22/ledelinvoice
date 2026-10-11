const ones = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen'
];

const tens = [
  '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
];

const formatNumber = (n) => {
  // Handle invalid input
  if (typeof n !== 'number' || isNaN(n) || !isFinite(n)) return '';
  
  // Handle negative numbers
  if (n < 0) return 'Minus ' + formatNumber(-n);
  
  // Convert to integer
  n = Math.floor(n);
  
  // Base cases
  if (n === 0) return '';
  if (n < 20) return ones[n];
  
  // Handle tens
  if (n < 100) {
    const digit = n % 10;
    return tens[Math.floor(n / 10)] + (digit ? ' ' + ones[digit] : '');
  }
  
  // Handle hundreds
  if (n < 1000) {
    return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + formatNumber(n % 100) : '');
  }
  
  // Handle thousands
  if (n < 100000) {
    return formatNumber(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + formatNumber(n % 1000) : '');
  }
  
  // Handle lakhs
  if (n < 10000000) {
    return formatNumber(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + formatNumber(n % 100000) : '');
  }
  
  // Handle crores
  const crores = Math.floor(n / 10000000);
  const remainder = n % 10000000;
  return formatNumber(crores) + ' Crore' + (remainder ? ' ' + formatNumber(remainder) : '');
};

export const numberToWords = (number) => {
  // Handle invalid input
  if (typeof number !== 'number' || isNaN(number) || !isFinite(number)) {
    return 'Invalid Amount';
  }
  
  const roundedNum = Math.round(number * 100) / 100; // Round to 2 decimal places
  const rupees = Math.floor(roundedNum);
  const paise = Math.round((roundedNum - rupees) * 100);
  
  let result = formatNumber(rupees);
  if (!result) result = 'Zero';
  result += ' Rupees';
  
  if (paise > 0) {
    let paiseWords = formatNumber(paise);
    if (!paiseWords) paiseWords = 'Zero';
    result += ' and ' + paiseWords + ' Paise';
  }
  
  return result + ' Only';
};

export default numberToWords; 