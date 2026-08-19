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

export async function sendGardenAnnouncementEmail(
  registration: any,
  book: any,
  details: { date: string; time: string; mapUrl: string }
) {
  const html = `
    <div style="background-color: #ffffff; padding: 24px;">
      <div style="font-family: Georgia, 'Times New Roman', serif; color: #111111; line-height: 1.6;">
        <p>Hi ${registration.name},</p>
        <p>I'd love for us to spend one of the last days of summer together — in a garden. The forecast is looking good for ${details.date}, so I'm proposing we meet outside this time.</p>
        <p style="margin: 24px 0; padding: 16px 20px; border-left: 3px solid #e8b923; background-color: #faf7f0; color: #111111;">
          <strong>${book.title}</strong><br>
          <br>
          <strong>Date:</strong> ${details.date}<br>
          <strong>Time:</strong> ${details.time}<br>
          <strong>Location:</strong> the park just to the right of the Kriegerdenkmal im Hofgarten — a quiet, secluded spot under the trees, with plenty of space for all of us<br>
          <a href="${details.mapUrl}" style="color: #7b1c1a;">Open in Google Maps</a>
        </p>
        <p>I'll bring snacks for everyone. If it's not too much trouble, please bring a blanket to sit on — I only have one!</p>
        <p>Any questions — message me on WhatsApp: +49 160 2425759.</p>
        <p>I'll be waiting for you there. Can't wait to see you all!</p>
        <p>— notfrommunich bookclub</p>
      </div>
    </div>
  `;

  await mailer.sendMail({
    from: `"notfrommunich bookclub" <${process.env.GMAIL_USER}>`,
    to: registration.email,
    subject: `Let's meet in the garden — ${book.title}`,
    html,
  });
}
