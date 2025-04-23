const SUPABASE_URL = 'https://xpqotcnwciuojbjkxmoa.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwcW90Y253Y2l1b2piamt4bW9hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzODIwMjQsImV4cCI6MjA2MDk1ODAyNH0.RO10NvoSf0srawSmtjXhQ4g4hOpNb9I-Q3G6oNhwP9cYOUR_PUBLIC_ANON_KEY'; // Replace with your real anon key
const tableName = 'exchange_rates';

const { createClient } = window.supabase;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function fetchAndInsertRates() {
  const response = await fetch('https://open.er-api.com/v6/latest/USD');
  const result = await response.json();
  const rates = result.rates;

  const timestamp = new Date().toISOString();
  const entries = ['PKR', 'EUR', 'GBP', 'INR', 'CAD', 'AUD'].map(currency => ({
    currency,
    rate: rates[currency],
    timestamp
  }));

  const { data, error } = await supabase
    .from(tableName)
    .insert(entries);

  if (error) {
    console.error('❌ Insert failed:', error);
  } else {
    console.log('✅ Rates inserted:', data);
    fetchLatestRates();
  }
}

async function fetchLatestRates() {
  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(10);

  const container = document.getElementById('rates');
  container.innerHTML = '';

  if (error) {
    container.textContent = '❌ Error fetching rates.';
    return;
  }

  data.forEach(row => {
    const line = document.createElement('div');
    line.textContent = `${row.currency}: ${row.rate.toFixed(4)} @ ${new Date(row.timestamp).toLocaleString()}`;
    container.appendChild(line);
  });
}

document.getElementById('refresh').addEventListener('click', fetchAndInsertRates);
window.addEventListener('load', fetchLatestRates);
