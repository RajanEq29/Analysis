export interface RSPData {
  city: string;
  date: Date;
  petrol: number;
  diesel: number;
}

export interface MonthlyAverage {
  month: string; // "Jan", "Feb" etc. or "2017-01"
  year: number;
  avgPrice: number;
}

export const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

export async function loadData(url: string = '/RSP_Petrol_Diesel_Metro_Cities.csv'): Promise<RSPData[]> {
  const response = await fetch(url);
  const text = await response.text();
  return parseCSV(text);
}

function parseCSV(text: string): RSPData[] {
  const lines = text.split(/\r?\n/);
  const data: RSPData[] = [];
  
  

  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Naive CSV split (assuming no commas in fields)
    const parts = line.split(',');
    
    if (parts.length < 4) continue;
    
    const city = parts[0].trim();
    const dateStr = parts[1].trim();
    const petrol = parseFloat(parts[2].trim()) || 0;
    const diesel = parseFloat(parts[3].trim()) || 0;
    
    const date = parseDate(dateStr);
    
    if (date) {
        data.push({ city, date, petrol, diesel });
    }
  }
  
  return data;
}

function parseDate(dateStr: string): Date | null {
   // Expected format: d-MMM-yy, e.g., 16-Jun-17
   const parts = dateStr.split('-');
   if (parts.length !== 3) return null;
   
   const day = parseInt(parts[0], 10);
   const monthStr = parts[1];
   const yearPart = parseInt(parts[2], 10);
   
   const monthIndex = MONTHS.findIndex(m => m.toLowerCase() === monthStr.toLowerCase());
   if (monthIndex === -1) return null;
   
   // Assume 20xx for year if 2 digits
   const year = yearPart < 100 ? 2000 + yearPart : yearPart;
   
   return new Date(year, monthIndex, day);
}

export function getUniqueCities(data: RSPData[]): string[] {
    return Array.from(new Set(data.map(d => d.city))).sort();
}

export function getUniqueYears(data: RSPData[]): number[] {
    return Array.from(new Set(data.map(d => d.date.getFullYear()))).sort((a, b) => a - b);
}

export function getMonthlyAverages(data: RSPData[], city: string, year: number, fuelType: 'Petrol' | 'Diesel'): MonthlyAverage[] {
  // Initialize result for all 12 months with 0
  const monthlySums = new Array(12).fill(0);
  const monthlyCounts = new Array(12).fill(0);
  
  const filtered = data.filter(d => 
    d.city === city && 
    d.date.getFullYear() === year
  );
  
  filtered.forEach(d => {
    const month = d.date.getMonth(); // 0-11
    const price = fuelType === 'Petrol' ? d.petrol : d.diesel;
    monthlySums[month] += price;
    monthlyCounts[month]++;
  });
  
  return MONTHS.map((m, i) => ({
    month: m,
    year: year,
    avgPrice: monthlyCounts[i] > 0 ? monthlySums[i] / monthlyCounts[i] : 0
  }));
}
