import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export function isEmailConfigured(): boolean {
  return !!(process.env.RESEND_API_KEY && process.env.RESEND_FROM_DOMAIN);
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const from = `noreply@${process.env.RESEND_FROM_DOMAIN}`;

  const textBody = [
    "Recibimos una solicitud para restablecer la contraseña de tu cuenta en Recomendados.",
    "",
    "Para elegir una contraseña nueva, abre este enlace en el navegador:",
    resetUrl,
    "",
    "El enlace caduca en 1 hora. Si no solicitaste restablecer la contraseña, ignora este mensaje.",
  ].join("\n");

  const htmlBody = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin:0;padding:24px;font-family:system-ui,-apple-system,sans-serif;line-height:1.5;color:#171717;background:#fafafa;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:480px;margin:0 auto;background:#fff;border-radius:8px;padding:24px 28px;box-shadow:0 1px 3px rgba(0,0,0,.08);">
    <tr><td>
      <p style="margin:0 0 16px;">Recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong>Recomendados</strong>.</p>
      <p style="margin:0 0 20px;">
        <a href="${resetUrl}" style="display:inline-block;background:#171717;color:#fff;text-decoration:none;padding:10px 18px;border-radius:6px;font-weight:600;">Restablecer contraseña</a>
      </p>
      <p style="margin:0;font-size:14px;color:#737373;">El enlace caduca en 1 hora. Si no solicitaste restablecer la contraseña, ignora este correo.</p>
    </td></tr>
  </table>
</body>
</html>`;

  await resend.emails.send({
    from,
    to,
    subject: "Restablece tu contraseña — Recomendados",
    text: textBody,
    html: htmlBody,
  });
}
