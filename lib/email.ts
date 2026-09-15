import { Resend } from "resend";

const getResend = () => {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
};

type OrderEmailItem = {
  title: string;
  quantity: number;
  unitPrice: number;
};

export const sendOrderConfirmationEmail = async ({
  to,
  orderId,
  total,
  items,
}: {
  to: string;
  orderId: string;
  total: number;
  items: OrderEmailItem[];
}) => {
  const resend = getResend();
  if (!resend) {
    console.info("Resend not configured; skipping order confirmation email.");
    return;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const rows = items
    .map(
      (item) =>
        `<tr><td style="padding:8px 0">${item.title} × ${item.quantity}</td><td style="text-align:right">$${(item.unitPrice * item.quantity).toFixed(2)}</td></tr>`,
    )
    .join("");

  try {
    await resend.emails.send({
      from: "Flipzone <orders@flipzone.dev>",
      to,
      subject: `Order confirmed — #${orderId.slice(-8)}`,
      html: `
        <h1>Thanks for your order</h1>
        <p>We've received your payment. Track it any time in your <a href="${appUrl}/orders">order history</a>.</p>
        <table style="width:100%;max-width:480px">${rows}
          <tr><td style="padding-top:12px;font-weight:bold">Total</td><td style="padding-top:12px;text-align:right;font-weight:bold">$${total.toFixed(2)}</td></tr>
        </table>
      `,
    });
  } catch (error) {
    console.error("Failed to send order confirmation email:", error);
  }
};
