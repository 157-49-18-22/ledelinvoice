  import { jsPDF } from 'jspdf';
  import html2canvas from 'html2canvas';
  import React from 'react';
  import ReactDOM from 'react-dom';

  /**
   * Exact pixel-match of InvoiceDocument (Code 2) as a dynamic component.
   * All Tailwind classes converted to precise inline styles.
   *
   * Tailwind reference used:
   *   text-xs       = 12px / line-height 16px
   *   text-sm       = 14px / line-height 20px
   *   text-lg       = 18px / line-height 28px
   *   font-bold     = font-weight 700
   *   bg-white      = #ffffff
   *   bg-blue-100   = #dbeafe
   *   bg-blue-900   = #1e3a8a
   *   text-white    = #ffffff
   *   text-gray-600 = #4b5563
   *   text-blue-700 = #1d4ed8
   *   border-black  = #000000
   *   p-6           = 24px
   *   p-3           = 12px
   *   p-2           = 8px
   *   p-1           = 4px
   *   px-3 py-1     = padding: 4px 12px
   *   px-1 py-1     = padding: 4px 4px
   *   gap-1         = 4px
   *   gap-2         = 8px
   *   mt-1          = 4px
   *   mt-2          = 8px
   *   mt-4          = 16px
   *   mt-8          = 32px
   *   mb-2          = 8px
   *   h-8           = 32px
   *   w-8           = 32px
   *   w-12          = 48px
   *   w-14          = 56px
   *   w-16          = 64px
   *   w-24          = 96px
   *   h-24          = 96px
   *   w-64          = 256px
   *   max-w-4xl     = 896px (we cap at 794px for A4)
   *   shadow-sm     = box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05)
   *   leading-tight = line-height: 1.25
   *   -mt-4         = margin-top: -16px
   */
  const ProformaDocumentDynamic = ({ invoice }) => {
    const supplier = invoice?.supplierData || {};
    const buyer = invoice?.buyerData || invoice?.selectedBuyer || {};
    const products = invoice?.products || [];
    const bankData = invoice?.bankData || {};

    const safe = (v) => { const n = parseFloat(v); return isNaN(n) ? 0 : n; };

    // GST logic (same as regular invoice)
    const isInterState = supplier?.state !== buyer?.state;
    const gstType = invoice?.gstType || 'auto';
    let showIGST = false, showSGST = false;
    if (gstType === 'auto') { showIGST = isInterState; showSGST = !isInterState; }
    else if (gstType === 'igst') { showIGST = true; }
    else if (gstType === 'sgst') { showSGST = true; }
    else if (gstType === 'both') { showIGST = true; showSGST = true; }

    let totalAmount = 0;

    const rows = products.map((p) => {
      const qty = safe(p.quantity);
      const rawRate = safe(p.salePrice);
      const gstRate = safe(p.gst);
      const cessRate = safe(p.cess || 0);

      let rate = rawRate;
      let amount = 0;
      let gstAmount = 0;

      if (p.taxType === 'inclusive') {
        rate = rawRate / (1 + ((gstRate + cessRate) / 100));
        amount = qty * rate;
        gstAmount = amount * (gstRate / 100);
      } else {
        amount = qty * rate;
        gstAmount = amount * (gstRate / 100);
      }

      const itemTotal = amount + gstAmount;
      totalAmount += itemTotal;

      return { qty, rate, amount, gstAmount, gstRate, cgst: gstAmount / 2, sgst: gstAmount / 2, itemTotal, p };
    });

    const finalInvoiceAmount = Math.round(totalAmount);

    const formatDate = (d) => {
      const date = new Date(d);
      return date.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }).split('/').join('-');
    };

    const FONT = "'Times New Roman', Times, serif";
    const BLACK = '#000000';
    const BLUE = '#1d4ed8';

    // pt→px scale: 794/596 ≈ 1.332
    // Page: 794×1123px | Left pad: 37px | Right pad: 41px | Content width: 716px
    // Logo: 278×191px, right margin 14px, top 3px
    // Footer bar top: ~1020px from top

    return (
      <div style={{
        background: '#ffffff',
        width: '794px',
        height: '1123px',
        margin: '0 auto',
        fontFamily: FONT,
        color: BLACK,
        boxSizing: 'border-box',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* ── LOGO: top-right ── */}
        {(supplier.proformaLogo || supplier.logo) && (
          <div style={{
            position: 'absolute',
            top: '-104px',
            right: '-1px',
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'flex-start',
          }}>
            <img
              src={supplier.proformaLogo || supplier.logo}
              alt="Logo"
              style={{
                width: '300px',
                height: 'auto',
                objectFit: 'contain',
                objectPosition: 'right top'
              }}
            />
          </div>
        )}

        {/* ── MAIN CONTENT: left 37px, right 41px, top 37px ── */}
        <div style={{ position: 'absolute', top: '37px', left: '37px', right: '41px', bottom: '160px', display: 'flex', flexDirection: 'column' }}>

          {/* Title */}
          <div style={{ textAlign: 'center', fontSize: '18px', fontWeight: 700, textDecoration: 'underline', marginBottom: '16px', marginTop: '120px' }}>
            PROFORMA INVOICE
          </div>

          {/* Proforma No & Date */}
          <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '16px' }}>
            <div style={{ marginBottom: '3px' }}>Proforma No: {invoice.invoiceNumber || invoice.number}</div>
            <div>Proforma Date: {formatDate(invoice.date)}</div>
          </div>

          {/* Service Provider | Bill To */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '11px', gap: '16px', borderBottom: '1px dashed #999', paddingBottom: '12px' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, marginBottom: '6px' }}>Service Provider -</div>
              <div style={{ fontWeight: 700 }}>{supplier.name || supplier.companyName}</div>
              <div>{supplier.address}</div>
              <div>{[supplier.city, supplier.state].filter(Boolean).join(', ')}{supplier.pincode ? ` - ${supplier.pincode}` : ''}</div>
              <div style={{ marginTop: '6px' }}><span style={{ fontWeight: 700 }}>GSTIN: </span>{supplier.gstin}</div>
              <div><span style={{ fontWeight: 700 }}>State: </span>{supplier.state}{supplier.stateCode ? ` (Code: ${supplier.stateCode})` : ''}</div>
            </div>
            <div style={{ flex: 1, minWidth: 0, textAlign: 'right' }}>
              <div style={{ fontWeight: 700, marginBottom: '6px' }}>Bill To</div>
              <div style={{ fontWeight: 700 }}>{buyer.name || buyer.companyName}</div>
              <div>{buyer.address}</div>
              <div>{[buyer.city, buyer.state].filter(Boolean).join(', ')}{buyer.pincode ? ` - ${buyer.pincode}` : ''}</div>
              <div style={{ marginTop: '6px' }}><span style={{ fontWeight: 700 }}>GSTIN: </span>{buyer.gstin}</div>
              <div><span style={{ fontWeight: 700 }}>State: </span>{buyer.state}{buyer.stateCode ? ` (Code: ${buyer.stateCode})` : ''}</div>
            </div>
          </div>

          {/* Project Description */}
          <div style={{ marginBottom: '16px', fontSize: '13px' }}>
            <div style={{ fontWeight: 700, marginBottom: '3px' }}>Project Description</div>
            <div>{products[0]?.name || products[0]?.description || 'Services Rendered'}</div>
          </div>

          {/* Amount Details Table */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontWeight: 700, marginBottom: '6px', fontSize: '13px' }}>Amount Details</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f3f4f6' }}>
                  <th style={{ border: '1px solid #000', padding: '5px 6px', textAlign: 'left' }}>Description</th>
                  <th style={{ border: '1px solid #000', padding: '5px 6px', textAlign: 'center' }}>Rate</th>
                  {showIGST && <>
                    <th style={{ border: '1px solid #000', padding: '5px 6px', textAlign: 'center' }}>IGST Rate</th>
                    <th style={{ border: '1px solid #000', padding: '5px 6px', textAlign: 'center' }}>IGST Amount</th>
                  </>}
                  {showSGST && <>
                    <th style={{ border: '1px solid #000', padding: '5px 6px', textAlign: 'center' }}>CGST Rate</th>
                    <th style={{ border: '1px solid #000', padding: '5px 6px', textAlign: 'center' }}>CGST Amount</th>
                    <th style={{ border: '1px solid #000', padding: '5px 6px', textAlign: 'center' }}>SGST Rate</th>
                    <th style={{ border: '1px solid #000', padding: '5px 6px', textAlign: 'center' }}>SGST Amount</th>
                  </>}
                  <th style={{ border: '1px solid #000', padding: '5px 6px', textAlign: 'center' }}>Total Amount Payable</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i}>
                    <td style={{ border: '1px solid #000', padding: '5px 6px' }}>
                      <div style={{ fontWeight: 600 }}>{row.p.name}</div>
                      {row.p.description && <div style={{ fontSize: '10px', color: '#4b5563', fontStyle: 'italic', marginTop: '2px' }}>{row.p.description}</div>}
                    </td>
                    <td style={{ border: '1px solid #000', padding: '5px 6px', textAlign: 'center' }}>₹ {row.rate.toFixed(2)}</td>
                    {showIGST && <>
                      <td style={{ border: '1px solid #000', padding: '5px 6px', textAlign: 'center' }}>{row.gstRate.toFixed(2)}%</td>
                      <td style={{ border: '1px solid #000', padding: '5px 6px', textAlign: 'center' }}>₹ {row.gstAmount.toFixed(2)}</td>
                    </>}
                    {showSGST && <>
                      <td style={{ border: '1px solid #000', padding: '5px 6px', textAlign: 'center' }}>{(row.gstRate / 2).toFixed(2)}%</td>
                      <td style={{ border: '1px solid #000', padding: '5px 6px', textAlign: 'center' }}>₹ {row.cgst.toFixed(2)}</td>
                      <td style={{ border: '1px solid #000', padding: '5px 6px', textAlign: 'center' }}>{(row.gstRate / 2).toFixed(2)}%</td>
                      <td style={{ border: '1px solid #000', padding: '5px 6px', textAlign: 'center' }}>₹ {row.sgst.toFixed(2)}</td>
                    </>}
                    <td style={{ border: '1px solid #000', padding: '5px 6px', textAlign: 'center', fontWeight: 700 }}>₹ {row.itemTotal.toFixed(2)}</td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={2 + (showIGST ? 2 : 0) + (showSGST ? 4 : 0)} style={{ border: '1px solid #000', padding: '5px 6px', textAlign: 'right', fontWeight: 700 }}>Grand Total</td>
                  <td style={{ border: '1px solid #000', padding: '5px 6px', textAlign: 'center', fontWeight: 700, fontSize: '13px' }}>₹ {finalInvoiceAmount.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Payment Details */}
          {bankData?.bankName && (
            <div style={{ marginBottom: '16px', fontSize: '12px' }}>
              <div style={{ fontWeight: 700, marginBottom: '6px' }}>Payment Details</div>
              <div><span style={{ fontWeight: 700 }}>Account Name: </span>{bankData.accountHolderName || supplier.name || supplier.companyName}</div>
              <div><span style={{ fontWeight: 700 }}>Account No.: </span>{bankData.accountNumber}</div>
              <div><span style={{ fontWeight: 700 }}>IFSC Code: </span>{bankData.ifscCode}</div>
              <div><span style={{ fontWeight: 700 }}>Bank Name: </span>{bankData.bankName}</div>
              {bankData.branchName && <div><span style={{ fontWeight: 700 }}>Branch: </span>{bankData.branchName}</div>}
            </div>
          )}

          {/* Notes */}
          <div style={{ marginBottom: '16px', fontSize: '12px' }}>
            <div style={{ fontWeight: 700, marginBottom: '4px' }}>Notes</div>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              <li>This is a <span style={{ fontWeight: 700 }}>Proforma Invoice</span> issued for advance/payment reference.</li>
              <li>Final <span style={{ fontWeight: 700 }}>Tax Invoice</span> will be issued after receipt of payment.</li>
            </ul>
          </div>

          {/* Signatory */}
          <div style={{ marginTop: 'auto', fontSize: '13px' }}>
            <div style={{ fontWeight: 700, marginBottom: '56px' }}>For {supplier.name || supplier.companyName}</div>
            {invoice.includeSignature && invoice.signatureImage && (
              <div style={{ marginTop: '-52px', marginBottom: '6px' }}>
                <img src={invoice.signatureImage} alt="Signature" style={{ maxHeight: '52px' }} />
              </div>
            )}
            <div>Authorized Signatory,<br />{supplier.name || supplier.companyName}<br />Managing Director</div>
          </div>
        </div>

        {/* ── FOOTER: absolute at bottom, bar at y≈1020px ── */}
        {/* Blue bar: left 42px, right 42px (matches 31.3pt → 42px, 566.8pt → 755px) */}
        <div style={{ position: 'absolute', left: '42px', right: '42px', bottom: '95px', borderTop: '5px solid #1d4ed8' }} />

        {/* Address centered below bar */}
        <div style={{
          position: 'absolute', left: '42px', right: '42px', bottom: '62px',
          textAlign: 'center', fontSize: '13px', fontFamily: FONT, fontWeight: 'normal', color: BLACK,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill={BLUE} style={{ flexShrink: 0 }}>
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
          {[supplier.address, supplier.city, supplier.state && supplier.pincode ? `${supplier.state}-${supplier.pincode}` : supplier.state].filter(Boolean).join(', ')}
        </div>

        {/* Contact row: email | phone | website */}
        <div style={{
          position: 'absolute', left: '42px', right: '42px', bottom: '22px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontSize: '13px', fontFamily: FONT, fontWeight: 'normal', color: BLACK,
        }}>
          {supplier.email && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill={BLUE}><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" /></svg>
              <span style={{ color: BLUE, textDecoration: 'underline' }}>{supplier.email}</span>
            </div>
          )}
          {supplier.phone && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill={BLUE}><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" /></svg>
              {supplier.phone}
            </div>
          )}
          {supplier.website && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill={BLUE}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" /></svg>
              {supplier.website}
            </div>
          )}
        </div>
      </div>
    );
  };


  const InvoiceDocumentDynamic = ({ invoice }) => {
    const supplier = invoice?.supplierData || {};
    const buyer = invoice?.buyerData || invoice?.selectedBuyer || {};
    const products = invoice?.products || [];
    const bankData = invoice?.bankData || {};
    const discountPercent = parseFloat(invoice?.discountPercent || 0);
    const tdsEnabled = invoice?.tdsEnabled || false;
    const tdsRate = parseFloat(invoice?.tdsPercent || 0);

    // GST logic
    const isInterState = supplier?.state !== buyer?.state;
    const gstType = invoice?.gstType || 'auto';
    let showIGST = false, showSGST = false;
    if (gstType === 'auto') { showIGST = isInterState; showSGST = !isInterState; }
    else if (gstType === 'igst') { showIGST = true; }
    else if (gstType === 'sgst') { showSGST = true; }
    else if (gstType === 'both') { showIGST = true; showSGST = true; }

    const safe = (v) => { const n = parseFloat(v); return isNaN(n) ? 0 : n; };

    let subTotal = 0, totalGST = 0, totalIGST = 0, totalSGST = 0, totalQty = 0;

    const rows = products.map((p) => {
      const qty = safe(p.quantity);
      const rawRate = safe(p.salePrice);
      const gstRate = safe(p.gst);
      const cessRate = safe(p.cess || 0);
      let rate = rawRate, amount = 0, gstAmount = 0;
      if (p.taxType === 'inclusive') {
        rate = rawRate / (1 + ((gstRate + cessRate) / 100));
        amount = qty * rate;
        gstAmount = amount * (gstRate / 100);
      } else {
        amount = qty * rate;
        gstAmount = amount * (gstRate / 100);
      }
      subTotal += amount;
      totalGST += gstAmount;
      totalQty += qty;
      if (showIGST) totalIGST += gstAmount;
      if (showSGST) { totalSGST += gstAmount / 2; }
      return { qty, rate, amount, gstAmount, gstRate, cgst: gstAmount / 2, sgst: gstAmount / 2, p };
    });

    const totalWithTax = subTotal + totalGST;
    const discountAmount = totalWithTax * (discountPercent / 100);
    const grandTotal = totalWithTax - discountAmount;
    const roundOff = Math.round(grandTotal) - grandTotal;
    const afterRoundOff = Math.round(grandTotal);
    const tdsAmount = tdsEnabled ? afterRoundOff * (tdsRate / 100) : 0;
    const finalAmount = afterRoundOff - tdsAmount;

    // en-IN locale formatting (e.g. 1,23,456.00)
    const fmt = (n) => n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const formatDate = (d) => {
      const date = new Date(d);
      return date.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }).split('/').join('-');
    };

    // Number to words (handles crores)
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
      'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tensW = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const numToWords = (n) => {
      if (n === 0) return 'Zero';
      const conv = (num) => {
        if (num < 20) return ones[num];
        if (num < 100) return tensW[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : '');
        if (num < 1000) return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 ? ' ' + conv(num % 100) : '');
        if (num < 100000) return conv(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 ? ' ' + conv(num % 1000) : '');
        if (num < 10000000) return conv(Math.floor(num / 100000)) + ' Lakh' + (num % 100000 ? ' ' + conv(num % 100000) : '');
        return conv(Math.floor(num / 10000000)) + ' Crore' + (num % 10000000 ? ' ' + conv(num % 10000000) : '');
      };
      return conv(Math.abs(Math.round(n)));
    };

    // ─── Exact Tailwind → inline style map ────────────────────────────────────
    const FONT = "'Arial', 'Helvetica Neue', Helvetica, sans-serif";
    const BLACK = '#000000';
    const BLUE100 = '#dbeafe';  // bg-blue-100
    const BLUE900 = '#1e3a8a';  // bg-blue-900
    const GRAY600 = '#4b5563';  // text-gray-600
    const BLUE700 = '#1d4ed8';  // text-blue-700
    const WHITE = '#ffffff';

    // border shorthand
    const B = `1px solid ${BLACK}`;

    return (
      // bg-white p-6 max-w-4xl mx-auto shadow-sm
      <div style={{
        background: WHITE,
        padding: '24px',
        maxWidth: '794px',
        margin: '0 auto',
        boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)',
        fontFamily: FONT,
        color: BLACK,
        boxSizing: 'border-box',
      }}>

        {/* text-center text-xs text-gray-600 mb-2 */}
        <div style={{ textAlign: 'center', fontSize: '12px', lineHeight: '16px', color: GRAY600, marginBottom: '8px' }}>
          Thank-you for doing business with us
        </div>

        {/* border border-black */}
        <div style={{ border: B }}>

          {/* ── Seller Info: flex border-b border-black ── */}
          <div style={{ display: 'flex', borderBottom: B }}>

            {/* w-24 h-24 border-r border-black flex items-center justify-center p-2 */}
            <div style={{
              width: '96px', height: '96px', borderRight: B,
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px', flexShrink: 0,
            }}>
              <div style={{
                width: '64px', height: '64px', background: supplier.logo ? 'transparent' : BLUE900, borderRadius: '4px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {supplier.logo
                  ? <img alt="Logo" src={supplier.logo} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  : /* text-white text-xs font-bold text-center leading-tight */
                  <span style={{ color: WHITE, fontSize: '12px', fontWeight: 700, textAlign: 'center', lineHeight: 1.25 }}>
                    {(supplier.name || supplier.companyName || 'MAYDIV INFOTECH').split(' ').slice(0, 2).join('\n').split('\n').map((w, i) => <span key={i} style={{ display: 'block' }}>{w}</span>)}
                  </span>
                }
              </div>
            </div>

            {/* flex-1 p-3 text-center */}
            <div style={{ flex: 1, padding: '12px', textAlign: 'center' }}>
              {/* font-bold text-lg */}
              <h1 style={{ fontWeight: 700, fontSize: '18px', lineHeight: '28px', margin: 0 }}>
                {supplier.name || supplier.companyName || 'MAYDIV INFOTECH'}
              </h1>
              {/* text-xs */}
              <p style={{ fontSize: '12px', lineHeight: '16px', margin: '2px 0 0' }}>
                {[supplier.address, supplier.city, supplier.state, supplier.pincode].filter(Boolean).join(', ')}
              </p>
              {/* flex items-center justify-center gap-2 mt-1 text-xs */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '4px', fontSize: '12px', lineHeight: '16px' }}>
                {supplier.phone && <span>📞 {supplier.phone}</span>}
                {supplier.email && <span>✉ {supplier.email}</span>}
              </div>
              {/* flex items-center justify-center gap-2 mt-1 text-xs */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '4px', fontSize: '12px', lineHeight: '16px' }}>
                <span>GSTIN : {supplier.gstin}</span>
                {supplier.stateCode &&
                  <span style={{ border: B, padding: '0 4px' }}>State Code : {supplier.stateCode}</span>
                }
              </div>
            </div>
          </div>

          {/* ── Tax Invoice Title: bg-blue-100 border-b border-black py-2 text-center ── */}
          <div style={{ background: BLUE100, borderBottom: B, padding: '8px 8px', textAlign: 'center', position: 'relative' }}>
            {/* font-bold text-lg */}
            <h2 style={{ fontWeight: 700, fontSize: '18px', lineHeight: '28px', margin: 0 }}>
              {invoice.invoiceType === 'bill-of-supply' ? 'BILL OF SUPPLY' : 'TAX INVOICE'}
            </h2>
            {/* text-xs text-right pr-2 -mt-4  →  absolute top-right */}
            <p style={{ fontSize: '12px', lineHeight: '16px', margin: 0, position: 'absolute', right: '8px', top: '8px' }}>
              Original For Recipient
            </p>
          </div>

          {/* ── Invoice Details: border-b border-black ── */}
          <div style={{ borderBottom: B }}>
            {[
              ['Invoice Number', invoice.invoiceNumber || invoice.number],
              ['Invoice Date', formatDate(invoice.date)],
              ['State', (supplier.state || '').toUpperCase()],
              ['Reverse Charge', 'NO'],
            ].map(([label, value], i, arr) => (
              <div key={label} style={{
                display: 'flex', justifyContent: 'space-between',
                padding: '4px 12px', fontSize: '12px', lineHeight: '16px',
                borderBottom: i < arr.length - 1 ? `1px solid #e5e7eb` : 'none',
              }}>
                <span>{label}</span>
                <span style={{ fontWeight: 700 }}>{value}</span>
              </div>
            ))}
          </div>

          {/* ── Receiver Header: bg-blue-100 border-b border-black py-1 text-center ── */}
          <div style={{ background: BLUE100, borderBottom: B, padding: '4px', textAlign: 'center' }}>
            <p style={{ fontSize: '12px', lineHeight: '16px', fontWeight: 700, margin: 0 }}>
              Details of Receiver | Billed to
            </p>
          </div>

          {/* ── Receiver Details: border-b border-black p-3 text-xs ── */}
          <div style={{ borderBottom: B, padding: '12px', fontSize: '12px', lineHeight: '16px' }}>
            <p style={{ margin: 0 }}><span style={{ fontWeight: 700 }}>Name:</span> {buyer.name || buyer.companyName}</p>
            <p style={{ margin: '4px 0 0' }}><span style={{ fontWeight: 700 }}>Address:</span> {buyer.address}</p>
            <p style={{ margin: '4px 0 0' }}>
              <span style={{ fontWeight: 700 }}>GSTIN:</span> {buyer.gstin || 'Not specified'}
              {buyer.stateCode && <span style={{ border: B, padding: '0 4px', marginLeft: '4px' }}>State Code : {buyer.stateCode}</span>}
            </p>
            <p style={{ margin: '4px 0 0' }}><span style={{ fontWeight: 700 }}>State:</span> {buyer.state}</p>
          </div>

          {/* ── Items Table: w-full border-collapse text-xs ── */}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', lineHeight: '16px' }}>
            <thead>
              <tr style={{ background: BLUE100 }}>
                {/* Each th: border border-black px-1 py-1 */}
                <th style={{ border: B, padding: '4px', width: '32px', fontWeight: 700 }}>Sr. No.</th>
                <th style={{ border: B, padding: '4px', textAlign: 'left', fontWeight: 700 }}>Name of Product</th>
                <th style={{ border: B, padding: '4px', width: '48px', fontWeight: 700 }}>HSN/SAC</th>
                <th style={{ border: B, padding: '4px', width: '32px', fontWeight: 700 }}>QTY</th>
                <th style={{ border: B, padding: '4px', width: '32px', fontWeight: 700 }}>Unit</th>
                <th style={{ border: B, padding: '4px', width: '56px', fontWeight: 700 }}>Rate</th>
                <th style={{ border: B, padding: '4px', width: '56px', fontWeight: 700 }}>Taxable<br />Value</th>
                {showIGST && <>
                  <th style={{ border: B, padding: '4px', width: '40px', fontWeight: 700 }}>IGST<br />Rate</th>
                  <th style={{ border: B, padding: '4px', width: '56px', fontWeight: 700 }}>IGST<br />Amount</th>
                </>}
                {showSGST && <>
                  <th style={{ border: B, padding: '4px', width: '40px', fontWeight: 700 }}>CGST<br />Rate</th>
                  <th style={{ border: B, padding: '4px', width: '56px', fontWeight: 700 }}>CGST<br />Amount</th>
                  <th style={{ border: B, padding: '4px', width: '40px', fontWeight: 700 }}>SGST<br />Rate</th>
                  <th style={{ border: B, padding: '4px', width: '56px', fontWeight: 700 }}>SGST<br />Amount</th>
                </>}
                <th style={{ border: B, padding: '4px', width: '64px', fontWeight: 700 }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ qty, rate, amount, gstAmount, gstRate, cgst, sgst, p }, i) => (
                <tr key={i}>
                  <td style={{ border: B, padding: '4px', textAlign: 'center' }}>{i + 1}</td>
                  <td style={{ border: B, padding: '4px', textAlign: 'left' }}>
                    <span style={{ fontWeight: 700 }}>{p.name}</span>
                    {p.description && <><br /><span style={{ fontSize: '12px' }}>{p.description}</span></>}
                  </td>
                  <td style={{ border: B, padding: '4px', textAlign: 'center' }}>{p.hsn}</td>
                  <td style={{ border: B, padding: '4px', textAlign: 'center' }}>{qty}</td>
                  <td style={{ border: B, padding: '4px', textAlign: 'center' }}>{p.unit || ''}</td>
                  <td style={{ border: B, padding: '4px', textAlign: 'right' }}>{rate.toFixed(1)}</td>
                  <td style={{ border: B, padding: '4px', textAlign: 'right' }}>{fmt(amount)}</td>
                  {showIGST && <>
                    <td style={{ border: B, padding: '4px', textAlign: 'right' }}>{gstRate.toFixed(2)}%</td>
                    <td style={{ border: B, padding: '4px', textAlign: 'right' }}>{fmt(gstAmount)}</td>
                  </>}
                  {showSGST && <>
                    <td style={{ border: B, padding: '4px', textAlign: 'right' }}>{(gstRate / 2).toFixed(2)}%</td>
                    <td style={{ border: B, padding: '4px', textAlign: 'right' }}>{fmt(cgst)}</td>
                    <td style={{ border: B, padding: '4px', textAlign: 'right' }}>{(gstRate / 2).toFixed(2)}%</td>
                    <td style={{ border: B, padding: '4px', textAlign: 'right' }}>{fmt(sgst)}</td>
                  </>}
                  <td style={{ border: B, padding: '4px', textAlign: 'right' }}>₹ {fmt(amount + gstAmount)}</td>
                </tr>
              ))}

              {/* Empty spacer row — h-8 = 32px */}
              <tr>
                {Array.from({ length: 7 + (showIGST ? 2 : 0) + (showSGST ? 4 : 0) }).map((_, i) => (
                  <td key={i} style={{ border: B, padding: '4px', height: '32px' }}></td>
                ))}
              </tr>

              {/* Total row — bg-blue-100 */}
              <tr style={{ background: BLUE100 }}>
                <td style={{ border: B, padding: '4px' }}></td>
                <td style={{ border: B, padding: '4px', textAlign: 'center', fontWeight: 700 }}>Total</td>
                <td style={{ border: B, padding: '4px' }}></td>
                <td style={{ border: B, padding: '4px', textAlign: 'center', fontWeight: 700 }}>{totalQty}</td>
                <td style={{ border: B, padding: '4px' }}></td>
                <td style={{ border: B, padding: '4px' }}></td>
                <td style={{ border: B, padding: '4px', textAlign: 'right', fontWeight: 700 }}>₹ {fmt(subTotal)}</td>
                {showIGST && <>
                  <td style={{ border: B, padding: '4px' }}></td>
                  <td style={{ border: B, padding: '4px', textAlign: 'right', fontWeight: 700 }}>₹ {fmt(totalIGST)}</td>
                </>}
                {showSGST && <>
                  <td style={{ border: B, padding: '4px' }}></td>
                  <td style={{ border: B, padding: '4px', textAlign: 'right', fontWeight: 700 }}>₹ {fmt(totalSGST)}</td>
                  <td style={{ border: B, padding: '4px' }}></td>
                  <td style={{ border: B, padding: '4px', textAlign: 'right', fontWeight: 700 }}>₹ {fmt(totalSGST)}</td>
                </>}
                <td style={{ border: B, padding: '4px', textAlign: 'right', fontWeight: 700 }}>₹ {fmt(totalWithTax)}</td>
              </tr>
            </tbody>
          </table>

          {/* ── Bottom Section + Terms: single outer border-t, two rows of flex columns ── */}
          <div style={{ borderTop: B }}>

            {/* Row 1: Amount in words / Bank  |  Totals */}
            <div style={{ display: 'flex', alignItems: 'stretch', borderBottom: B }}>

              {/* Left col */}
              <div style={{ flex: 1, borderRight: B, display: 'flex', flexDirection: 'column' }}>

                {/* Amount in words */}
                <div style={{ padding: '8px', textAlign: 'center', borderBottom: B }}>
                  <p style={{ fontSize: '12px', lineHeight: '16px', fontWeight: 700, margin: 0 }}>
                    Total Invoice Amount in words
                  </p>
                  <p style={{ fontSize: '12px', lineHeight: '16px', margin: '4px 0 0' }}>
                    {numToWords(finalAmount)} Rupees Only /-
                  </p>
                </div>

                {/* Bank details */}
                {bankData?.bankName && (
                  <div style={{ padding: '8px', flex: 1 }}>
                    <p style={{ fontSize: '12px', lineHeight: '16px', fontWeight: 700, color: BLUE700, margin: '0 0 4px' }}>
                      🏦 Bank and Payment Details
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: '16px', rowGap: '3px', fontSize: '12px', lineHeight: '16px' }}>
                      <span>Account Name</span>
                      <span style={{ fontWeight: 700, textAlign: 'right' }}>{bankData.accountHolderName || supplier.name || supplier.companyName}</span>
                      <span>Account No.</span>
                      <span style={{ fontWeight: 700, textAlign: 'right' }}>{bankData.accountNumber}</span>
                      <span>IFSC Code</span>
                      <span style={{ fontWeight: 700, textAlign: 'right' }}>{bankData.ifscCode}</span>
                      <span>Bank Name</span>
                      <span style={{ fontWeight: 700, textAlign: 'right' }}>{bankData.bankName}</span>
                      {bankData.branchName && <>
                        <span>Branch Name</span>
                        <span style={{ fontWeight: 700, textAlign: 'right' }}>{bankData.branchName}</span>
                      </>}
                    </div>
                  </div>
                )}
              </div>

              {/* Right col — totals panel, width matches Code 2's w-64 */}
              <div style={{ width: '256px', flexShrink: 0, fontSize: '12px', lineHeight: '16px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', borderBottom: B }}>
                  <span style={{ flex: 1, padding: '4px' }}>Total Amount Before Tax</span>
                  <span style={{ width: '96px', padding: '4px', textAlign: 'right', fontWeight: 700 }}>₹ {fmt(subTotal)}</span>
                </div>
                {showIGST && (
                  <div style={{ display: 'flex', borderBottom: B }}>
                    <span style={{ flex: 1, padding: '4px' }}>Add : IGST</span>
                    <span style={{ width: '96px', padding: '4px', textAlign: 'right', fontWeight: 700 }}>₹ {fmt(totalIGST)}</span>
                  </div>
                )}
                {showSGST && <>
                  <div style={{ display: 'flex', borderBottom: B }}>
                    <span style={{ flex: 1, padding: '4px' }}>Add : CGST</span>
                    <span style={{ width: '96px', padding: '4px', textAlign: 'right', fontWeight: 700 }}>₹ {fmt(totalSGST)}</span>
                  </div>
                  <div style={{ display: 'flex', borderBottom: B }}>
                    <span style={{ flex: 1, padding: '4px' }}>Add : SGST</span>
                    <span style={{ width: '96px', padding: '4px', textAlign: 'right', fontWeight: 700 }}>₹ {fmt(totalSGST)}</span>
                  </div>
                </>}
                <div style={{ display: 'flex', borderBottom: B }}>
                  <span style={{ flex: 1, padding: '4px' }}>Total Tax Amount</span>
                  <span style={{ width: '96px', padding: '4px', textAlign: 'right', fontWeight: 700 }}>₹ {fmt(totalGST)}</span>
                </div>
                {discountPercent > 0 && (
                  <div style={{ display: 'flex', borderBottom: B }}>
                    <span style={{ flex: 1, padding: '4px' }}>Discount ({discountPercent}%)</span>
                    <span style={{ width: '96px', padding: '4px', textAlign: 'right', fontWeight: 700 }}>-₹ {fmt(discountAmount)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', borderBottom: B }}>
                  <span style={{ flex: 1, padding: '4px' }}>Round Off Value</span>
                  <span style={{ width: '96px', padding: '4px', textAlign: 'right', fontWeight: 700 }}>₹ {roundOff.toFixed(2)}</span>
                </div>
                {tdsEnabled && tdsRate > 0 && (
                  <div style={{ display: 'flex', borderBottom: B, background: '#fff3cd' }}>
                    <span style={{ flex: 1, padding: '4px' }}>Less: TDS ({tdsRate}%)</span>
                    <span style={{ width: '96px', padding: '4px', textAlign: 'right', fontWeight: 700 }}>-₹ {fmt(tdsAmount)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', borderBottom: B }}>
                  <span style={{ flex: 1, padding: '4px', fontWeight: 700 }}>Final Invoice Amount</span>
                  <span style={{ width: '96px', padding: '4px', textAlign: 'right', fontWeight: 700 }}>₹ {fmt(finalAmount)}</span>
                </div>
                <div style={{ display: 'flex', flex: 1 }}>
                  <span style={{ flex: 1, padding: '4px', fontWeight: 700 }}>Balance Due</span>
                  <span style={{ width: '96px', padding: '4px', textAlign: 'right', fontWeight: 700 }}>₹ {fmt(finalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Row 2: Terms  |  Signature — same two-column split, aligned with row above */}
            <div style={{ display: 'flex', alignItems: 'stretch' }}>

              {/* Terms — flex-1 matches left col above */}
              <div style={{ flex: 1, borderRight: B, padding: '8px' }}>
                <p style={{ fontSize: '12px', lineHeight: '16px', fontWeight: 700, margin: 0 }}>Terms And Conditions</p>
                <p style={{ fontSize: '12px', lineHeight: '16px', margin: '4px 0 0' }}>
                  1. This is an electronically generated document.{' '} <br />
                  2. All disputes are subject to {supplier.city || 'Local'} jurisdiction.
                </p>
              </div>

              {/* Signature — w-64 = 256px matches right col above */}
              <div style={{ width: '256px', flexShrink: 0, padding: '8px', textAlign: 'center' }}>
                <p style={{ fontSize: '12px', lineHeight: '16px', margin: 0 }}>
                  Certified that the particular given above are true and correct
                </p>
                <p style={{ fontSize: '12px', lineHeight: '16px', fontWeight: 700, marginTop: '4px' }}>
                  For, {supplier.name || supplier.companyName || 'MAYDIV INFOTECH'}
                </p>
                {invoice.includeSignature && invoice.signatureImage && (
                  <img src={invoice.signatureImage} alt="Signature" style={{ maxHeight: '48px', margin: '8px auto', display: 'block' }} />
                )}
                <p style={{ fontSize: '12px', lineHeight: '16px', marginTop: '32px' }}>Authorised Signatory</p>
              </div>
            </div>

          </div>

        </div>{/* end border border-black */}

        {/* Footer: text-center text-xs text-gray-600 mt-2 */}
        <div style={{ textAlign: 'center', fontSize: '12px', lineHeight: '16px', color: GRAY600, marginTop: '8px' }}>
          Thankyou for your business
        </div>

      </div>
    );
  };

  /**
   * Generate a PDF invoice — always fits on ONE single portrait A4 page.
   * Renders InvoiceDocumentDynamic which is an exact inline-style replica of
   * InvoiceDocument (Code 2) — same font, colors, spacing, and layout.
   *
   * @param {Object} invoice - The invoice data object (same shape as InvoiceTemplate expects)
   */
  export const generatePDF = async (invoice) => {
    try {
      console.log('Starting PDF generation with invoice:', invoice);

      // A4 Portrait at 96 DPI: 210mm × 297mm
      const A4_WIDTH_PX = 794;
      const A4_HEIGHT_PX = 1123;

      const tempContainer = document.createElement('div');
      tempContainer.style.cssText = [
        'position:fixed',
        'left:-10000px',
        'top:0',
        `width:${A4_WIDTH_PX}px`,
        `height:${A4_HEIGHT_PX}px`,
        'background:white',
        'overflow:hidden',
        'margin:0',
        'padding:0',
      ].join(';');
      document.body.appendChild(tempContainer);

      await new Promise((resolve) => {
        ReactDOM.render(
          invoice.type === 'proforma-invoice' || invoice.invoiceType === 'proforma-invoice'
            ? <ProformaDocumentDynamic invoice={invoice} />
            : <InvoiceDocumentDynamic invoice={invoice} />,
          tempContainer,
          () => setTimeout(resolve, 1000),
        );
      });

      console.log('Template rendering complete');

      // Capture at 3× for sharpness
      const canvas = await html2canvas(tempContainer, {
        scale: 3,
        useCORS: true,
        logging: false,
        backgroundColor: 'white',
        width: A4_WIDTH_PX,
        height: A4_HEIGHT_PX,
        windowWidth: A4_WIDTH_PX,
        windowHeight: A4_HEIGHT_PX,
      });

      console.log(`Canvas: ${canvas.width}px × ${canvas.height}px`);

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      // Canvas matches A4 ratio exactly → fills page perfectly, no scaling artifacts
      pdf.addImage(canvas.toDataURL('image/jpeg', 1.0), 'JPEG', 0, 0, 210, 297);
      const isProforma = invoice.type === 'proforma-invoice' || invoice.invoiceType === 'proforma-invoice';
      const fileNamePrefix = isProforma ? 'Proforma' : 'Invoice';
      pdf.save(`${fileNamePrefix}-${invoice.invoiceNumber || invoice.number || '1'}.pdf`);

      console.log('PDF saved — single portrait A4 page');

      document.body.removeChild(tempContainer);
      return true;
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('PDF generation failed: ' + error.message);
      return false;
    }
  };
