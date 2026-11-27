import { Link } from "react-router-dom";

const CONTACT_EMAIL = "gsabarish22@gmail.com";
const UPDATED = "27 November 2026";

function Section({ title, children }) {
  return (
    <section className="mt-8">
      <h2 className="font-serif text-xl font-semibold tracking-tight text-slate-900">{title}</h2>
      <div className="mt-2 space-y-3 text-[15px] leading-relaxed text-gray-700">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-page font-sans text-slate-900 antialiased">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex min-h-16 max-w-3xl items-center px-4 sm:px-8">
          <Link to="/" className="font-serif text-[22px] font-semibold tracking-tight">
            Real-Time News Alerts
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-8">
        <h1 className="font-serif text-4xl font-semibold tracking-tight">Privacy Policy</h1>
        <p className="mt-2 text-sm text-gray-600">Last updated: {UPDATED}</p>

        <Section title="Who we are">
          <p>
            Real-Time News Alerts is a personal project by Sabarish Ganesh P. It sends news
            headlines to people who sign up, based on the topics and schedule they choose.
            Contact: <a className="text-brand underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
          </p>
        </Section>

        <Section title="What we collect">
          <ul className="list-disc space-y-1 pl-5">
            <li>Your name and email address, which you give us when you register.</li>
            <li>Your password, stored only as a secure one-way hash. We cannot read it.</li>
            <li>Your alert settings: topics, how often, and whether you want email and/or browser alerts.</li>
            <li>A history of the news alerts we have sent you.</li>
          </ul>
          <p>We do not use advertising or analytics trackers, and we do not collect payment details.</p>
        </Section>

        <Section title="How we use it">
          <ul className="list-disc space-y-1 pl-5">
            <li>To log you in and keep your account secure.</li>
            <li>To send you the news alerts you asked for, and password reset emails when you request them.</li>
            <li>To show your alert history on your dashboard.</li>
          </ul>
          <p>We never sell or share your personal information with anyone for marketing.</p>
        </Section>

        <Section title="Google API data">
          <p>
            Alert emails are sent from the app's own Gmail account through the Gmail API, using only
            permission to <strong>send</strong> email. The app does not read, store or access the
            contents of any Gmail inbox, and does not ask your Google account for any data.
          </p>
          <p>
            The use of information received from Google APIs adheres to the{" "}
            <a
              className="text-brand underline"
              href="https://developers.google.com/terms/api-services-user-data-policy"
              target="_blank"
              rel="noreferrer"
            >
              Google API Services User Data Policy
            </a>
            , including the Limited Use requirements.
          </p>
        </Section>

        <Section title="Services we rely on">
          <p>
            Your data is stored in MongoDB Atlas. The app runs on Render (server) and Vercel
            (website). News headlines come from NewsAPI; we do not send them any of your personal
            information.
          </p>
        </Section>

        <Section title="How long we keep it and your choices">
          <ul className="list-disc space-y-1 pl-5">
            <li>You can turn alerts off at any time on your News Feed page.</li>
            <li>You can clear your alert history on the Dashboard.</li>
            <li>
              To delete your account and all its data, email{" "}
              <a className="text-brand underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>{" "}
              from your registered address. We delete it within 30 days.
            </li>
          </ul>
        </Section>

        <Section title="Security">
          <p>
            Connections use HTTPS, passwords are hashed with bcrypt, and every private request is
            checked with a signed login token, so you can only ever see your own data.
          </p>
        </Section>

        <Section title="Changes">
          <p>If this policy changes, we will update the date at the top of this page.</p>
        </Section>

        <p className="mt-10">
          <Link to="/" className="font-semibold text-brand underline">
            Back to the home page
          </Link>
        </p>
      </main>
    </div>
  );
}
