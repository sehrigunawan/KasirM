/**
 * Smart WhatsApp Text Parser for Kasir Pintar
 */

export const parseWaMessage = (rawText, availableProducts = []) => {
  if (!rawText || typeof rawText !== 'string') {
    return {
      customerName: 'Pelanggan WA',
      customerPhone: '',
      address: '',
      notes: '',
      paymentMethod: 'Transfer / WA',
      shippingFee: 0,
      items: [],
      unmatchedLines: [],
      rawText: ''
    };
  }

  const lines = rawText
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  let customerName = '';
  let customerPhone = '';
  let address = '';
  let notes = '';
  let paymentMethod = 'Transfer / WA';
  let shippingFee = 0;
  const items = [];
  const unmatchedLines = [];

  // Regex patterns
  const namePatterns = [
    /(?:nama|atas nama|pembeli|pemesan|an)\s*[:=]\s*(.+)/i,
    /(?:nama|an)\s*[:=]?\s*([A-Za-z0-9\s.]{2,30})/i,
    /pesanan\s+(?:kak|mas|mbak|pak|bu)?\s*([A-Za-z0-9\s.]{2,25})/i
  ];

  const addressPatterns = [
    /(?:alamat|tujuan|lokasi|kirim ke)\s*[:=]\s*(.+)/i
  ];

  const notesPatterns = [
    /(?:catatan|note|keterangan|request)\s*[:=]\s*(.+)/i
  ];

  const paymentPatterns = [
    /(?:metode|bayar|pembayaran|payment|via)\s*[:=]\s*(.+)/i
  ];

  const shippingPatterns = [
    /(?:ongkir|biaya kirim|pengiriman|shipping)\s*[:=]\s*(?:rp\.?\s*)?([\d.,]+)/i
  ];

  const phonePattern = /(?:08|\+628)[0-9\s-]{8,14}/;

  // Process line by line
  for (const line of lines) {
    let handled = false;

    // Phone extract
    if (!customerPhone) {
      const phoneMatch = line.match(phonePattern);
      if (phoneMatch) {
        customerPhone = phoneMatch[0].replace(/[\s-]/g, '');
      }
    }

    // Name extract
    if (!customerName) {
      for (const pattern of namePatterns) {
        const match = line.match(pattern);
        if (match && match[1]) {
          customerName = match[1].replace(/^(kak|mas|mbak|pak|bu)\s+/i, '').trim();
          handled = true;
          break;
        }
      }
    }

    // Address extract
    if (!address) {
      for (const pattern of addressPatterns) {
        const match = line.match(pattern);
        if (match && match[1]) {
          address = match[1].trim();
          handled = true;
          break;
        }
      }
    }

    // Notes extract
    if (!handled && !notes) {
      for (const pattern of notesPatterns) {
        const match = line.match(pattern);
        if (match && match[1]) {
          notes = match[1].trim();
          handled = true;
          break;
        }
      }
    }

    // Payment extract
    if (!handled && paymentMethod === 'Transfer / WA') {
      for (const pattern of paymentPatterns) {
        const match = line.match(pattern);
        if (match && match[1]) {
          paymentMethod = match[1].trim();
          handled = true;
          break;
        }
      }
      // Check direct keywords like QRIS, BCA, COD
      if (!handled) {
        if (/qris/i.test(line)) paymentMethod = 'QRIS';
        else if (/bca/i.test(line)) paymentMethod = 'Transfer BCA';
        else if (/cod|cash/i.test(line)) paymentMethod = 'COD (Cash)';
      }
    }

    // Shipping extract
    if (!handled && shippingFee === 0) {
      for (const pattern of shippingPatterns) {
        const match = line.match(pattern);
        if (match && match[1]) {
          const numStr = match[1].replace(/[.,]/g, '');
          const parsedNum = parseInt(numStr, 10);
          if (!isNaN(parsedNum)) {
            shippingFee = parsedNum;
            handled = true;
            break;
          }
        }
      }
    }

    // If not metadata header, check if it's an item line
    if (!handled) {
      // Ignore greetings or header lines
      if (/^(halo|pagi|siang|malam|pesan|mau order|pesanan:?|order:?)$/i.test(line)) {
        continue;
      }

      // Try item parse regex
      // Examples: "2x Kopi Susu Aren", "2 Kopi Susu Aren", "- 1 Roti Bakar", "Kopi Susu Aren x2"
      const cleanedLine = line.replace(/^[-*•]\s*/, '').trim();

      let qty = 1;
      let rawProductName = cleanedLine;

      // Match "2x product" or "2 x product" or "2 product"
      const prefixQtyMatch = cleanedLine.match(/^(\d+)\s*(?:x|\*|pcs|cup|porsi)?\s+(.+)/i);
      // Match "product x2" or "product 2pcs"
      const suffixQtyMatch = cleanedLine.match(/^(.+?)\s+(?:x|\*)\s*(\d+)$/i);

      if (prefixQtyMatch) {
        qty = parseInt(prefixQtyMatch[1], 10);
        rawProductName = prefixQtyMatch[2].trim();
      } else if (suffixQtyMatch) {
        qty = parseInt(suffixQtyMatch[2], 10);
        rawProductName = suffixQtyMatch[1].trim();
      }

      // Try to match rawProductName with available products
      const matchedProduct = matchProduct(rawProductName, availableProducts);

      if (matchedProduct) {
        items.push({
          productId: matchedProduct.id,
          name: matchedProduct.name,
          price: matchedProduct.price,
          qty: qty,
          subtotal: matchedProduct.price * qty,
          stockAvailable: matchedProduct.stock,
          unit: matchedProduct.unit || 'pcs'
        });
      } else {
        // Try fallback if line contains price
        const priceMatch = cleanedLine.match(/(\d+)\s*k|\b(\d{4,6})\b/i);
        if (priceMatch) {
          const price = priceMatch[1] ? parseInt(priceMatch[1]) * 1000 : parseInt(priceMatch[2]);
          items.push({
            productId: `CUSTOM-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            name: rawProductName.replace(/(\d+)\s*k|\b(\d{4,6})\b/gi, '').trim() || rawProductName,
            price: price,
            qty: qty,
            subtotal: price * qty,
            stockAvailable: 999,
            unit: 'pcs',
            isCustom: true
          });
        } else if (rawProductName.length > 2) {
          unmatchedLines.push({
            rawLine: cleanedLine,
            suggestedQty: qty,
            suggestedName: rawProductName
          });
        }
      }
    }
  }

  // Fallback defaults
  if (!customerName) customerName = 'Pelanggan WA';

  return {
    customerName,
    customerPhone,
    address,
    notes,
    paymentMethod,
    shippingFee,
    items,
    unmatchedLines,
    rawText
  };
};

/**
 * Fuzzy matcher for product name / aliases
 */
const matchProduct = (query, products = []) => {
  if (!query || products.length === 0) return null;
  const cleanQuery = query.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();

  // 1. Exact match on name or code
  let found = products.find(p => p.name.toLowerCase() === cleanQuery || p.sku.toLowerCase() === cleanQuery);
  if (found) return found;

  // 2. Alias exact match
  found = products.find(p => p.aliases && p.aliases.some(alias => alias.toLowerCase() === cleanQuery));
  if (found) return found;

  // 3. Substring match (query includes product name or vice versa)
  found = products.find(p => {
    const nameLower = p.name.toLowerCase();
    return cleanQuery.includes(nameLower) || nameLower.includes(cleanQuery);
  });
  if (found) return found;

  // 4. Substring match on aliases
  found = products.find(p => {
    return p.aliases && p.aliases.some(alias => {
      const aliasLower = alias.toLowerCase();
      return cleanQuery.includes(aliasLower) || aliasLower.includes(cleanQuery);
    });
  });

  return found || null;
};
