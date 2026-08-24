"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Mail, Send, Users } from "lucide-react";
import { toast } from "sonner";

const EMAIL_TEMPLATES = [
  { id: "blank", label: "Blank Email", subject: "", body: "" },
  {
    id: "follow-up",
    label: "Follow Up",
    subject: "Following up on your demo request — SocialAI",
    body: `<p>Hi {{firstName}},</p>
<p>I hope this message finds you well! I wanted to follow up on your recent demo request for SocialAI.</p>
<p>Our team is excited to show you how SocialAI can help your team create, schedule, and analyze content at scale with AI-powered automation.</p>
<p>Would you be available for a quick 15-minute call this week to discuss your specific needs?</p>
<p>Looking forward to connecting!</p>
<p>Best regards,<br><strong>{{adminName}}</strong><br>SocialAI Team</p>`,
  },
  {
    id: "qualification",
    label: "Qualification Questions",
    subject: "Quick questions about your SocialAI demo",
    body: `<p>Hi {{firstName}},</p>
<p>Thank you for your interest in SocialAI! Before we schedule your demo, I'd love to learn a bit more about your needs:</p>
<ol>
<li>What social media platforms are you currently using?</li>
<li>How many team members would be using the platform?</li>
<li>What's the biggest challenge you're facing with your current social media workflow?</li>
<li>Are there any specific features you're most interested in seeing?</li>
</ol>
<p>Your answers will help us tailor the demo to your specific needs.</p>
<p>Best regards,<br><strong>{{adminName}}</strong><br>SocialAI Team</p>`,
  },
  {
    id: "meeting-confirmation",
    label: "Meeting Confirmation",
    subject: "Your SocialAI demo is confirmed",
    body: `<p>Hi {{firstName}},</p>
<p>Great news — your SocialAI demo has been scheduled!</p>
<p><strong>Details:</strong></p>
<ul>
<li><strong>Date:</strong> {{preferredDate}}</li>
<li><strong>Time:</strong> {{preferredTime}}</li>
<li><strong>Duration:</strong> 30 minutes</li>
<li><strong>Platform:</strong> Zoom (link will be sent prior to the meeting)</li>
</ul>
<p>During this session, we'll walk through how SocialAI can help {{company}} streamline social media management, generate AI-powered content, and track performance analytics.</p>
<p>If you need to reschedule, please reply to this email.</p>
<p>See you soon!<br><strong>{{adminName}}</strong><br>SocialAI Team</p>`,
  },
  {
    id: "nurture",
    label: "Nurture / Keep Warm",
    subject: "SocialAI — resources to explore while you decide",
    body: `<p>Hi {{firstName}},</p>
<p>I know you're evaluating SocialAI for {{company}}, and I wanted to share some resources that might help with your decision:</p>
<ul>
<li><strong>Case Studies:</strong> See how similar companies achieved 3x content output with SocialAI.</li>
<li><strong>Product Tour:</strong> Take a self-guided interactive tour of the platform.</li>
<li><strong>ROI Calculator:</strong> Estimate the time and cost savings for your team.</li>
</ul>
<p>Feel free to reply if you have any questions — I'm happy to help!</p>
<p>Best regards,<br><strong>{{adminName}}</strong><br>SocialAI Team</p>`,
  },
];

interface LeadRecipient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
  preferredDate?: string;
  preferredTime?: string;
}

interface EmailComposerProps {
  mode: "single" | "bulk";
  recipients: LeadRecipient[];
  adminName?: string;
  children: React.ReactNode;
  onSuccess?: () => void;
}

function fillTemplate(template: string, recipient: LeadRecipient, adminName: string): string {
  return template
    .replace(/\{\{firstName\}\}/g, recipient.firstName)
    .replace(/\{\{lastName\}\}/g, recipient.lastName)
    .replace(/\{\{company\}\}/g, recipient.company || "")
    .replace(/\{\{email\}\}/g, recipient.email)
    .replace(/\{\{preferredDate\}\}/g, recipient.preferredDate || "")
    .replace(/\{\{preferredTime\}\}/g, recipient.preferredTime || "")
    .replace(/\{\{adminName\}\}/g, adminName);
}

export function EmailComposer({ mode, recipients, adminName = "The Team", children, onSuccess }: EmailComposerProps) {
  const [open, setOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("blank");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  function handleTemplateChange(templateId: string) {
    setSelectedTemplate(templateId);
    if (templateId === "blank") {
      setSubject("");
      setBody("");
      return;
    }
    const tmpl = EMAIL_TEMPLATES.find((t) => t.id === templateId);
    if (!tmpl) return;
    const recipient = recipients[0];
    const filledSubject = recipient ? fillTemplate(tmpl.subject, recipient, adminName) : tmpl.subject;
    const filledBody = recipient ? fillTemplate(tmpl.body, recipient, adminName) : tmpl.body;
    setSubject(filledSubject);
    setBody(filledBody);
  }

  async function handleSend() {
    if (!subject.trim() || !body.trim()) {
      toast.error("Subject and body are required");
      return;
    }
    setIsSending(true);
    try {
      if (mode === "single") {
        const res = await fetch(`/api/talk-to-sales/leads/${recipients[0].id}/send-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subject, body }),
        });
        const json = await res.json();
        if (!json.success) {
          toast.error(json.error || "Failed to send email");
          return;
        }
        toast.success(`Email sent to ${recipients[0].firstName} ${recipients[0].lastName}`);
      } else {
        const res = await fetch("/api/talk-to-sales/leads/bulk-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            leadIds: recipients.map((r) => r.id),
            subject,
            body,
          }),
        });
        const json = await res.json();
        if (!json.success) {
          toast.error(json.error || "Failed to send emails");
          return;
        }
        toast.success(`Emails queued for ${json.data.emailsQueued} lead(s)`);
      }
      setOpen(false);
      onSuccess?.();
    } catch {
      toast.error("Failed to send email. Please try again.");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === "single" ? (
              <Mail className="h-5 w-5 text-primary" />
            ) : (
              <Users className="h-5 w-5 text-primary" />
            )}
            {mode === "single" ? "Send Email" : `Bulk Email (${recipients.length} leads)`}
          </DialogTitle>
          <DialogDescription>
            {mode === "single"
              ? `To: ${recipients[0]?.firstName} ${recipients[0]?.lastName} <${recipients[0]?.email}>`
              : `Sending to ${recipients.length} lead(s) — ${recipients.map((r) => r.email).join(", ")}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {mode === "single" && (
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Template</label>
              <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a template..." />
                </SelectTrigger>
                <SelectContent>
                  {EMAIL_TEMPLATES?.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Subject</label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter email subject..."
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Body (HTML supported)</label>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your email body in HTML format..."
              className="min-h-[250px] font-mono text-sm"
            />
          </div>

          {body && (
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Preview</label>
              <div
                className="rounded-lg border border-border bg-card p-4 text-sm prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: body }}
              />
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isSending}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={isSending || !subject.trim() || !body.trim()}>
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                {mode === "single" ? "Send Email" : `Send to ${recipients.length} Lead(s)`}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
