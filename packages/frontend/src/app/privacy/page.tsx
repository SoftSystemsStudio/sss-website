import type { Metadata } from 'next';
import { Navbar, Footer } from '@/components/ui';
import {
  CONTACT_EMAIL,
  HOME_BASE,
  LEGAL_ENTITY,
  LEGAL_NAME,
  MAILING_ADDRESS,
} from '@/lib/business';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'What happens to your information when you use this site, ask for a quote or become a client, your privacy rights, and what our private dashboard’s read-only Google Calendar and Gmail access is for.',
  alternates: { canonical: '/privacy' },
};

const H2 = 'pt-6 font-serif text-[32px] leading-tight text-ink';
const LINK = 'text-ink underline underline-offset-4 hover:text-ink-soft';
const CODE = 'break-all rounded bg-limestone px-1.5 py-0.5 text-[15px] text-ink';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Navbar />
      <main id="main-content" className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-24">
        <h1 className="mb-10 font-serif text-[48px] leading-none tracking-[-0.015em] sm:text-[64px]">
          Privacy Policy
        </h1>
        <div className="space-y-6 text-[17px] leading-relaxed text-ink-soft">
          <p>
            <strong className="text-ink">Last updated:</strong> October 2026
          </p>
          <p>
            This page says what actually happens to your information when you use this site or work
            with us. No boilerplate, just what&apos;s true.
          </p>
          <p>
            &ldquo;We&rdquo; means {LEGAL_NAME}, {LEGAL_ENTITY} based in {HOME_BASE}. Austin Hodges
            runs it. This policy covers this site, the quote sign-up, questionnaire and previews at{' '}
            <code className={CODE}>tool.softsystemsstudiollc.com</code>, and the information we
            handle while we build or look after a client&apos;s site.
          </p>

          <h2 className={H2}>Asking for a quote</h2>
          <p>
            &ldquo;Get a quote&rdquo; takes you to a short sign-up form on our own tool. It asks for
            your name, business name, email, phone number, what kind of site you&apos;re after, and
            when. We then email you a private link to a longer questionnaire about your business.
            The link is how you get back into it, so don&apos;t forward it to anyone.
          </p>
          <p>
            What you enter is saved in that tool&apos;s database so we can follow up, quote your
            project and build your site from your answers. When you sign up, open the link or send
            your answers, we get an email and a Discord notification so we don&apos;t miss it. The
            link is sent through Resend, an email delivery service. We don&apos;t sell or rent what
            you send, and we don&apos;t add you to a mailing list.
          </p>

          <h2 className={H2}>If we contacted you first</h2>
          <p>
            We sometimes email local businesses we think we could help. We find them through public
            listings, using Google&apos;s Places service (the data behind Google Maps). We look over
            what&apos;s already public: the business name, address, phone, rating, reviews and
            website. Some of our tools use an AI service (Anthropic) to review a site and draft a
            suggested preview or email. We work only from public business information, nothing
            personal beyond a business&apos;s published contact details.
          </p>
          <p>
            Every marketing email we send includes an unsubscribe link. Use it, or just reply and
            ask, and we stop. We keep your email address on a do-not-contact list so we don&apos;t
            write to you again.
          </p>

          <h2 className={H2}>Previews we make for you</h2>
          <p>
            If we send you a preview of a site we made for your business, the preview tells us when
            it was opened and how much of it was looked at: which pages, how far down they were
            scrolled, how long the tab was on screen, and whether it was a phone, tablet or
            computer. We use this only to know whether the preview was useful and when to follow up.
            It sets no cookies. It keeps a random visit number in your browser&apos;s session
            storage, which is cleared when you close the tab.
          </p>

          <h2 className={H2}>If you&apos;re a client</h2>
          <p>
            While we build or look after your site, you&apos;ll send us things like your text,
            photos, logo and sometimes logins (for your domain or an old site). We use them only for
            your project, and you&apos;re welcome to change any password as soon as we&apos;re done
            with it.
          </p>
          <p>
            Payments go through Stripe. We see that you paid and the last four digits of your card.
            We never see or store the full card number.
          </p>
          <p>
            If your site has its own contact or quote form, what your visitors send through it is
            your information. Those forms send messages through Web3Forms, a form delivery service,
            which emails them to you. We handle that information only to deliver it to you and keep
            the form working. Sites we build may also load their fonts from Google Fonts, which
            means a visitor&apos;s browser asks Google for the font files.
          </p>

          <h2 className={H2}>Error monitoring and hosting</h2>
          <p>
            This site doesn&apos;t run Google Analytics, advertising trackers or session recording.
            We use Sentry for error monitoring only: when something breaks, Sentry records the
            error, the page it happened on, and your browser and device type, so we can fix it. It
            doesn&apos;t record what you do on the page. The site is hosted on Vercel, which, like
            any web host, logs basic request details such as your IP address.
          </p>

          <h2 className={H2}>Cookies and storage</h2>
          <p>
            This site sets no cookies and stores nothing in your browser. The previews described
            above keep one random visit number in session storage, and nothing else. We use no
            advertising or analytics cookies anywhere, so there is nothing to opt in to or out of.
          </p>

          <h2 className={H2}>Services that handle your information</h2>
          <p>
            We share your information only with the services that run our business, and only for
            that:
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>Vercel and Cloudflare: hosting and domains</li>
            <li>Supabase: the database behind our tool</li>
            <li>Resend: sending email from our tool</li>
            <li>Google Workspace: our email</li>
            <li>Google Places: finding businesses we might contact</li>
            <li>Discord: our own notifications</li>
            <li>Stripe: payments</li>
            <li>Sentry: error monitoring</li>
            <li>Anthropic: AI assistance, as described above</li>
            <li>Web3Forms: delivering form messages on sites we build for clients</li>
          </ul>
          <p>We may also disclose information if the law requires it.</p>

          <h2 className={H2}>How long we keep it</h2>
          <p>
            We keep quote requests and client records while we&apos;re talking or working together.
            After that, we keep them only as long as we need them for our business and tax records,
            or until you ask us to delete them. Payment records are kept as long as tax law
            requires. Preview visit records are deleted along with the business&apos;s record.
          </p>

          <h2 className={H2}>Your rights</h2>
          <p>Wherever you live, you can ask us to:</p>
          <ul className="list-disc space-y-2 pl-6">
            <li>tell you what information we hold about you, and give you a copy</li>
            <li>correct anything that&apos;s wrong</li>
            <li>delete it</li>
            <li>stop contacting you</li>
          </ul>
          <p>
            Some US states, such as California, give you these rights by law, along with the right
            to opt out of the sale or sharing of your personal information. We don&apos;t sell your
            personal information, and we don&apos;t share it for advertising. We won&apos;t treat
            you differently for using any of these rights.
          </p>
          <p>
            To make a request, email{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className={LINK}>
              {CONTACT_EMAIL}
            </a>
            . We check that a request is really from you by replying to the email address we have on
            file for you. We answer within 45 days.
          </p>
          <p>
            A deletion request covers our tool&apos;s database (your sign-up, questionnaire answers
            and preview visits), our email inbox, the email records at Resend, and our Discord
            notifications. Stripe keeps the payment records tax law requires, and we keep your email
            address on our do-not-contact list so we don&apos;t write to you again.
          </p>

          <h2 className={H2}>Children</h2>
          <p>
            This site and our services are for businesses. They aren&apos;t meant for anyone under
            13, and we don&apos;t knowingly collect information from children.
          </p>

          <h2 className={H2}>SSS Hub, and Austin&apos;s own Google Calendar and Gmail</h2>
          <p>
            This part isn&apos;t about you or anything you do on this site. It&apos;s here because
            Google requires a public privacy policy before a private tool can connect to a Google
            account. If you&apos;re a visitor or a client, none of this involves your information.
          </p>
          <p>
            Austin runs a private dashboard for the business called SSS Hub. It&apos;s not a public
            product, it has no other users, and it runs on his own computer. Nobody else can sign
            into it.
          </p>
          <p>
            To show Austin his own day at a glance, SSS Hub asks his Google account for two things:
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <code className={CODE}>https://www.googleapis.com/auth/calendar.readonly</code>{' '}
              &mdash; read-only access to his calendar
            </li>
            <li>
              <code className={CODE}>https://www.googleapis.com/auth/gmail.readonly</code> &mdash;
              read-only access to his Gmail
            </li>
          </ul>
          <p>
            Both are strictly read-only. SSS Hub can&apos;t send, delete or change anything in the
            calendar or the inbox. It can only look.
          </p>
          <p>
            What it looks at, and what it does with it: it shows the next few calendar events, how
            many emails arrived in the last day, and the subject line and sender of the handful
            Gmail has already marked important. It never reads the body of an email. All of it shows
            on a password-protected dashboard only Austin can reach. Once a day, the same summary
            goes into a short note he keeps for himself and an email to his own inbox. It goes
            nowhere else.
          </p>
          <p>
            The sign-in token that keeps this connected lives in a file on Austin&apos;s own
            computer. It is kept out of source control and is never sent out through anything the
            dashboard shows in a browser.
          </p>
          <p>None of it is sold, shared with anyone else, or used for advertising.</p>
          <p>
            You can see or revoke anything connected to a Google account from Google&apos;s own
            permissions page:{' '}
            <a
              href="https://myaccount.google.com/permissions"
              className={LINK}
              target="_blank"
              rel="noopener noreferrer"
            >
              myaccount.google.com/permissions
            </a>
            .
          </p>

          <h2 className={H2}>Docklight Lo-Fi, and TikTok/YouTube</h2>
          <p>
            Same as the section above: this isn&apos;t about you or anything you do on this site.
            Docklight Lo-Fi is an ambient music channel we run (
            <a
              href="https://www.tiktok.com/@docklightlo-fi"
              className={LINK}
              target="_blank"
              rel="noopener noreferrer"
            >
              @docklightlo-fi
            </a>
            ), and part of publishing it is automated. TikTok and YouTube both require a public
            privacy policy before they let an app like that connect to an account.
          </p>
          <p>
            The automation signs in as the @docklightlo-fi account itself, on each platform, and
            asks only for what it needs to publish video there:
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <code className={CODE}>video.upload</code> &mdash; upload a video to the account, as a
              draft
            </li>
            <li>
              <code className={CODE}>video.publish</code> &mdash; post a video directly to the
              account&apos;s own profile
            </li>
            <li>
              <code className={CODE}>user.info.basic</code> &mdash; read the account&apos;s own
              basic profile info (open id, display name, avatar), so the automation can confirm
              which account it&apos;s about to post as before it does
            </li>
          </ul>
          <p>
            It never touches any other account, and it doesn&apos;t read, collect or store anything
            belonging to @docklightlo-fi&apos;s viewers, commenters or followers.
          </p>
          <p>
            You can see or revoke this connection from each platform&apos;s own settings. On TikTok,
            go to Settings and privacy &rarr; Security and login &rarr; Manage app permissions. On
            YouTube/Google, use{' '}
            <a
              href="https://myaccount.google.com/permissions"
              className={LINK}
              target="_blank"
              rel="noopener noreferrer"
            >
              myaccount.google.com/permissions
            </a>
            .
          </p>

          <h2 className={H2}>Changes to this policy</h2>
          <p>
            If what this site, our tools or SSS Hub do with information changes, we&apos;ll update
            this page and the date at the top to match. It&apos;s meant to describe what&apos;s true
            now.
          </p>

          <h2 className={H2}>Contact</h2>
          <p>
            Questions about any of this? Email us at{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className={LINK}>
              {CONTACT_EMAIL}
            </a>
            , or write to {LEGAL_NAME}, {MAILING_ADDRESS}.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
