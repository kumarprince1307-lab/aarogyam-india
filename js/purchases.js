// Invoice Form Submit hone par yeh function chale ga
document.getElementById('invoiceForm').addEventListener('submit', async function (e) {
    e.preventDefault(); // Page reload hone se rokein

    // 1. Form se values uthana (Apne HTML IDs ke hisaab se yeh naam check kar lena)
    const customerName = document.getElementById('customerName').value;
    const customerPhone = document.getElementById('customerPhone').value;
    const itemName = document.getElementById('itemName').value;
    const quantity = parseFloat(document.getElementById('quantity').value) || 0;
    const price = parseFloat(document.getElementById('price').value) || 0;
    
    // Total calculation
    const totalAmount = quantity * price;

    // Supabase me insert karne ke liye data object
    const invoiceData = {
        customer_name: customerName,
        customer_phone: customerPhone,
        item_name: itemName,
        quantity: quantity,
        price: price,
        total_amount: totalAmount,
        invoice_date: new Date().toISOString()
    };

    try {
        // 2. Supabase table me data save karna (Table ka naam 'purchases' ya 'invoices' ho sakta hai)
        const { data, error } = await supabase
            .from('purchases') // Yahan apne table ka naam likhein
            .insert([invoiceData])
            .select();

        if (error) {
            throw error;
        }

        alert('Invoice successfully saved and recorded!');
        console.log('Saved Data:', data);
        
        // Form reset karna chahein toh
        document.getElementById('invoiceForm').reset();

    } catch (err) {
        console.error('Error saving invoice:', err.message);
        alert('Invoice save karne me error aayi: ' + err.message);
    }
});
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(() => console.log('PWA Service Worker Active'))
      .catch(err => console.log('PWA Error:', err));
  });
}
