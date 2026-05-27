import Link from 'next/link';

export default function Home() {
  const cards = [
    ['Upload Center', '/yves-rocher-reporting/upload', 'Import weekly Gorgias, orders, finance, channel and social CSVs.'],
    ['Weekly Report', '/yves-rocher-reporting/weekly', 'Track created tickets, closed tickets, backlog, orders, SLA and CSAT.'],
    ['Monthly Report', '/yves-rocher-reporting/monthly', 'Aggregate weekly reports into monthly trends and executive summaries.'],
    ['History', '/yves-rocher-reporting/history', 'Review all uploaded weeks and export/import local report data.'],
    ['Settings', '/yves-rocher-reporting/settings', 'Maintain tag mapping and reporting definitions.'],
  ];

  return (
    <main className="shell">
      <section className="hero yr">
        <p className="eyebrow">Yves Rocher Customer Care</p>
        <h1>Reporting Hub</h1>
        <p className="lead">A standalone hub for Customer Service reporting, KPI review, and weekly/monthly performance tracking.</p>
      </section>
      <section className="grid cards">
        {cards.map(([title, href, text]) => (
          <Link href={href} className="card" key={href}>
            <h2>{title}</h2>
            <p>{text}</p>
          </Link>
        ))}
      </section>
    </main>
  );
}
