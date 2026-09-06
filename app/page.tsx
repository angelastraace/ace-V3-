import MarketFeed from "./MarketFeed";

const ecosystem = [
  { tag: "TRADING", title: "Spot markets", body: "Move from market discovery into the ACE digital-asset trading experience.", href: "/trading", glyph: "↗" },
  { tag: "ASSETS", title: "ACE Wallet", body: "Access and manage digital assets through one connected ACE identity.", href: "/wallet", glyph: "◇" },
  { tag: "CREATORS", title: "Creator ecosystem", body: "Discover the creator side of ACE and the experiences connected to it.", href: "/creator", glyph: "✦" },
  { tag: "INTELLIGENCE", title: "ACE AI", body: "Explore AI-powered tools and functionality available inside the ACE ecosystem.", href: "/ai", glyph: "⌁" },
];

const platformValues = [
  ["One connected account", "Move between markets, wallet and ecosystem experiences without changing platforms."],
  ["Market-first interface", "Prices, movement and action stay visually dominant while secondary content stays quiet."],
  ["Built for transparency", "Live data is identified as live. If a feed is unavailable, ACE says so instead of inventing values."],
];

export default function Home() {
  return (
    <main id="top">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="ACE Exchange home">
          <span className="brand-symbol">A</span>
          <span className="brand-copy"><strong>ACE</strong><small>EXCHANGE</small></span>
        </a>

        <nav className="desktop-nav" aria-label="Primary navigation">
          <a href="#markets">Markets</a>
          <a href="/trading">Trade</a>
          <a href="/wallet">Wallet</a>
          <a href="#ecosystem">Ecosystem</a>
          <a href="/about">About</a>
        </nav>

        <div className="header-actions">
          <a className="signin hide-small" href="/login">Sign in</a>
          <a className="button button-small" href="/register">Get started</a>
          <details className="mobile-menu">
            <summary aria-label="Open menu"><span /><span /><span /></summary>
            <div className="mobile-panel">
              <a href="#markets">Markets</a>
              <a href="/trading">Trade</a>
              <a href="/wallet">Wallet</a>
              <a href="#ecosystem">Ecosystem</a>
              <a href="/about">About</a>
              <a href="/login">Sign in</a>
            </div>
          </details>
        </div>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <div className="product-kicker"><span className="live-pip" /> DIGITAL ASSET ECOSYSTEM</div>
          <h1>Trade.<br /><span>Create.</span><br />Connect.</h1>
          <p className="hero-sub">A modern digital-asset platform connecting markets, ownership, creators and community through one ACE experience.</p>
          <div className="hero-actions">
            <a className="button" href="/trading">Launch exchange <span>↗</span></a>
            <a className="button button-secondary" href="#markets">Explore markets</a>
          </div>
          <div className="hero-meta" aria-label="Platform principles">
            <div><small>PLATFORM</small><strong>Connected</strong></div>
            <div><small>MARKET DATA</small><strong>Live-first</strong></div>
            <div><small>EXPERIENCE</small><strong>Clarity-led</strong></div>
          </div>
        </div>

        <div className="terminal-shell" aria-label="ACE Exchange interface preview">
          <div className="terminal-topbar">
            <div className="terminal-brand"><span className="terminal-dot" /> ACE MARKET VIEW</div>
            <div className="terminal-status">LIVE INTERFACE</div>
          </div>
          <div className="terminal-body">
            <div className="terminal-pair">
              <div><small>MARKET</small><strong>BTC / USD</strong></div>
              <span className="pair-badge">SPOT</span>
            </div>
            <div className="terminal-price"><span className="price-placeholder">Live price</span><small>via ACE market feed</small></div>
            <div className="chart" aria-hidden="true">
              <svg viewBox="0 0 560 190" role="presentation">
                <defs>
                  <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#39bdf8" stopOpacity="0.24" />
                    <stop offset="100%" stopColor="#39bdf8" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="line" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#2f6dff" />
                    <stop offset="100%" stopColor="#45d4ff" />
                  </linearGradient>
                </defs>
                <path className="chart-grid" d="M0 30H560 M0 80H560 M0 130H560 M0 180H560" />
                <path className="chart-area" d="M0 158 C50 148 72 165 110 139 S174 110 212 126 S278 104 309 112 S371 72 407 87 S463 55 492 65 S530 43 560 30 L560 190 L0 190Z" />
                <path className="chart-line" d="M0 158 C50 148 72 165 110 139 S174 110 212 126 S278 104 309 112 S371 72 407 87 S463 55 492 65 S530 43 560 30" />
              </svg>
            </div>
            <div className="terminal-stats">
              <div><small>24H VOLUME</small><strong>Live data</strong></div>
              <div><small>24H CHANGE</small><strong className="neutral-data">Market feed</strong></div>
              <div><small>STATUS</small><strong className="status-live">Live-first</strong></div>
            </div>
          </div>
          <div className="terminal-orders">
            <div><small>ORDER TYPE</small><strong>Market</strong></div>
            <div><small>ASSET</small><strong>BTC</strong></div>
            <a href="/trading">Open trading <span>↗</span></a>
          </div>
        </div>
      </section>

      <div className="trust-strip">
        <span>ACE EXCHANGE</span><i />
        <span>MARKETS</span><i />
        <span>WALLET</span><i />
        <span>CREATOR</span><i />
        <span>AI</span><i />
        <span>COMMUNITY</span>
      </div>

      <section className="section markets-section" id="markets">
        <div className="section-heading split-heading">
          <div>
            <div className="section-label">MARKETS</div>
            <h2>Live markets.<br /><span>Zero invented data.</span></h2>
          </div>
          <div className="heading-note">
            <p>Market information comes from one live data source. When that source is unavailable, ACE shows an unavailable state rather than demo pricing.</p>
            <a href="/trading">View trading interface <span>↗</span></a>
          </div>
        </div>
        <MarketFeed />
      </section>

      <section className="section ecosystem-section" id="ecosystem">
        <div className="section-heading split-heading">
          <div>
            <div className="section-label">ACE ECOSYSTEM</div>
            <h2>More than<br /><span>an exchange.</span></h2>
          </div>
          <p>ACE connects trading, digital ownership and participation through a single platform identity.</p>
        </div>
        <div className="ecosystem-grid">
          {ecosystem.map((item) => (
            <a className="ecosystem-card" href={item.href} key={item.title}>
              <div className="card-head"><span>{item.tag}</span><b>{item.glyph}</b></div>
              <div className="card-icon" aria-hidden="true">{item.glyph}</div>
              <div><h3>{item.title}</h3><p>{item.body}</p></div>
              <span className="card-link">Explore <b>↗</b></span>
            </a>
          ))}
        </div>
      </section>

      <section className="section platform-section">
        <div className="section-heading">
          <div className="section-label">PLATFORM PRINCIPLES</div>
          <h2>Designed to feel financial.<br /><span>Not promotional.</span></h2>
        </div>
        <div className="platform-grid">
          {platformValues.map(([title, body], index) => (
            <article className="platform-card" key={title}>
              <span className="platform-index">0{index + 1}</span>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section access-section">
        <div className="access-panel">
          <div className="access-copy">
            <div className="section-label">ONE ACE IDENTITY</div>
            <h2>One account.<br /><span>A connected ecosystem.</span></h2>
            <p>Create your ACE account, secure your profile and move into markets, wallet and ecosystem experiences from one place.</p>
            <a className="button" href="/register">Create account <span>↗</span></a>
          </div>
          <div className="access-flow" aria-label="ACE account flow">
            <div className="flow-item"><b>01</b><span><strong>Create</strong><small>ACE account</small></span></div>
            <div className="flow-line" />
            <div className="flow-item"><b>02</b><span><strong>Secure</strong><small>Profile & access</small></span></div>
            <div className="flow-line" />
            <div className="flow-item"><b>03</b><span><strong>Connect</strong><small>Markets & ecosystem</small></span></div>
          </div>
        </div>
      </section>

      <section className="final-cta">
        <div className="cta-grid" aria-hidden="true" />
        <div className="section-label">ACE EXCHANGE</div>
        <h2>Trade. Create.<br /><span>Connect.</span></h2>
        <p>Enter the ACE digital-asset ecosystem through one clear, connected experience.</p>
        <div className="hero-actions centered-actions">
          <a className="button" href="/register">Get started <span>↗</span></a>
          <a className="button button-secondary" href="/trading">Explore markets</a>
        </div>
      </section>

      <footer>
        <div className="footer-main">
          <div className="footer-brand">
            <div className="brand"><span className="brand-symbol">A</span><span className="brand-copy"><strong>ACE</strong><small>EXCHANGE</small></span></div>
            <p>A connected digital-asset ecosystem for markets, ownership, creators and community.</p>
          </div>
          <div className="footer-column"><h4>Platform</h4><a href="#markets">Markets</a><a href="/trading">Trade</a><a href="/wallet">Wallet</a></div>
          <div className="footer-column"><h4>Ecosystem</h4><a href="/creator">Creator</a><a href="/ai">AI</a><a href="/community">Community</a></div>
          <div className="footer-column"><h4>Company</h4><a href="/about">About</a><a href="/support">Support</a></div>
        </div>
        <div className="footer-bottom"><span>© 2026 ACE Exchange. All rights reserved.</span><span>Trade. Create. Connect.</span></div>
      </footer>
    </main>
  );
}
