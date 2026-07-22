import nodemailer from 'nodemailer';

const mailer = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
}

export async function sendConfirmationEmail(registration: any, book: any) {
  const whatsappUrl = process.env.WHATSAPP_GROUP_URL;

  const html = `
    <p>Hi ${registration.name},</p>
    <p>You're confirmed for <strong>${book.title}</strong> on <strong>${formatDate(book.event_date)}</strong>.</p>
    ${book.description ? `<p>${book.description}</p>` : ''}
    <p>The exact meetup spot will be announced in the book club's WhatsApp group closer to the date.</p>
    ${whatsappUrl ? `<p><a href="${whatsappUrl}">Join the WhatsApp group</a></p>` : ''}
    <p>Any questions — just ask the admins in the group.</p>
    <p>See you soon!<br>notfrommunich bookclub</p>
  `;

  await mailer.sendMail({
    from: `"notfrommunich bookclub" <${process.env.GMAIL_USER}>`,
    to: registration.email,
    subject: `You're in — ${book.title}`,
    html,
  });
}

export async function sendAnnouncementEmail(
  registration: any,
  book: any,
  details: { date: string; time: string; venue: string; address: string; mapUrl: string }
) {
  const html = `
    <div style="font-family: Georgia, 'Times New Roman', serif; color: #111; line-height: 1.6;">
      <p>Hi ${registration.name},</p>
      <p>Everything's set for our next meetup — here's where to find us:</p>
      <p style="margin: 24px 0; padding: 16px 20px; border-left: 3px solid #e8b923; background: #faf7f0;">
        <strong>${book.title}</strong><br>
        ${book.description ? `${book.description}<br>` : ''}
        <br>
        <strong>Date:</strong> ${details.date}<br>
        <strong>Time:</strong> ${details.time}<br>
        <strong>Location:</strong> ${details.venue} — ${details.address}<br>
        <a href="${details.mapUrl}">Open in Google Maps</a>
      </p>
      <p>Bring your thoughts on the book — and your appetite. Can't wait to see you there!</p>
      <p>— notfrommunich bookclub</p>
    </div>
  `;

  await mailer.sendMail({
    from: `"notfrommunich bookclub" <${process.env.GMAIL_USER}>`,
    to: registration.email,
    subject: `Meetup details — ${book.title}`,
    html,
  });
}
