import React, { forwardRef, useEffect } from 'react';
import './InvoiceTemplate.css';
import { numberToWords } from '../utils/numberToWords';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).split('/').join('-');
};

const InvoiceTemplate = forwardRef(({ data = {}, bankData = null, forPDF = false }, ref) => {
  useEffect(() => {
    console.log('InvoiceTemplate mounted and ready');
  }, [data, bankData]);

  const buyerDataToUse = data?.buyerData || data?.selectedBuyer || {};

  const {
    invoiceNumber = '',
    number = '',
    date = new Date(),
    products = [],
    supplierData = {},
    gstType = 'auto',
    discountPercent = 0,
    tdsEnabled = false,
    tdsPercent = 0
  } = data || {};

  const isInterState = supplierData?.state !== buyerDataToUse?.state;

  let showIGST = false;
  let showSGST = false;

  if (gstType === 'auto') {
    showIGST = isInterState;
    showSGST = !isInterState;
  } else if (gstType === 'igst') {
    showIGST = true;
    showSGST = false;
  } else if (gstType === 'sgst') {
    showIGST = false;
    showSGST = true;
  } else if (gstType === 'both') {
    showIGST = true;
    showSGST = true;
  }

  const safeCalculate = (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  };

  const totalQuantity = products.reduce((sum, product) => sum + safeCalculate(product?.quantity), 0);

  let subTotal = 0;
  let totalGST = 0;
  let totalIGSTAmount = 0;
  let totalCGSTAmount = 0;
  let totalSGSTAmount = 0;

  products.forEach(product => {
    const qty = safeCalculate(product?.quantity);
    const rawRate = safeCalculate(product?.salePrice);
    const gstRate = safeCalculate(product?.gst);
    const cessRate = safeCalculate(product?.cess || 0);

    let rate = rawRate;
    let amount = 0;
    let gstAmount = 0;

    if (product.taxType === 'inclusive') {
      const totalTaxRate = gstRate + cessRate;
      rate = rawRate / (1 + (totalTaxRate / 100));
      amount = qty * rate;
      gstAmount = amount * (gstRate / 100);
    } else {
      amount = qty * rate;
      gstAmount = amount * (gstRate / 100);
    }

    subTotal += amount;
    totalGST += gstAmount;

    if (showIGST) totalIGSTAmount += gstAmount;
    if (showSGST) {
      totalCGSTAmount += gstAmount / 2;
      totalSGSTAmount += gstAmount / 2;
    }
  });

  const totalWithTax = subTotal + totalGST;
  const discountAmount = totalWithTax * (safeCalculate(discountPercent) / 100);
  const grandTotal = totalWithTax - discountAmount;
  const roundOffValue = Math.round(grandTotal) - grandTotal;
  const afterRoundOff = Math.round(grandTotal);
  const tdsAmount = tdsEnabled ? afterRoundOff * (safeCalculate(tdsPercent) / 100) : 0;
  const finalInvoiceAmount = afterRoundOff - tdsAmount;

  if (data?.invoiceType === 'proforma-invoice') {
    return (
      <div className="invoice-wrapper" ref={ref}>
        <div className="invoice-container text-sm text-black py-8 px-12 flex flex-col bg-white font-sans relative" style={{ minHeight: '100%' }}>

          {/* Header with Logo */}
          {(supplierData?.proformaLogo || supplierData?.logo) && (
            <div style={{
              position: 'absolute',
              top: '-90px',
              right: '-15px',
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'flex-start',
            }}>
              <img alt="Logo" style={{ width: '300px', height: 'auto', objectFit: 'contain', objectPosition: 'right top' }} src={supplierData.proformaLogo || supplierData.logo} />
            </div>
          )}

          <div className="text-center font-bold text-lg mb-6 underline" style={{ marginTop: '120px' }}>
            PROFORMA INVOICE
          </div>

          <div className="text-sm font-semibold mb-6">
            <p>Proforma No: {invoiceNumber || number}</p>
            <p>Proforma Date: {formatDate(date)}</p>
          </div>

          <div className="flex justify-between mb-8 text-sm">
            <div className="w-1/2 pr-4">
              <h3 className="font-bold mb-2">Service Provider -</h3>
              <p className="font-bold">{supplierData?.name || supplierData?.companyName}</p>
              <p>{supplierData?.address}</p>
              {supplierData?.city && <p>{supplierData.city}, {supplierData.state} - {supplierData.pincode}</p>}
              <p className="mt-2"><span className="font-bold">GSTIN:</span> {supplierData?.gstin}</p>
              <p><span className="font-bold">State:</span> {supplierData?.state} {supplierData?.stateCode && `(Code: ${supplierData.stateCode})`}</p>
            </div>
            <div className="w-1/2 pl-4 text-right">
              <h3 className="font-bold mb-2">Bill To</h3>
              <p className="font-bold">{buyerDataToUse?.name || buyerDataToUse?.companyName}</p>
              <p>{buyerDataToUse?.address}</p>
              {buyerDataToUse?.city && <p>{buyerDataToUse.city}, {buyerDataToUse.state} - {buyerDataToUse.pincode}</p>}
              <p className="mt-2"><span className="font-bold">GSTIN:</span> {buyerDataToUse?.gstin}</p>
              <p><span className="font-bold">State:</span> {buyerDataToUse?.state} {buyerDataToUse?.stateCode && `(Code: ${buyerDataToUse.stateCode})`}</p>
            </div>
          </div>

          {/* Project Description */}
          <div className="mb-6 text-sm">
            <h3 className="font-bold mb-1">Project Description</h3>
            <p>{products[0]?.name || products[0]?.description || 'Services Rendered'}</p>
          </div>

          {/* Amount Details Table */}
          <div className="mb-8">
            <h3 className="font-bold mb-2 text-sm">Amount Details</h3>
            <table className="w-full border-collapse border border-black text-sm">
              <thead>
                <tr>
                  <th className="border border-black p-2 text-left bg-gray-100">Description</th>
                  <th className="border border-black p-2 text-center bg-gray-100">Rate</th>
                  {showIGST && <>
                    <th className="border border-black p-2 text-center bg-gray-100">IGST Rate</th>
                    <th className="border border-black p-2 text-center bg-gray-100">IGST Amount</th>
                  </>}
                  {showSGST && <>
                    <th className="border border-black p-2 text-center bg-gray-100">CGST Rate</th>
                    <th className="border border-black p-2 text-center bg-gray-100">CGST Amount</th>
                    <th className="border border-black p-2 text-center bg-gray-100">SGST Rate</th>
                    <th className="border border-black p-2 text-center bg-gray-100">SGST Amount</th>
                  </>}
                  <th className="border border-black p-2 text-center bg-gray-100">Total Amount Payable</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, index) => {
                  const quantity = safeCalculate(product?.quantity);
                  const rawRate = safeCalculate(product?.salePrice);
                  const gstRate = safeCalculate(product?.gst);
                  const cessRate = safeCalculate(product?.cess || 0);

                  let rate = rawRate;
                  let amount = 0;
                  let gstAmount = 0;

                  if (product?.taxType === 'inclusive') {
                    const totalTaxRate = gstRate + cessRate;
                    rate = rawRate / (1 + (totalTaxRate / 100));
                    amount = quantity * rate;
                    gstAmount = amount * (gstRate / 100);
                  } else {
                    amount = quantity * rate;
                    gstAmount = amount * (gstRate / 100);
                  }

                  const itemTotal = amount + gstAmount;

                  return (
                    <tr key={index}>
                      <td className="border border-black p-2">
                        <div className="font-semibold">{product?.name}</div>
                        {product?.description && <div className="text-xs text-gray-600 italic mt-1">{product.description}</div>}
                      </td>
                      <td className="border border-black p-2 text-center">₹ {rate.toFixed(2)}</td>
                      {showIGST && <>
                        <td className="border border-black p-2 text-center">{gstRate.toFixed(2)}%</td>
                        <td className="border border-black p-2 text-center">₹ {gstAmount.toFixed(2)}</td>
                      </>}
                      {showSGST && <>
                        <td className="border border-black p-2 text-center">{(gstRate / 2).toFixed(2)}%</td>
                        <td className="border border-black p-2 text-center">₹ {(gstAmount / 2).toFixed(2)}</td>
                        <td className="border border-black p-2 text-center">{(gstRate / 2).toFixed(2)}%</td>
                        <td className="border border-black p-2 text-center">₹ {(gstAmount / 2).toFixed(2)}</td>
                      </>}
                      <td className="border border-black p-2 text-center font-bold">₹ {itemTotal.toFixed(2)}</td>
                    </tr>
                  );
                })}
                {/* Total Row */}
                <tr>
                  <td colSpan={2 + (showIGST ? 2 : 0) + (showSGST ? 4 : 0)} className="border border-black p-2 text-right font-bold">Grand Total</td>
                  <td className="border border-black p-2 text-center font-bold text-lg">₹ {finalInvoiceAmount.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Payment Details */}
          {bankData && bankData.bankName && (
            <div className="mb-6 text-sm">
              <h3 className="font-bold mb-2">Payment Details</h3>
              <p><span className="font-bold">Account Name:</span> {bankData.accountHolderName || supplierData?.name || supplierData?.companyName}</p>
              <p><span className="font-bold">Account No.:</span> {bankData.accountNumber}</p>
              <p><span className="font-bold">IFSC Code:</span> {bankData.ifscCode}</p>
              <p><span className="font-bold">Bank Name:</span> {bankData.bankName}</p>
              {bankData.branchName && <p><span className="font-bold">Branch:</span> {bankData.branchName}</p>}
            </div>
          )}

          {/* Notes */}
          <div className="mb-8 text-sm">
            <h3 className="font-bold mb-2">Notes</h3>
            <ul className="list-disc pl-5">
              <li>This is a <span className="font-bold">Proforma Invoice</span> issued for advance/payment reference.</li>
              <li>Final <span className="font-bold">Tax Invoice</span> will be issued after receipt of payment.</li>
            </ul>
          </div>

          {/* Signatory */}
          <div className="mt-auto text-sm">
            <p className="font-bold mb-16">For {supplierData?.name || supplierData?.companyName || 'MAYDIV INFOTECH'}</p>
            {data.includeSignature && data.signatureImage && (
              <div className="mb-2" style={{ marginTop: '-60px' }}>
                <img src={data.signatureImage} alt="Signature" style={{ maxHeight: '90px' }} />
              </div>
            )}
            <p>Authorized Signatory</p>
          </div>

          {/* Footer Line */}
          <div className="mt-8 pt-4 border-t-2 border-blue-500 text-xs flex justify-between items-center text-gray-600">
            <p>📍 {[supplierData?.address, supplierData?.city, supplierData?.state, supplierData?.pincode].filter(Boolean).join(', ')}</p>
            {supplierData?.email && <p>✉️ {supplierData.email}</p>}
            {supplierData?.phone && <p>📞 {supplierData.phone}</p>}
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="invoice-wrapper" ref={ref}>
      <div className="invoice-container text-sm text-black py-8 px-12 flex flex-col">
        {/* Top Note */}
        <div className="text-center italic pb-1 text-xs font-bold">
          <span className="inline-flex items-center" style={{ gap: '3px' }}>
            🙏 Thank-you for doing business with us
          </span>
        </div>

        <div className="border border-black flex flex-col">
          {/* MainHeader */}
          <header className="p-4 border-b border-black flex items-center" style={{ minHeight: '100px' }}>
            <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start' }}>
              {supplierData?.logo && (
                <div className="inline-block px-4">
                  <img alt="Logo" className="h-16 w-16 object-contain" src={supplierData.logo} />
                </div>
              )}
            </div>

            <div className="text-center" style={{ flex: 2 }}>
              <h1 className="text-xl font-bold tracking-wider uppercase">{supplierData?.name || supplierData?.companyName || 'MAYDIV INFOTECH'}</h1>
              <p className="text-xs font-semibold">{[supplierData?.address, supplierData?.city, supplierData?.state, supplierData?.pincode].filter(Boolean).join(', ')}</p>
              <p className="text-xs mt-1">
                {supplierData?.phone && <span className="inline-flex items-center mr-3">📞 {supplierData.phone}</span>}
                {supplierData?.email && <span className="inline-flex items-center">✉️ {supplierData.email}</span>}
              </p>
              <p className="text-xs mt-1">
                GSTIN : {supplierData?.gstin}
                {supplierData?.stateCode && <span className="border border-black px-1 ml-1 text-xxs">State Code : {supplierData.stateCode}</span>}
              </p>
            </div>

            <div style={{ flex: 1 }}></div>
          </header>

          {/* InvoiceTitle */}
          <div className="bg-invoice-blue border-b border-black py-1.5 px-4 flex justify-between items-center" style={{ minHeight: '28px' }}>
            <div className="w-1/3"></div>
            <div className="text-[15px] font-bold w-1/3 text-center uppercase" style={{ margin: 0 }}>{data.invoiceType === 'bill-of-supply' ? 'BILL OF SUPPLY' : data.invoiceType === 'proforma-invoice' ? 'PROFORMA INVOICE' : 'TAX INVOICE'}</div>
            <div className="w-1/3 text-right italic text-xxs">Original For Recipient</div>
          </div>

          {/* InvoiceDetails */}
          <div className="p-2 space-y-0.5 border-b border-black text-xs">
            <div className="flex justify-between"><span>Invoice Number</span><span className="font-bold">{invoiceNumber || number}</span></div>
            <div className="flex justify-between"><span>Invoice Date</span><span className="font-bold">{formatDate(date)}</span></div>
            <div className="flex justify-between"><span>State</span><span className="font-bold uppercase">{supplierData?.state}</span></div>
            <div className="flex justify-between"><span>Reverse Charge</span><span className="font-bold">NO</span></div>
          </div>

          {/* BilledTo */}
          <div className="p-2 border-b border-black text-xs space-y-1">
            <div className="text-center font-bold mb-2 pb-1 border-b border-black w-full text-[10px]">Details of Receiver | Billed to</div>
            <p className="text-xs"><span className="font-bold">Name:</span> {buyerDataToUse?.name || buyerDataToUse?.companyName}</p>
            <p className="text-xs"><span className="font-bold">Address:</span> {buyerDataToUse?.address}</p>
            <p className="text-xs">
              <span className="font-bold">GSTIN:</span> {buyerDataToUse?.gstin || 'Not specified'}
              {buyerDataToUse?.stateCode && <span className="border border-black px-1 ml-2 text-xxs">State Code : {buyerDataToUse.stateCode}</span>}
            </p>
            <p className="text-xs"><span className="font-bold">State:</span> {buyerDataToUse?.state}</p>
          </div>

          {/* ItemsTable */}
          <div className="border-b border-black break-inside-avoid">
            <table className="w-full text-center border-collapse">
              <thead className="bg-invoice-blue text-xxs font-bold">
                <tr>
                  <th className="border-r border-black py-1 w-8 align-middle" rowSpan="2">Sr. No.</th>
                  <th className="border-r border-black py-1 px-2 text-left align-middle" rowSpan="2">Name of Product</th>
                  <th className="border-r border-black py-1 w-12 align-middle" rowSpan="2">HSN/SAC</th>
                  <th className="border-r border-black py-1 w-8 align-middle" rowSpan="2">QTY</th>
                  <th className="border-r border-black py-1 w-8 align-middle" rowSpan="2">Unit</th>
                  <th className="border-r border-black py-1 align-middle" style={{ width: '3rem' }} rowSpan="2">Rate</th>
                  <th className="border-r border-black py-1 align-middle" style={{ width: '4rem' }} rowSpan="2">Taxable Value</th>
                  {showIGST && (
                    <th className="border-r border-b border-black py-0.5" colSpan="2" style={{ width: '6rem' }}>
                      IGST
                    </th>
                  )}
                  {showSGST && (
                    <>
                      <th className="border-r border-b border-black py-0.5" colSpan="2" style={{ width: '6rem' }}>
                        CGST
                      </th>
                      <th className="border-r border-b border-black py-0.5" colSpan="2" style={{ width: '6rem' }}>
                        SGST
                      </th>
                    </>
                  )}
                  <th className="py-1 align-middle" style={{ width: '4rem' }} rowSpan="2">Total</th>
                </tr>
                <tr>
                  {showIGST && (
                    <>
                      <th className="border-r border-black py-0.5 font-semibold text-center w-8">Rate</th>
                      <th className="border-r border-black py-0.5 font-semibold text-center w-12">Amount</th>
                    </>
                  )}
                  {showSGST && (
                    <>
                      <th className="border-r border-black py-0.5 font-semibold text-center w-8">Rate</th>
                      <th className="border-r border-black py-0.5 font-semibold text-center w-12">Amount</th>
                      <th className="border-r border-black py-0.5 font-semibold text-center w-8">Rate</th>
                      <th className="border-r border-black py-0.5 font-semibold text-center w-12">Amount</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="text-xxs">
                {products.map((product, index) => {
                  const quantity = safeCalculate(product?.quantity);
                  const rawRate = safeCalculate(product?.salePrice);
                  const gstRate = safeCalculate(product?.gst);
                  const cessRate = safeCalculate(product?.cess || 0);

                  let rate = rawRate;
                  let amount = 0;
                  let gstAmount = 0;

                  if (product?.taxType === 'inclusive') {
                    const totalTaxRate = gstRate + cessRate;
                    rate = rawRate / (1 + (totalTaxRate / 100));
                    amount = quantity * rate;
                    gstAmount = amount * (gstRate / 100);
                  } else {
                    amount = quantity * rate;
                    gstAmount = amount * (gstRate / 100);
                  }

                  const cgstAmount = gstAmount / 2;
                  const sgstAmount = gstAmount / 2;

                  return (
                    <tr key={index} className="border-t border-black">
                      <td className="border-r border-black p-2">{index + 1}</td>
                      <td className="border-r border-black px-2 py-2 text-left">
                        <span className="font-semibold block">{product?.name}</span>
                        {product?.description && <span className="italic block text-gray-600">{product.description}</span>}
                      </td>
                      <td className="border-r border-black p-2">{product?.hsn}</td>
                      <td className="border-r border-black p-2">{quantity}</td>
                      <td className="border-r border-black p-2">{product?.unit}</td>
                      <td className="border-r border-black p-2">{rate.toFixed(2)}</td>
                      <td className="border-r border-black bg-invoice-blue font-bold p-2">{amount.toFixed(2)}</td>

                      {showIGST && (
                        <>
                          <td className="border-r border-black p-2" style={{ textAlign: 'center' }}>{gstRate.toFixed(2)}%</td>
                          <td className="border-r border-black p-2" style={{ textAlign: 'center' }}>{gstAmount.toFixed(2)}</td>
                        </>
                      )}
                      {showSGST && (
                        <>
                          <td className="border-r border-black p-2">{(gstRate / 2).toFixed(2)}%</td>
                          <td className="border-r border-black p-2">{cgstAmount.toFixed(2)}</td>
                          <td className="border-r border-black p-2">{(gstRate / 2).toFixed(2)}%</td>
                          <td className="border-r border-black p-2">{sgstAmount.toFixed(2)}</td>
                        </>
                      )}
                      <td className="font-bold p-2">₹ {(amount + gstAmount).toFixed(2)}</td>
                    </tr>
                  );
                })}

                {/* Spacer row before Total */}
                <tr className="border-t border-black" style={{ height: '4.5rem' }}>
                  <td className="border-r border-black"></td>
                  <td className="border-r border-black"></td>
                  <td className="border-r border-black"></td>
                  <td className="border-r border-black"></td>
                  <td className="border-r border-black"></td>
                  <td className="border-r border-black"></td>
                  <td className="border-r border-black bg-invoice-blue"></td>
                  {showIGST && <><td className="border-r border-black"></td><td className="border-r border-black"></td></>}
                  {showSGST && <><td className="border-r border-black"></td><td className="border-r border-black"></td><td className="border-r border-black"></td><td className="border-r border-black"></td></>}
                  <td></td>
                </tr>

                {/* Total Row */}
                <tr className="border-t border-black font-bold text-xxs" style={{ height: '1px' }}>
                  <td className="border-r border-black py-1" colSpan="3">Total</td>
                  <td className="border-r border-black py-1">{totalQuantity}</td>
                  <td className="border-r border-black py-1"></td>
                  <td className="border-r border-black py-1"></td>
                  <td className="border-r border-black bg-invoice-blue py-1">₹ {subTotal.toFixed(2)}</td>
                  {showIGST && (
                    <>
                      <td className="border-r border-black py-1"></td>
                      <td className="border-r border-black py-1">₹ {totalIGSTAmount.toFixed(2)}</td>
                    </>
                  )}
                  {showSGST && (
                    <>
                      <td className="border-r border-black py-1"></td>
                      <td className="border-r border-black py-1">₹ {totalCGSTAmount.toFixed(2)}</td>
                      <td className="border-r border-black py-1"></td>
                      <td className="border-r border-black py-1">₹ {totalSGSTAmount.toFixed(2)}</td>
                    </>
                  )}
                  <td className="py-1">₹ {totalWithTax.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Bottom Section */}
          <div className="flex border-b border-black break-inside-avoid">
            {/* Left - Amount in words + Bank Details */}
            <div className="border-r border-black flex flex-col" style={{ width: '60%' }}>
              <div className="p-2 text-center border-b border-black">
                <p className="text-xs font-bold uppercase mb-1">Total Invoice Amount in words</p>
                <p className="text-xs font-bold italic">{numberToWords(finalInvoiceAmount)} Rupees Only /-</p>
              </div>
              {bankData && bankData.bankName && (
                <div className="p-2 flex-grow">
                  <p className="text-xs font-bold text-invoice-blue mb-1 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2 .712V17a1 1 0 001 1z"></path></svg>
                    Bank and Payment Details
                  </p>
                  <div className="w-3/4 text-xxs space-y-0.5 ml-2 pr-4">
                    <div className="flex justify-between"><span className="font-semibold">Account Name</span><span className="font-bold text-right">{bankData.accountHolderName || supplierData?.name || supplierData?.companyName}</span></div>
                    <div className="flex justify-between"><span className="font-semibold">Account No.</span><span className="font-bold text-right">{bankData.accountNumber}</span></div>
                    <div className="flex justify-between"><span className="font-semibold">IFSC Code</span><span className="font-bold text-right">{bankData.ifscCode}</span></div>
                    <div className="flex justify-between"><span className="font-semibold">Bank Name</span><span className="font-bold text-right">{bankData.bankName}</span></div>
                    {bankData.branchName && (
                      <div className="flex justify-between"><span className="font-semibold">Branch Name</span><span className="font-bold uppercase text-right">{bankData.branchName}</span></div>
                    )}
                  </div>
                </div>
              )}
              {!(bankData && bankData.bankName) && (
                <div className="p-2 flex-grow"></div>
              )}
            </div>
            {/* Right - Totals */}
            <div className="text-xxs font-bold flex flex-col" style={{ width: '40%' }}>
              <div className="flex border-b border-black bg-invoice-blue flex-grow">
                <div className="w-3/5 p-1 border-r border-black text-left flex items-center">Total Amount Before Tax</div>
                <div className="w-2/5 p-1 text-right flex items-center justify-end">₹ {subTotal.toFixed(2)}</div>
              </div>
              {showIGST && (
                <div className="flex border-b border-black bg-invoice-blue flex-grow">
                  <div className="w-3/5 p-1 border-r border-black text-right flex items-center justify-end">Add : IGST</div>
                  <div className="w-2/5 p-1 text-right flex items-center justify-end">₹ {totalIGSTAmount.toFixed(2)}</div>
                </div>
              )}
              {showSGST && (
                <>
                  <div className="flex border-b border-black bg-invoice-blue flex-grow">
                    <div className="w-3/5 p-1 border-r border-black text-right flex items-center justify-end">Add : CGST</div>
                    <div className="w-2/5 p-1 text-right flex items-center justify-end">₹ {totalCGSTAmount.toFixed(2)}</div>
                  </div>
                  <div className="flex border-b border-black bg-invoice-blue flex-grow">
                    <div className="w-3/5 p-1 border-r border-black text-right flex items-center justify-end">Add : SGST</div>
                    <div className="w-2/5 p-1 text-right flex items-center justify-end">₹ {totalSGSTAmount.toFixed(2)}</div>
                  </div>
                </>
              )}
              <div className="flex border-b border-black bg-invoice-blue flex-grow">
                <div className="w-3/5 p-1 border-r border-black text-left flex items-center">Total Tax Amount</div>
                <div className="w-2/5 p-1 text-right flex items-center justify-end">₹ {totalGST.toFixed(2)}</div>
              </div>
              {discountPercent > 0 && (
                <div className="flex border-b border-black flex-grow">
                  <div className="w-3/5 p-1 border-r border-black text-left flex items-center">Discount Amount ({discountPercent}%)</div>
                  <div className="w-2/5 p-1 text-right flex items-center justify-end">-₹ {discountAmount.toFixed(2)}</div>
                </div>
              )}
              <div className="flex border-b border-black bg-invoice-blue flex-grow">
                <div className="w-3/5 p-1 border-r border-black text-left flex items-center">Round Off Value</div>
                <div className="w-2/5 p-1 text-right flex items-center justify-end">₹ {roundOffValue > 0 ? '+' : ''}{roundOffValue.toFixed(2)}</div>
              </div>
              {tdsEnabled && tdsPercent > 0 && (
                <div className="flex border-b border-black flex-grow" style={{ background: '#fff3cd' }}>
                  <div className="w-3/5 p-1 border-r border-black text-left flex items-center">Less: TDS ({tdsPercent}%)</div>
                  <div className="w-2/5 p-1 text-right flex items-center justify-end">-₹ {tdsAmount.toFixed(2)}</div>
                </div>
              )}
              <div className="flex border-b border-black bg-invoice-blue flex-grow">
                <div className="w-3/5 p-1 border-r border-black text-left flex items-center">Final Invoice Amount</div>
                <div className="w-2/5 p-1 text-right flex items-center justify-end">₹ {finalInvoiceAmount.toFixed(2)}</div>
              </div>
              <div className="flex bg-invoice-blue flex-grow">
                <div className="w-3/5 p-1 border-r border-black text-left flex items-center">Balance Due</div>
                <div className="w-2/5 p-1 text-right flex items-center justify-end">₹ {finalInvoiceAmount.toFixed(2)}</div>
              </div>
            </div>
          </div>

          {/* TermsAndSignature */}
          <div className="grid grid-cols-2 min-h-[170px] break-inside-avoid">
            <div className="border-r border-black p-2">
              <h4 className="text-xxs font-bold underline mb-1">Terms And Conditions</h4>
              <p className="text-[0.6rem]">1. This is an electronically generated document. 2. All disputes are subject to {supplierData?.city || 'Local'} jurisdiction.</p>
            </div>
            <div className="p-2 flex flex-col justify-between text-center relative">
              <div>
                <p className="text-[0.6rem]">Certified that the particular given above are true and correct</p>
                <p className="text-xs font-bold mt-1">For, {supplierData?.name || supplierData?.companyName || 'MAYDIV INFOTECH'}</p>
              </div>
              {data.includeSignature && data.signatureImage && (
                <div className="flex justify-center items-center my-2">
                  <img src={data.signatureImage} alt="Signature" style={{ maxHeight: '90px' }} />
                </div>
              )}
              <div className="border-t border-black w-2/3 mx-auto mt-16 pt-1">
                <p className="text-xxs font-bold">Authorised Signatory</p>
              </div>
            </div>
          </div>
        </div>

        {/* Final Small Note */}
        <div className="text-center italic text-xs pt-1.5 font-semibold text-gray-800 pb-4">
          Thank you for your business
        </div>
      </div>
    </div>
  );
});

export default InvoiceTemplate;


