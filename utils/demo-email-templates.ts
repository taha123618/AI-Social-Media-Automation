export type EmailTemplateType = "sales-notification" | "prospect-confirmation" | "direct-email";

export function getDemoEmailTemplate(
  type: EmailTemplateType,
  data: Record<string, any>
): { subject: string; html: string } {
  const appName = "SocialAI";
  const currentYear = new Date().getFullYear();

  if (type === "direct-email") {
    return {
      subject: data.subject || "Message from SocialAI",
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${data.subject || "Message from SocialAI"}</title>
<style>
  body{margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Inter','Segoe UI',Roboto,sans-serif;background-color:#0B0F19;color:#f8fafc;line-height:1.6}
  .wrapper{padding:40px 20px;text-align:center}
  .container{max-width:600px;margin:0 auto;background-color:#141A29;border:1px solid #1E293B;border-radius:16px;overflow:hidden;text-align:left}
  .header{padding:28px 40px 16px;border-bottom:1px solid #1E293B;background:#141A29}
  .header h1{margin:0;font-size:20px;font-weight:700;color:#fff}
  .content{padding:32px 40px;font-size:15px;color:#e2e8f0}
  .content p{margin:0 0 16px}
  .footer{padding:24px 40px;text-align:center;color:#64748b;font-size:12px;border-top:1px solid #1E293B;background:#0B0F19}
  .footer a{color:#818cf8;text-decoration:none}
</style></head>
<body>
<div class="wrapper">
<div class="container">
<div class="header"><h1>${data.subject || "Message from SocialAI"}</h1></div>
<div class="content">
${data.body || ""}
</div>
<div class="footer">
<p style="margin:0 0 4px">© ${currentYear} ${appName}. All rights reserved.</p>
<p style="margin:0;font-size:11px;color:#475569">Need help? <a href="mailto:support@socialai.com">support@socialai.com</a></p>
</div>
</div></div>
</body></html>`,
    };
  }


  if (type === "sales-notification") {
    return {
      subject: `New Demo Request from ${data.firstName} ${data.lastName} — ${data.company}`,
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>New Demo Request</title>
<style>
  body{margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Inter','Segoe UI',Roboto,sans-serif;background-color:#0B0F19;color:#f8fafc;line-height:1.6}
  .wrapper{padding:40px 20px;text-align:center}
  .container{max-width:600px;margin:0 auto;background-color:#141A29;border:1px solid #1E293B;border-radius:16px;overflow:hidden;text-align:left}
  .header{padding:32px 40px 20px;border-bottom:1px solid #1E293B;background:#141A29}
  .header h1{margin:0;font-size:22px;font-weight:700;color:#fff}
  .content{padding:32px 40px}
  .field-row{display:flex;padding:10px 0;border-bottom:1px solid #1E293B}
  .field-label{width:160px;font-size:13px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:0.5px}
  .field-value{font-size:14px;color:#f1f5f9;font-weight:500}
  .badge{display:inline-block;padding:4px 12px;border-radius:100px;font-size:12px;font-weight:600;background:rgba(45,70,255,0.15);color:#818cf8;border:1px solid rgba(45,70,255,0.2)}
  .cta{display:inline-block;padding:12px 28px;background:#2D46FF;color:#fff!important;text-decoration:none;border-radius:10px;font-weight:600;font-size:14px;margin:20px 0}
  .footer{padding:24px 40px;text-align:center;color:#64748b;font-size:12px;border-top:1px solid #1E293B;background:#0B0F19}
</style></head>
<body>
<div class="wrapper">
<div class="container">
<div class="header"><h1>🚀 New Demo Request</h1></div>
<div class="content">
<p style="font-size:15px;color:#94a3b8;margin:0 0 20px"><strong style="color:#fff">${data.firstName} ${data.lastName}</strong> from <strong style="color:#fff">${data.company}</strong> requested a demo.</p>
<div class="field-row"><div class="field-label">Contact</div><div class="field-value">${data.email} — ${data.phone}</div></div>
<div class="field-row"><div class="field-label">Role</div><div class="field-value">${data.jobTitle}</div></div>
<div class="field-row"><div class="field-label">Team Size</div><div class="field-value">${data.teamSize}</div></div>
<div class="field-row"><div class="field-label">Country</div><div class="field-value">${data.country}</div></div>
<div class="field-row"><div class="field-label">Use Case</div><div class="field-value">${data.useCase}</div></div>
<div class="field-row"><div class="field-label">Preferred</div><div class="field-value">${data.preferredDate} at ${data.preferredTime}</div></div>
${data.notes ? `<div class="field-row"><div class="field-label">Notes</div><div class="field-value">${data.notes}</div></div>` : ""}
<div style="margin-top:24px;text-align:center">
<a href="${data.leadUrl || "#"}" class="cta">View Lead Details</a>
</div>
</div>
<div class="footer">© ${currentYear} ${appName}. All rights reserved.</div>
</div></div>
</body></html>`,
    };
  }

  return {
    subject: `Your Demo Request is Confirmed — ${appName}`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Demo Confirmed</title>
<style>
  body{margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Inter','Segoe UI',Roboto,sans-serif;background-color:#0B0F19;color:#f8fafc;line-height:1.6}
  .wrapper{padding:40px 20px;text-align:center}
  .container{max-width:600px;margin:0 auto;background-color:#141A29;border:1px solid #1E293B;border-radius:16px;overflow:hidden;text-align:left}
  .header{padding:32px 40px 20px;border-bottom:1px solid #1E293B;text-align:center;background:#141A29}
  .header .icon{width:64px;height:64px;margin:0 auto 16px;background:rgba(16,185,129,0.1);border-radius:16px;display:flex;align-items:center;justify-content:center;border:1px solid rgba(16,185,129,0.2)}
  .header h1{margin:0;font-size:24px;font-weight:700;color:#fff}
  .content{padding:32px 40px}
  .content p{font-size:15px;color:#94a3b8;margin:0 0 16px}
  .info-card{background:#0B0F19;border:1px solid #1E293B;border-radius:12px;padding:20px;margin:24px 0}
  .info-card p{margin:0 0 8px;font-size:13px;color:#64748b}
  .info-card p strong{color:#f1f5f9;font-weight:600}
  .btn{display:inline-block;padding:14px 32px;background:#2D46FF;color:#fff!important;text-decoration:none;border-radius:10px;font-weight:600;font-size:15px;margin:8px 0;box-shadow:0 4px 12px rgba(45,70,255,0.25)}
  .footer{padding:24px 40px;text-align:center;color:#64748b;font-size:12px;border-top:1px solid #1E293B;background:#0B0F19}
</style></head>
<body>
<div class="wrapper">
<div class="container">
<div class="header">
<div class="icon"><span style="font-size:28px">✅</span></div>
<h1>Demo Request Received!</h1>
</div>
<div class="content">
<p>Hi <strong style="color:#fff">${data.firstName}</strong>,</p>
<p>Thanks for your interest in ${appName}! We've received your demo request and our team is reviewing it.</p>
<div class="info-card">
<p><strong>What happens next?</strong></p>
<p>1. A product specialist will review your requirements within <strong>24 hours</strong>.</p>
<p>2. We'll reach out to <strong>${data.email}</strong> to confirm a time that works for you.</p>
<p>3. Your ${data.meetingDuration || 30}-minute personalized demo will cover features most relevant to your use case.</p>
</div>
<p>In the meantime, explore these resources:</p>
<p style="text-align:center;margin-top:20px">
<a href="${data.pricingUrl || "/pricing"}" class="btn" style="margin-right:8px">View Pricing</a>
<a href="${data.blogUrl || "/blog"}" class="btn" style="background:transparent;border:1px solid #1E293B;box-shadow:none">Read Our Blog</a>
</p>
</div>
<div class="footer">
<p style="margin:0 0 4px">© ${currentYear} ${appName}. All rights reserved.</p>
<p style="margin:0;font-size:11px;color:#475569">Questions? Email us at <a href="mailto:sales@socialai.com" style="color:#818cf8;text-decoration:none">sales@socialai.com</a></p>
</div>
</div></div>
</body></html>`,
  };
}
