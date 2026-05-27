import Link from 'next/link';

const quickLinks = [
  { href: '/yves-rocher-reporting', label: 'Reporting', text: 'Weekly and monthly KPI dashboard' },
  { href: '/yves-rocher-reporting/upload', label: 'Upload CSV', text: 'Import Gorgias and operational files' },
  { href: '/yves-rocher-reporting/weekly', label: 'Weekly Report', text: 'Current week performance review' },
  { href: '/yves-rocher-reporting/monthly', label: 'Monthly Report', text: 'Trends, totals and averages' },
  { href: '/yves-rocher-reporting/history', label: 'History', text: 'Uploaded weeks and archive' },
  { href: '/yves-rocher-reporting/settings', label: 'Settings', text: 'Tag mapping and KPI configuration' },
  { href: '/yves-rocher-reporting/migration', label: 'Migration', text: 'Export or import yr_reports data' },
  { href: '/policies', label: 'Policies', text: 'Customer service guidelines' }
];

export default function Home() {
  return (
    <main className="yrHome">
      <section className="yrHero">
        <div className="yrHeroTop">
          <div className="yrLogoBlock" aria-label="Yves Rocher Customer Care Hub">
            <div className="yrLeafMark">YR</div>
            <div>
              <div className="yrBrand">Yves Rocher</div>
              <div className="yrSubBrand">Customer Care Hub</div>
            </div>
          </div>
          <div className="yrPill">Protected workspace</div>
        </div>

        <div className="yrHeroGrid">
          <div>
            <p className="yrEyebrow">Botanical care. Human service. Clear reporting.</p>
            <h1>Yves Rocher Customer Service Hub</h1>
            <p className="yrLead">
              Central workspace for reporting, policies, weekly reviews and KPI tracking — designed with a softer Yves Rocher inspired look.
            </p>
            <div className="yrActions">
              <Link className="yrPrimary" href="/yves-rocher-reporting">Open Reporting</Link>
              <Link className="yrSecondary" href="/policies">View Policies</Link>
            </div>
          </div>

          <div className="yrHeroCard">
            <div className="yrBotanicalCircle">✦</div>
            <h2>Today’s focus</h2>
            <p>Upload files, review CS trends, check customer policies and prepare the next weekly business update.</p>
            <div className="yrMiniStats">
              <div><b>CSV</b><span>Upload ready</span></div>
              <div><b>KPI</b><span>Weekly view</span></div>
              <div><b>YR</b><span>Policies</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="yrSectionHeader">
        <p className="yrEyebrow">Workspace</p>
        <h2>What do you want to open?</h2>
      </section>

      <section className="yrCards">
        {quickLinks.map((item) => (
          <Link key={item.href} href={item.href} className="yrCard">
            <span>{item.label}</span>
            <p>{item.text}</p>
            <em>Open →</em>
          </Link>
        ))}
      </section>
    </main>
  );
}
