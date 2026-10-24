import type { Metadata } from 'next';
import { Navbar, Footer } from '@/components/ui';
import { CONTACT_EMAIL, HOME_BASE } from '@/lib/business';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    "What happens to your information when you use this site, ask for a quote or become a client, and what my own private dashboard's read-only Google Calendar and Gmail access is for.",
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-24">
        <h1 className="mb-10 font-serif text-[48px] leading-none tracking-[-0.015em] sm:text-[64px]">
          Privacy Policy
        </h1>
        <div className="space-y-6 text-[17px] leading-relaxed text-ink-soft">
          <p>
            <strong className="text-ink">Last updated:</strong> October 2026
          </p>
          <p>
            I&apos;m Austin, and I built and run this site myself. Here&apos;s what actually happens
            to your information when you use it &mdash; no boilerplate, no padding, just what&apos;s
            true.
          </p>
          <p>
            &ldquo;I&rdquo; here means Soft Systems Studio LLC, my business, based in {HOME_BASE}.
            This policy covers this site, the quote sign-up and questionnaire at{' '}
            <code className="break-all rounded bg-limestone px-1.5 py-0.5 text-[15px] text-ink">
              tool.softsystemsstudiollc.com
            </code>
            , and the information I handle while building or looking after a client&apos;s site.
          </p>

          <h2 className="pt-6 font-serif text-[32px] leading-tight text-ink">Asking for a quote</h2>
          <p>
            &ldquo;Get a quote&rdquo; takes you to a short sign-up form on my own tool. It asks for
            your name, business name, email, phone number, what kind of site you&apos;re after, and
            when. I then email you a private link to a longer questionnaire about your business; the
            link is how you get back into it, so don&apos;t forward it to anyone.
          </p>
          <p>
            Everything you enter is saved in that tool&apos;s database so I can follow up, quote
            your project and build your site from your answers. When you sign up, open the link or
            send your answers, I get an email and a Discord notification so I don&apos;t miss it.
            The link itself is sent through Resend, an email delivery service. I don&apos;t sell or
            rent what you send, and I don&apos;t add you to a mailing list.
          </p>

          <h2 className="pt-6 font-serif text-[32px] leading-tight text-ink">
            If I contacted you first
          </h2>
          <p>
            I sometimes email local businesses I think I could help. I find them through public
            listings such as Google Maps, and I look over what&apos;s already public: the business
            name, address, phone, reviews and website. Some of my tools use an AI service
            (Anthropic) to help review a site and draft a suggested preview or email. I only work
            from public, business information &mdash; nothing personal beyond a business&apos;s
            published contact details. Every email I send this way has an unsubscribe link, and once
            you use it, or just reply and ask, I stop.
          </p>

          <h2 className="pt-6 font-serif text-[32px] leading-tight text-ink">
            If you&apos;re a client
          </h2>
          <p>
            While I build or look after your site, you&apos;ll send me things like your text,
            photos, logo and sometimes logins (for your domain or an old site). I use them only for
            your project, and you&apos;re welcome to change any password as soon as I&apos;m done
            with it.
          </p>
          <p>
            Payments go through Stripe. I see that you paid and the last four digits of your card; I
            never see or store the full card number. If your site has its own forms, what your
            visitors send through them is your information: I handle it only to deliver it to you
            and keep the form working.
          </p>

          <h2 className="pt-6 font-serif text-[32px] leading-tight text-ink">
            Analytics, error monitoring and cookies
          </h2>
          <p>
            This site doesn&apos;t run Google Analytics or any advertising tracker. It does use
            Sentry to catch errors: when something breaks, Sentry records what went wrong and your
            browser and device type, and for a small share of visits (and any visit that hits an
            error) a replay of what happened on the page, with anything typed into a form blanked
            out. I use it only to fix bugs. The site is hosted on Vercel, which, like any web host,
            logs basic request details such as your IP address. Clerk, the sign-in service the site
            uses, may set cookies it needs to work. There are no advertising cookies.
          </p>

          <h2 className="pt-6 font-serif text-[32px] leading-tight text-ink">
            Services that handle your information
          </h2>
          <p>
            I don&apos;t share your information with anyone except the services that run my
            business, and only for that: Vercel and Cloudflare (hosting and domains), Supabase (the
            database behind my tool), Resend (sending email), Google Workspace (my email), Discord
            (my own notifications), Stripe (payments), Sentry (error monitoring), Clerk (sign-in)
            and Anthropic (AI assistance, as described above). I may also disclose information if
            the law requires it.
          </p>

          <h2 className="pt-6 font-serif text-[32px] leading-tight text-ink">
            How long I keep it, and your choices
          </h2>
          <p>
            I keep quote requests and client records for as long as we&apos;re talking or working
            together, and afterwards for as long as I need them for my business and tax records. You
            can ask me at any time to see what I hold about you, correct it, or delete it, and
            I&apos;ll do it unless the law requires me to keep something (such as payment records).
            Just email me.
          </p>

          <h2 className="pt-6 font-serif text-[32px] leading-tight text-ink">Children</h2>
          <p>
            This site and my services are for businesses. They aren&apos;t meant for anyone under
            13, and I don&apos;t knowingly collect information from children.
          </p>

          <h2 className="pt-6 font-serif text-[32px] leading-tight text-ink">
            SSS Hub, and my own Google Calendar and Gmail
          </h2>
          <p>
            This part isn&apos;t about you or anything you do on this site &mdash; it&apos;s here
            because Google requires a public privacy policy before I&apos;m allowed to connect a
            private tool to my own Google account. If you&apos;re a visitor or a client, none of
            this involves your information.
          </p>
          <p>
            I run a private dashboard for my own business called SSS Hub. It&apos;s not a public
            product, it has no other users, and it runs on my own computer &mdash; nobody else can
            sign into it.
          </p>
          <p>To show me my own day at a glance, SSS Hub asks my Google account for two things:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <code className="break-all rounded bg-limestone px-1.5 py-0.5 text-[15px] text-ink">
                https://www.googleapis.com/auth/calendar.readonly
              </code>{' '}
              &mdash; read-only access to my calendar
            </li>
            <li>
              <code className="break-all rounded bg-limestone px-1.5 py-0.5 text-[15px] text-ink">
                https://www.googleapis.com/auth/gmail.readonly
              </code>{' '}
              &mdash; read-only access to my Gmail
            </li>
          </ul>
          <p>
            Both are strictly read-only. SSS Hub cannot send, delete, or change anything in my
            calendar or my inbox &mdash; it can only look.
          </p>
          <p>
            What it looks at, and what it does with it: it shows my next few upcoming calendar
            events, how many emails arrived in the last day, and the subject line and sender of the
            handful Gmail has already marked important &mdash; never the body of an email.
            That&apos;s the extent of it. All of it renders on a dashboard that&apos;s
            password-protected and reachable only by me. Once a day, that same summary is folded
            into a short note I keep for myself and an email I send to my own inbox, so I have a
            record of my own day &mdash; it doesn&apos;t go anywhere beyond that.
          </p>
          <p>
            The sign-in token that keeps this connected lives in a file on my own computer. It is
            excluded from source control and is never sent back out through anything the dashboard
            shows in a browser.
          </p>
          <p>None of it is sold, shared with anyone else, or used for advertising.</p>
          <p>
            You can see or revoke anything connected to a Google account, mine included, from
            Google&apos;s own permissions page:{' '}
            <a
              href="https://myaccount.google.com/permissions"
              className="text-ink underline underline-offset-4 hover:text-ink-soft"
              target="_blank"
              rel="noopener noreferrer"
            >
              myaccount.google.com/permissions
            </a>
            .
          </p>

          <h2 className="pt-6 font-serif text-[32px] leading-tight text-ink">
            Docklight Lo-Fi, and TikTok/YouTube
          </h2>
          <p>
            Same as the section above &mdash; this isn&apos;t about you or anything you do on this
            site. Docklight Lo-Fi is an ambient music channel I run (
            <a
              href="https://www.tiktok.com/@docklightlo-fi"
              className="text-ink underline underline-offset-4 hover:text-ink-soft"
              target="_blank"
              rel="noopener noreferrer"
            >
              @docklightlo-fi
            </a>
            ), and part of publishing it is automated. Both TikTok and YouTube require a public
            privacy policy before they&apos;ll let an app like that connect to an account at all.
          </p>
          <p>
            The automation authenticates as the @docklightlo-fi account itself, on each platform,
            and asks for only what it needs to publish video there:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <code className="break-all rounded bg-limestone px-1.5 py-0.5 text-[15px] text-ink">
                video.upload
              </code>{' '}
              &mdash; upload a video to the account, as a draft
            </li>
            <li>
              <code className="break-all rounded bg-limestone px-1.5 py-0.5 text-[15px] text-ink">
                video.publish
              </code>{' '}
              &mdash; post a video directly to the account&apos;s own profile
            </li>
            <li>
              <code className="break-all rounded bg-limestone px-1.5 py-0.5 text-[15px] text-ink">
                user.info.basic
              </code>{' '}
              &mdash; read the account&apos;s own basic profile info (open id, display name,
              avatar), so the automation can confirm which account it&apos;s about to post as before
              it does
            </li>
          </ul>
          <p>
            It never touches any account but that one, and it doesn&apos;t read, collect, or store
            anything belonging to @docklightlo-fi&apos;s viewers, commenters, or followers.
          </p>
          <p>
            You can see or revoke this connection from each platform&apos;s own settings &mdash; on
            TikTok, under Settings and privacy &rarr; Security and login &rarr; Manage app
            permissions; on YouTube/Google, from{' '}
            <a
              href="https://myaccount.google.com/permissions"
              className="text-ink underline underline-offset-4 hover:text-ink-soft"
              target="_blank"
              rel="noopener noreferrer"
            >
              myaccount.google.com/permissions
            </a>
            .
          </p>

          <h2 className="pt-6 font-serif text-[32px] leading-tight text-ink">
            Changes to this policy
          </h2>
          <p>
            If what this site, my tools or SSS Hub do with information changes, I&apos;ll update
            this page and the date at the top to match &mdash; it&apos;s meant to describe
            what&apos;s actually true, not what was true when I first wrote it.
          </p>

          <h2 className="pt-6 font-serif text-[32px] leading-tight text-ink">Contact</h2>
          <p>
            Questions about any of this? Email me at{' '}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-ink underline underline-offset-4 hover:text-ink-soft"
            >
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
