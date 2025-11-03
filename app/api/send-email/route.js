import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    // Validate input
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Send two emails: one to admin and one confirmation to user
    const [adminEmail, userEmail] = await Promise.all([
      // 1. Email to admins with form submission
      resend.emails.send({
        from: 'MOAI Contact Form <onboarding@resend.dev>',
        to: ['gstylianopoulos@gmail.com', 'factanonverba2002@gmail.com'],
        replyTo: email, // This allows admins to reply directly to the sender
        subject: `[MOAI Contact] ${subject}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>From:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <hr />
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, '<br />')}</p>
        `,
      }),

      // 2. Confirmation email to user
      resend.emails.send({
        from: 'MOAI <onboarding@resend.dev>',
        to: [email],
        subject: 'Thanks for reaching out to MOAI! 🎨',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Hi ${name}! 👋</h2>

            <p style="font-size: 16px; line-height: 1.6; color: #374151;">
              Thank you so much for getting in touch with us! We've received your message and we're excited to hear from you.
            </p>

            <div style="background-color: #f3f4f6; border-left: 4px solid #2563eb; padding: 16px; margin: 24px 0;">
              <p style="margin: 0; font-weight: bold; color: #1f2937;">Your message:</p>
              <p style="margin: 8px 0 0 0; color: #4b5563;">"${message.replace(/\n/g, '<br />')}"</p>
            </div>

            <p style="font-size: 16px; line-height: 1.6; color: #374151;">
              We'll review your message carefully and get back to you as soon as possible. Our team typically responds within 24-48 hours.
            </p>

            <p style="font-size: 16px; line-height: 1.6; color: #374151;">
              In the meantime, feel free to explore our platform:
            </p>

            <ul style="line-height: 1.8; color: #374151;">
              <li><a href="https://moaiart.net/projects" style="color: #2563eb; text-decoration: none;">Browse amazing projects</a> from our creative community</li>
              <li><a href="https://moaiart.net/toolkits" style="color: #2563eb; text-decoration: none;">Discover toolkits</a> to enhance your workflow</li>
              <li><a href="https://moaiart.net/news" style="color: #2563eb; text-decoration: none;">Read the latest news</a> from the art world</li>
            </ul>

            <p style="font-size: 16px; line-height: 1.6; color: #374151;">
              Thanks again for connecting with MOAI. We look forward to speaking with you soon!
            </p>

            <p style="font-size: 16px; line-height: 1.6; color: #374151;">
              Best regards,<br/>
              <strong>The MOAI Team</strong> 🎨✨
            </p>

            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />

            <p style="font-size: 12px; color: #9ca3af; text-align: center;">
              This is an automated confirmation email. Please do not reply to this email.<br/>
              If you need immediate assistance, please visit <a href="https://moaiart.net/contact" style="color: #2563eb;">our contact page</a>.
            </p>
          </div>
        `,
      }),
    ]);

    return NextResponse.json(
      {
        message: 'Email sent successfully',
        adminEmailId: adminEmail.id,
        userEmailId: userEmail.id
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email. Please try again later.' },
      { status: 500 }
    );
  }
}
