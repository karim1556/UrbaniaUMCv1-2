const getEventRegistrationReceiptHtml = (registrationDetails) => {
  const {
    user,
    event,
    registration,
  } = registrationDetails;

  const isFree = !registration.totalAmount || registration.totalAmount === 0;
  const paymentMethod = isFree ? 'N/A (Free Event)' : (registration.paymentInfo?.method || 'N/A');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Event Registration Confirmation</title>
      <link href="https://fonts.googleapis.com/css?family=Inter:400,600&display=swap" rel="stylesheet">
      <style>
        body { font-family: 'Inter', Arial, sans-serif; background: #f6f8fa; color: #222; margin: 0; }
        .container { max-width: 600px; margin: 32px auto; background: #fff; border-radius: 14px; box-shadow: 0 2px 16px #0001; overflow: hidden; }
        .header { background: linear-gradient(90deg, #056676 60%, #1ebea5 100%); color: #fff; padding: 32px 24px 20px 24px; text-align: center; }
        .header h1 { margin: 0 0 8px 0; font-size: 2rem; font-weight: 600; letter-spacing: 1px; }
        .header p { margin: 0; font-size: 1.1rem; font-weight: 400; }
        .content { padding: 32px 24px 24px 24px; }
        .section { background: #f8fafc; border-radius: 10px; margin-bottom: 24px; box-shadow: 0 1px 4px #0001; padding: 20px 18px; }
        .section-title { color: #056676; font-size: 1.1rem; font-weight: 600; margin-bottom: 10px; letter-spacing: 0.5px; }
        .info-table { width: 100%; border-collapse: collapse; margin-bottom: 0; }
        .info-table th, .info-table td { text-align: left; padding: 7px 0; font-size: 1rem; }
        .info-table th { color: #888; font-weight: 500; width: 38%; }
        .info-table td { color: #222; font-weight: 500; }
        .badge { display: inline-block; padding: 3px 14px; border-radius: 12px; font-size: 0.95rem; font-weight: 600; background: #e6f4ea; color: #19875C; margin-right: 8px; }
        .amount { color: #1ebea5; font-size: 1.2rem; font-weight: 700; }
        .footer { background: #f6f8fa; text-align: center; font-size: 0.97rem; color: #888; padding: 18px 0 8px 0; border-top: 1px solid #e5e7eb; }
        .contact { margin-top: 18px; color: #056676; font-size: 1rem; }
        @media (max-width: 600px) {
          .container, .content, .header { padding: 12px !important; }
          .section { padding: 12px 8px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1> Registration Confirmed!</h1>
          <p>Thank you, <b>${user.name || user.username}</b>, for registering for <b>${event.title}</b>.</p>
        </div>
        <div class="content">
          <div class="section">
            <div class="section-title">Event Details</div>
            <table class="info-table">
              <tr><th>Event</th><td>${event.title}</td></tr>
              <tr><th>Date</th><td>${new Date(event.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</td></tr>
              <tr><th>Time</th><td>${typeof event.time === 'object' ? `${event.time.startTime} - ${event.time.endTime}` : event.time}</td></tr>
              <tr><th>Location</th><td>${event.location}</td></tr>
            </table>
          </div>
          <div class="section">
            <div class="section-title">Your Registration</div>
            <table class="info-table">
              <tr><th>Registration ID</th><td>${registration._id}</td></tr>
              <tr><th>Registered On</th><td>${new Date(registration.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</td></tr>
              <tr><th>Status</th><td><span class="badge">Confirmed</span></td></tr>
              <tr><th>Total Amount Paid</th><td class="amount">₹${registration.totalAmount?.toFixed(2) || '0.00'}</td></tr>
              <tr><th>Payment Method</th><td>${paymentMethod}</td></tr>
            </table>
          </div>
          <div class="section">
            <div class="section-title">Participant</div>
            <table class="info-table">
              <tr><th>Name</th><td>${registration.firstName} ${registration.lastName}</td></tr>
              <tr><th>Email</th><td>${registration.email}</td></tr>
              <tr><th>Phone</th><td>${registration.phone}</td></tr>
            </table>
          </div>
          <div class="contact">
            If you have any questions, reply to this email or contact us at <a href="mailto:info@urbania.org" style="color:#1ebea5;text-decoration:none;">info@urbania.org</a>.
          </div>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Urbania Connect Community. All rights reserved.<br/>
          <span style="color:#056676;">www.urbania.org</span>
        </div>
      </div>
    </body>
    </html>
  `;
};

const getDonationReceiptHtml = (donationDetails) => {
  const {
    donorName,
    email,
    phone,
    amount,
    currency = 'INR',
    date,
    paymentMethod,
    donationType,
    program,
    receiptId,
    message,
    address,
    city,
    state,
    zipCode
  } = donationDetails;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Donation Receipt</title>
      <link href="https://fonts.googleapis.com/css?family=Inter:400,600&display=swap" rel="stylesheet">
      <style>
        body { font-family: 'Inter', Arial, sans-serif; background: #f6f8fa; color: #222; margin: 0; }
        .container { max-width: 600px; margin: 32px auto; background: #fff; border-radius: 14px; box-shadow: 0 2px 16px #0001; overflow: hidden; }
        .header { background: linear-gradient(90deg, #056676 60%, #1ebea5 100%); color: #fff; padding: 32px 24px 20px 24px; text-align: center; }
        .header h1 { margin: 0 0 8px 0; font-size: 2rem; font-weight: 600; letter-spacing: 1px; }
        .header p { margin: 0; font-size: 1.1rem; font-weight: 400; }
        .content { padding: 32px 24px 24px 24px; }
        .section { background: #f8fafc; border-radius: 10px; margin-bottom: 24px; box-shadow: 0 1px 4px #0001; padding: 20px 18px; }
        .section-title { color: #056676; font-size: 1.1rem; font-weight: 600; margin-bottom: 10px; letter-spacing: 0.5px; }
        .info-table { width: 100%; border-collapse: collapse; margin-bottom: 0; }
        .info-table th, .info-table td { text-align: left; padding: 7px 0; font-size: 1rem; }
        .info-table th { color: #888; font-weight: 500; width: 38%; }
        .info-table td { color: #222; font-weight: 500; }
        .badge { display: inline-block; padding: 3px 14px; border-radius: 12px; font-size: 0.95rem; font-weight: 600; background: #e6f4ea; color: #19875C; margin-right: 8px; }
        .amount { color: #1ebea5; font-size: 1.2rem; font-weight: 700; }
        .footer { background: #f6f8fa; text-align: center; font-size: 0.97rem; color: #888; padding: 18px 0 8px 0; border-top: 1px solid #e5e7eb; }
        .contact { margin-top: 18px; color: #056676; font-size: 1rem; }
        @media (max-width: 600px) {
          .container, .content, .header { padding: 12px !important; }
          .section { padding: 12px 8px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Donation Receipt</h1>
          <p>Thank you, <b>${donorName}</b>, for your generous donation!</p>
        </div>
        <div class="content">
          <div class="section">
            <div class="section-title">Donation Details</div>
            <table class="info-table">
              <tr><th>Receipt ID</th><td>${receiptId || '-'}</td></tr>
              <tr><th>Date</th><td>${date ? new Date(date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}</td></tr>
              <tr><th>Amount</th><td class="amount">${currency} ${amount?.toFixed(2) || '0.00'}</td></tr>
              <tr><th>Payment Method</th><td>${paymentMethod || '-'}</td></tr>
              <tr><th>Donation Type</th><td>${donationType || '-'}</td></tr>
              <tr><th>Program</th><td>${program || '-'}</td></tr>
            </table>
          </div>
          <div class="section">
            <div class="section-title">Donor Information</div>
            <table class="info-table">
              <tr><th>Name</th><td>${donorName}</td></tr>
              <tr><th>Email</th><td>${email}</td></tr>
              <tr><th>Phone</th><td>${phone || '-'}</td></tr>
              <tr><th>Address</th><td>${address || '-'}${city ? ', ' + city : ''}${state ? ', ' + state : ''}${zipCode ? ', ' + zipCode : ''}</td></tr>
              ${message ? `<tr><th>Message</th><td>${message}</td></tr>` : ''}
            </table>
          </div>
          <div class="contact">
            If you have any questions or need an official receipt, reply to this email or contact us at <a href="mailto:info@urbania.org" style="color:#1ebea5;text-decoration:none;">info@urbania.org</a>.<br/>
            <span style="font-size:0.97rem; color:#888;">This receipt can be used for your records and tax purposes.</span>
          </div>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Urbania Connect Community. All rights reserved.<br/>
          <span style="color:#056676;">www.urbania.org</span>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = {
  getEventRegistrationReceiptHtml,
  getDonationReceiptHtml,
}; 