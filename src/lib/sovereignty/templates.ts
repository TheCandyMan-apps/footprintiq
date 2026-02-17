import { Jurisdiction, RequestType } from '@/hooks/useSovereignty';

interface TemplateContext {
  targetEntity: string;
  targetUrl?: string;
  jurisdiction: Jurisdiction;
  requestType: RequestType;
  userName?: string;
  userEmail?: string;
  date: string;
}

const JURISDICTION_LEGAL: Record<Jurisdiction, { law: string; article: string; deadlineDays: number; authority: string }> = {
  gdpr: {
    law: 'General Data Protection Regulation (EU) 2016/679',
    article: 'Article 17 (Right to Erasure)',
    deadlineDays: 30,
    authority: 'the relevant EU Data Protection Authority',
  },
  ccpa: {
    law: 'California Consumer Privacy Act (CCPA), Cal. Civ. Code § 1798.105',
    article: 'Section 1798.105 (Right to Deletion)',
    deadlineDays: 45,
    authority: 'the California Attorney General',
  },
  uk_sds: {
    law: 'UK Data Protection Act 2018 & UK GDPR',
    article: 'Article 17 (Right to Erasure)',
    deadlineDays: 30,
    authority: 'the Information Commissioner\'s Office (ICO)',
  },
};

const REQUEST_TYPE_LABELS: Record<RequestType, string> = {
  erasure: 'erasure of all personal data',
  access: 'access to all personal data held',
  rectification: 'rectification of inaccurate personal data',
};

export function generateErasureTemplate(ctx: TemplateContext): string {
  const legal = JURISDICTION_LEGAL[ctx.jurisdiction];
  const actionPhrase = REQUEST_TYPE_LABELS[ctx.requestType];
  const userName = ctx.userName || '[YOUR FULL NAME]';
  const userEmail = ctx.userEmail || '[YOUR EMAIL ADDRESS]';

  return `Subject: Formal Request for ${ctx.requestType === 'erasure' ? 'Data Erasure' : ctx.requestType === 'access' ? 'Data Access' : 'Data Rectification'} — ${legal.law}

Date: ${ctx.date}

To: Data Protection Officer / Privacy Team
${ctx.targetEntity}
${ctx.targetUrl ? `Reference URL: ${ctx.targetUrl}` : ''}

Dear Sir/Madam,

I am writing to exercise my right to request the ${actionPhrase} you hold about me, as provided under ${legal.law}, ${legal.article}.

I request that you:

${ctx.requestType === 'erasure' ? `1. Delete all personal data you hold about me, including but not limited to my name, email address, phone number, physical address, photographs, and any derived or aggregated data profiles.
2. Confirm in writing that all personal data has been erased.
3. Ensure any third parties to whom you have disclosed my data are also informed of this erasure request.` : ''}${ctx.requestType === 'access' ? `1. Provide me with a copy of all personal data you hold about me in a commonly used, machine-readable format.
2. Inform me of the purposes of processing, the categories of data held, and any third parties to whom data has been disclosed.
3. Provide details of the retention period for my data.` : ''}${ctx.requestType === 'rectification' ? `1. Correct any inaccurate personal data you hold about me.
2. Complete any incomplete personal data.
3. Confirm in writing that the rectification has been made.` : ''}

Under ${legal.article}, you are required to respond to this request within ${legal.deadlineDays} calendar days of receipt. Failure to comply may result in a formal complaint to ${legal.authority}.

For verification purposes, my details are as follows:

Full Name: ${userName}
Email Address: ${userEmail}

I look forward to your prompt response.

Yours faithfully,
${userName}`;
}

export function generateTemplateSubject(ctx: TemplateContext): string {
  const legal = JURISDICTION_LEGAL[ctx.jurisdiction];
  return `${ctx.requestType === 'erasure' ? 'Data Erasure' : ctx.requestType === 'access' ? 'Data Access' : 'Data Rectification'} Request — ${legal.law}`;
}
