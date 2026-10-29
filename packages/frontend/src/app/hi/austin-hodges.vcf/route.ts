import { BUSINESS_PHONE, CONTACT_EMAIL } from '@/lib/business';

/**
 * Austin's contact card, for the "Save my contact" button on /hi (the page
 * his business card's QR code opens). Phones open a .vcf straight into
 * "Add to contacts". The phone line appears once BUSINESS_PHONE is set.
 */
export const dynamic = 'force-static';

export function GET() {
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    'N:Hodges;Austin;;;',
    'FN:Austin Hodges',
    'ORG:Soft Systems Studio',
    'TITLE:Founder',
    `EMAIL;TYPE=INTERNET,WORK:${CONTACT_EMAIL}`,
    ...(BUSINESS_PHONE ? [`TEL;TYPE=WORK,VOICE:${BUSINESS_PHONE}`] : []),
    'URL:https://softsystemsstudiollc.com',
    'NOTE:Websites for local businesses.',
    'END:VCARD',
  ];
  // vCard lines end in CRLF (RFC 2426).
  return new Response(lines.join('\r\n') + '\r\n', {
    headers: {
      'Content-Type': 'text/vcard; charset=utf-8',
      'Content-Disposition': 'attachment; filename="austin-hodges.vcf"',
    },
  });
}
