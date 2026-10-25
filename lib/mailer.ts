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
    <p>You're confirmed for <strong>${book.title}</strong> on <strong>${formatDate(book.event_date)}${book.event_time ? ` at ${book.event_time}` : ''}</strong>.</p>
    ${book.description ? `<p>${book.description}</p>` : ''}
    ${book.venue
      ? `<p><strong>Location:</strong> ${book.venue}${book.venue_url ? ` — <a href="${book.venue_url}">open in Google Maps</a>` : ''}</p>`
      : `<p>The exact meetup spot will be announced in the book club's WhatsApp group closer to the date.</p>`}
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

export async function sendFrankensteinAnnouncementEmail(
  registration: any,
  lecture: any,
  details: { date: string; time: string; venue: string; address: string; room: string; mapUrl: string }
) {
  const html = `
    <div style="background-color: #ffffff; padding: 24px;">
      <div style="font-family: Georgia, 'Times New Roman', serif; color: #111111; line-height: 1.6;">
        <p>Hi ${registration.name},</p>
        <p>Here are the details for our Halloween lecture on Frankenstein — see you there!</p>
        <p style="margin: 24px 0; padding: 16px 20px; border-left: 3px solid #e8b923; background-color: #faf7f0; color: #111111;">
          <strong>${lecture.title}</strong><br>
          <br>
          <strong>Date:</strong> ${details.date}<br>
          <strong>Time:</strong> ${details.time}<br>
          <strong>Location:</strong> ${details.venue} — ${details.address}<br>
          <span style="display: inline-block; margin: 8px 0; padding: 4px 10px; background-color: #e8b923; color: #111111; font-weight: bold;">Room: ${details.room}</span><br>
          <a href="${details.mapUrl}" style="color: #7b1c1a;">Open in Google Maps</a>
        </p>
        <p>Once you're inside the building, head to <strong>room ${details.room}</strong>.</p>
        <p>Any questions — message me on WhatsApp: +49 160 2425759.</p>
        <p>Can't wait to see you there!</p>
        <p>— notfrommunich bookclub</p>
      </div>
    </div>
  `;

  await mailer.sendMail({
    from: `"notfrommunich bookclub" <${process.env.GMAIL_USER}>`,
    to: registration.email,
    subject: 'Lecture details — Frankenstein 🎃',
    html,
  });
}
