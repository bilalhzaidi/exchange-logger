const SUPABASE_URL = 'https://xpqotcnwciuojbjkxmoa.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwcW90Y253Y2l1b2piamt4bW9hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzODIwMjQsImV4cCI6MjA2MDk1ODAyNH0.RO10NvoSf0srawSmtjXhQ4g4hOpNb9I-Q3G6oNhwP9c'; // ✅ Your real anon key

const tableName = 'exchange_rates';
const { createClient } = window.supabase;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function fetchAndInsertRates() {
  try {
    const response = await fetch('https://open.er-api.com/v6/latest/USD');
    const result = await response.json();
    const rates = result.rates;

    const timestamp = new Date().toISOString();
    const selectedCurrencies = ['PKR', 'EUR', 'GBP', 'INR', 'CAD', 'AUD'];

    const entries = selectedCurrencies.map(currency => ({
      currency,
      rate: rates[currency],
      timestamp
    }));

    const { data, error } = await supabase
      .from(tableName)
      .insert(entries);

    if (error) {
      console.error('❌ Insert failed:', error.message);
      alert('Error logging rates to Supabase.');
    } else {
      console.log('✅ Rates inserted:', data);
      fetchLatestRates(); // refresh view
    }
  } catch (err) {
    console.error('❌ API fetch failed:', err.message);
    alert('Failed to fetch latest rates.');
  }
}

async function fetchLatestRates() {
  const container = document.getElementById('rates');
  container.innerHTML = 'Loading...';

  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(10);

  container.innerHTML = ''; // clear old entries

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
