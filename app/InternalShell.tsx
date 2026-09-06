import styles from "./InternalShell.module.css";

type Metric = [string, string];
type Card = [string, string];

type PageSpec = {
  kicker: string;
  title: string;
  accent: string;
  intro: string;
  status: Metric[];
  cards: Card[];
  workspaceTitle: string;
  workspaceMetric: string;
  workspaceSub: string;
  mini: Metric[];
  rows: Metric[];
  features: Card[];
};

export const specs: Record<string, PageSpec> = {
  trading: {
    kicker:"ACE EXCHANGE / MARKETS", title:"Trade", accent:"markets.", intro:"A focused digital-asset trading workspace for market discovery, execution and transparent live-data states.",
    status:[["Market mode","Spot"],["Data integrity","Live-first"],["Execution state","Ready"]],
    cards:[["Market discovery","Scan core digital-asset markets from one clean interface."],["Order workflow","Move from market selection to an explicit order ticket without interface clutter."],["Transparent feeds","Unavailable market data is shown as unavailable — never replaced with invented prices."]],
    workspaceTitle:"BTC / USD — SPOT", workspaceMetric:"Market workspace", workspaceSub:"Connect the production market feed to populate live price, depth and execution data.",
    mini:[["Order type","Market / Limit"],["Time in force","Configurable"],["Quote asset","USD"],["Status","Interface ready"]],
    rows:[["Watchlist","BTC · ETH · SOL"],["Trade ticket","Buy / Sell"],["Market feed","CoinGecko-ready"],["Risk display","Pre-trade summary"]],
    features:[["Execution clarity","Keep order direction, size, quote value and confirmation visible before submission."],["Market context","Design prioritizes price, movement and liquidity information over promotional content."],["Responsive trading","Core market surfaces remain usable on desktop and mobile layouts."],["Production boundary","This package does not fabricate exchange matching, custody or settlement logic."]]
  },
  wallet: {
    kicker:"ACE EXCHANGE / ASSETS", title:"ACE", accent:"Wallet.", intro:"A unified asset layer for balances, deposits, withdrawals and connected ACE identity access.",
    status:[["Wallet state","Connected UI"],["Asset support","Multi-asset"],["Security","Account-bound"]],
    cards:[["Portfolio overview","See digital-asset holdings and account value in one place."],["Transfer flow","Clear deposit and withdrawal pathways with explicit asset selection."],["Identity connection","Wallet access stays connected to the same ACE profile and account experience."]],
    workspaceTitle:"PORTFOLIO", workspaceMetric:"Asset overview", workspaceSub:"Production balances appear here when a custody or wallet provider is connected.",
    mini:[["BTC","Balance source"],["ETH","Balance source"],["SOL","Balance source"],["USD","Quote balance"]],
    rows:[["Deposit","Receive assets"],["Withdraw","Send assets"],["History","Transaction activity"],["Security","Verification state"]],
    features:[["Asset separation","Each supported asset receives a clear balance, network and transfer state."],["Transaction history","A dedicated activity surface is ready for provider-backed ledger records."],["Safety-first actions","Transfer flows are designed for confirmation steps and visible destination details."],["No fake balances","The interface never invents portfolio values when no wallet backend is connected."]]
  },
  creator: {
    kicker:"ACE ECOSYSTEM / CREATE", title:"Creator", accent:"ecosystem.", intro:"A home for creators to publish, build audiences and connect digital ownership with the broader ACE platform.",
    status:[["Creator mode","Enabled"],["Publishing","Workspace"],["Community","Connected"]],
    cards:[["Creator identity","Build a public ACE creator profile under one connected account."],["Publish experiences","Organize releases, media and digital experiences from a dedicated surface."],["Connect audiences","Bridge creator activity into ACE community and discovery areas."]],
    workspaceTitle:"CREATOR OVERVIEW", workspaceMetric:"Build. Publish. Connect.", workspaceSub:"The creator layer is structured for content, audience and ownership integrations.",
    mini:[["Profile","Creator identity"],["Projects","Publishing hub"],["Audience","Community link"],["Assets","Ownership layer"]],
    rows:[["Creator Hub","Workspace"],["Public profile","Discoverable"],["Community","Connected"],["ACE Life","Lifestyle layer"]],
    features:[["Creator-first profile","Separate creator presentation from the financial trading workspace while preserving one ACE identity."],["Publishing architecture","Routes are prepared for projects, releases and creator-owned media."],["Community bridge","Creator pages connect naturally into discovery and community experiences."],["Extensible commerce","Future digital ownership or commerce integrations can attach without redesigning the homepage."]]
  },
  ai: {
    kicker:"ACE ECOSYSTEM / INTELLIGENCE", title:"ACE", accent:"AI.", intro:"An intelligence layer for discovery, assistance and contextual workflows across the ACE ecosystem.",
    status:[["AI surface","Ready"],["Context","ACE ecosystem"],["Mode","Assistive"]],
    cards:[["Ask ACE","A dedicated assistant surface for platform and ecosystem questions."],["Contextual help","AI can be attached to trading, wallet, creator and account workflows."],["Clear boundaries","AI assistance is separated from real transaction execution and custody logic."]],
    workspaceTitle:"ACE AI", workspaceMetric:"Intelligence workspace", workspaceSub:"Connect the preferred AI provider and server-side policies to activate production responses.",
    mini:[["Assistant","ACE AI"],["Context","Platform-aware"],["Tools","Extensible"],["State","Provider required"]],
    rows:[["Markets","Context support"],["Wallet","Workflow support"],["Creators","Discovery support"],["Account","Help layer"]],
    features:[["Platform-aware assistance","Structure AI around ACE products rather than a disconnected generic chatbot."],["Tool-ready architecture","Add server actions and approved APIs without changing the public homepage."],["Safety boundaries","Transaction and custody actions should require explicit backend authorization and user confirmation."],["Expandable intelligence","The route can evolve into search, discovery, support and ecosystem orchestration."]]
  },
  dashboard: {
    kicker:"ACE ACCOUNT / CLIENT", title:"Client", accent:"dashboard.", intro:"The private account command center for profile, wallet, trading access and ecosystem activity.",
    status:[["Account","Client"],["Access","Unified"],["Session","Secure-ready"]],
    cards:[["Account overview","Centralize identity, security and recent ACE activity."],["Quick access","Move directly into trading, wallet, creator and AI surfaces."],["Security state","Reserve a clear area for authentication, verification and account controls."]],
    workspaceTitle:"ACCOUNT OVERVIEW", workspaceMetric:"Welcome to ACE", workspaceSub:"Connect authentication and user data providers to populate the production dashboard.",
    mini:[["Profile","Account details"],["Wallet","Asset access"],["Trading","Market access"],["Security","Verification"]],
    rows:[["Profile","/profile"],["Wallet","/wallet"],["Trading","/trading"],["Community","/community"]],
    features:[["One ACE identity","All ecosystem surfaces return to the same client account context."],["Private-by-design","User-specific data belongs behind authentication rather than on the public front page."],["Modular dashboard","Cards can be backed by independent services without coupling the homepage to account logic."],["Mobile access","The layout keeps primary account actions usable from a phone-first workflow."]]
  },
  admin: {
    kicker:"ACE PLATFORM / OPERATIONS", title:"Admin", accent:"dashboard.", intro:"An internal operations surface for platform oversight, content, users and ecosystem administration.",
    status:[["Role","Administrator"],["Environment","Operations"],["Access","Restricted"]],
    cards:[["User operations","Reserve controlled access to account and support administration."],["Platform health","Surface deployment, integration and service states in one place."],["Content control","Manage creator, community and ecosystem content through explicit admin workflows."]],
    workspaceTitle:"OPERATIONS", workspaceMetric:"Platform control", workspaceSub:"Production admin actions must remain server-authorized and role-gated.",
    mini:[["Users","Admin service"],["Content","Moderation"],["System","Health"],["Audit","Event trail"]],
    rows:[["Accounts","Restricted"],["Creators","Moderation"],["Community","Operations"],["Integrations","Status"]],
    features:[["Role-gated access","Admin routing is separated from client navigation and should require explicit authorization."],["Operational visibility","Keep platform health, content and user operations observable from one workspace."],["Auditability","Critical changes should be backed by server-side logging and immutable audit records."],["Safe defaults","This frontend exposes no destructive admin action without a production backend."]]
  },
  profile: {
    kicker:"ACE ACCOUNT / IDENTITY", title:"Your ACE", accent:"profile.", intro:"A single identity surface connecting account details, creator presence and ecosystem participation.",
    status:[["Identity","ACE account"],["Visibility","Configurable"],["Security","Profile-bound"]],
    cards:[["Account identity","Maintain core profile information and public-facing identity fields."],["Creator presence","Link creator information without requiring a second account system."],["Preferences","Keep ecosystem settings and visibility controls attached to one profile."]],
    workspaceTitle:"PROFILE", workspaceMetric:"ACE identity", workspaceSub:"Connect user storage and authentication to make profile fields persistent.",
    mini:[["Display name","Profile field"],["Handle","ACE identity"],["Creator mode","Optional"],["Visibility","User control"]],
    rows:[["Account","Personal details"],["Security","Access settings"],["Creator","Public profile"],["Preferences","Ecosystem"]],
    features:[["One identity model","Avoid fragmented accounts across trading, wallet and creator products."],["Public/private separation","Public creator fields can remain distinct from sensitive account data."],["Portable preferences","Platform settings stay tied to the user rather than individual pages."],["Security integration","Authentication and verification states belong in the account layer, not static UI."]]
  },
  "creator-hub": {
    kicker:"ACE CREATOR / WORKSPACE", title:"Creator", accent:"Hub.", intro:"The working environment for creator projects, releases, audience activity and connected ACE experiences.",
    status:[["Workspace","Creator"],["Projects","Organized"],["Publishing","Ready"]],
    cards:[["Projects","Organize creator initiatives from concept through release."],["Publishing","Prepare media and public-facing experiences for ACE discovery."],["Audience","Connect creator activity with community engagement and profile visibility."]],
    workspaceTitle:"CREATOR HUB", workspaceMetric:"Project workspace", workspaceSub:"A production content service can attach here without changing the exchange homepage.",
    mini:[["Drafts","Project state"],["Published","Release state"],["Audience","Engagement"],["Assets","Ownership"]],
    rows:[["Projects","Manage"],["Releases","Publish"],["Profile","Present"],["Community","Connect"]],
    features:[["Dedicated workspace","Keep creator tools separate from the public creator discovery page."],["Project lifecycle","Support draft, review, publish and archive states through backend services."],["Audience connection","Bridge releases into community and profile surfaces."],["Ownership-ready","The architecture leaves room for digital assets and creator commerce integrations."]]
  },
  "ace-life": {
    kicker:"ACE ECOSYSTEM / LIFESTYLE", title:"ACE", accent:"Life.", intro:"A broader lifestyle and culture layer for experiences that sit beyond exchange execution and account utilities.",
    status:[["Layer","Lifestyle"],["Discovery","Editorial"],["Identity","ACE-connected"]],
    cards:[["Discover","Explore experiences, stories and culture connected to ACE."],["Connect","Bridge lifestyle content to creators and community."],["Participate","Create a future home for events, memberships and ecosystem participation."]],
    workspaceTitle:"ACE LIFE", workspaceMetric:"Beyond markets", workspaceSub:"An editorial and experiential layer connected to the same ACE identity.",
    mini:[["Stories","Editorial"],["Events","Future"],["Creators","Connected"],["Community","Connected"]],
    rows:[["Discover","Explore"],["Creators","Meet"],["Community","Join"],["Profile","Participate"]],
    features:[["Brand expansion","Give non-financial ACE experiences a clear home without diluting the exchange interface."],["Creator connection","ACE Life can surface creator stories and ecosystem projects."],["Community bridge","Lifestyle content feeds naturally into participation and discovery."],["Modular future","Events, memberships and physical/digital experiences can be added independently."]]
  },
  community: {
    kicker:"ACE ECOSYSTEM / COMMUNITY", title:"ACE", accent:"Community.", intro:"A connected social layer for discovery, discussion, creators and participation across the ACE ecosystem.",
    status:[["Community","Open layer"],["Profiles","Connected"],["Creators","Integrated"]],
    cards:[["Discover people","Find profiles and creators across the ecosystem."],["Join discussions","Create space for structured community conversations and updates."],["Follow activity","Connect creator and ecosystem events to one participation feed."]],
    workspaceTitle:"COMMUNITY", workspaceMetric:"Connect with ACE", workspaceSub:"Connect moderation, feeds and messaging services to activate production community features.",
    mini:[["Profiles","Discovery"],["Creators","Integrated"],["Topics","Discussions"],["Activity","Feed"]],
    rows:[["Discover","People"],["Creator Hub","Projects"],["ACE Life","Culture"],["Profile","Identity"]],
    features:[["Identity-aware community","Participation uses the same ACE account rather than a separate social login."],["Creator discovery","Community can surface creator projects and releases."],["Moderation-ready","Production discussions require server-side moderation, reporting and access controls."],["Ecosystem feed","A future activity feed can unify creators, platform updates and community events."]]
  },
  kat: {
    kicker:"ACE ECOSYSTEM / COMPANION", title:"ACE", accent:"Kat.", intro:"A distinctive ACE companion experience designed to make discovery, guidance and ecosystem navigation more personal.",
    status:[["Experience","Companion"],["Context","ACE ecosystem"],["Mode","Interactive-ready"]],
    cards:[["Guide","Help users discover the right ACE surface for what they want to do."],["Personality layer","Give the ecosystem a recognizable interactive character without replacing core product UI."],["Connect","Bridge users into markets, creators, AI and community experiences."]],
    workspaceTitle:"ACE KAT", workspaceMetric:"Your ACE companion", workspaceSub:"Connect conversation, animation or AI services when the production experience is defined.",
    mini:[["Guide","Navigation"],["Discover","Ecosystem"],["AI","Optional"],["Profile","Connected"]],
    rows:[["Markets","Explore"],["Creators","Discover"],["Community","Connect"],["AI","Assist"]],
    features:[["Memorable entry point","ACE Kat can make a complex ecosystem easier to navigate without cluttering the exchange front page."],["Contextual routing","Guide users toward trading, wallet, creator or community based on intent."],["Optional AI layer","Attach ACE AI when desired while keeping the companion surface modular."],["Brand-safe boundary","Financial actions remain inside explicit product routes rather than the companion experience."]]
  },
  about: {
    kicker:"ACE EXCHANGE / COMPANY", title:"About", accent:"ACE.", intro:"ACE Exchange is designed as a connected digital-asset ecosystem spanning markets, ownership, creators, intelligence and community.",
    status:[["Positioning","Fintech"],["Principle","Connected"],["Data stance","Transparent"]],
    cards:[["Trade","A market-first exchange experience centered on clarity and live data."],["Create","A creator ecosystem with dedicated identity and publishing surfaces."],["Connect","One ACE identity linking wallet, community, AI and participation."]],
    workspaceTitle:"ACE EXCHANGE", workspaceMetric:"Trade. Create. Connect.", workspaceSub:"One connected ecosystem with a distinct premium ACE Exchange identity.",
    mini:[["Markets","Trading"],["Ownership","Wallet"],["Creators","Create"],["Community","Connect"]],
    rows:[["Homepage","Fintech interface"],["Platform","Connected identity"],["Data","Live-first"],["Design","Blue / graphite"]],
    features:[["Financial clarity","ACE Exchange uses a restrained fintech visual language rather than luxury or promotional styling."],["Connected architecture","Products are linked through one identity while remaining modular behind the homepage."],["Transparent states","Unavailable data is identified honestly instead of being replaced by fake demo numbers."],["Expandable ecosystem","New products can attach through routes without changing the core exchange positioning."]]
  },
  governance: {
    kicker:"ACE ECOSYSTEM / GOVERNANCE", title:"ACE", accent:"Governance.", intro:"A restored route for future rules, proposals, voting and transparent ecosystem decision-making.",
    status:[["Old route","Recovered"],["State","Frontend ready"],["Governance","Backend required"]],
    cards:[["Proposals","A future home for structured ecosystem proposals."],["Voting","Reserve a transparent interface for eligible participation."],["History","Keep governance decisions and outcomes auditable over time."]],
    workspaceTitle:"GOVERNANCE", workspaceMetric:"Transparent participation", workspaceSub:"The old public site linked this route but returned 404; this merged package restores it as a working page.",
    mini:[["Proposals","Future"],["Voting","Future"],["Eligibility","Rules"],["Archive","Decisions"]],
    rows:[["Active proposals","None connected"],["Voting power","Provider required"],["History","Archive-ready"],["Rules","Documentation"]],
    features:[["Recovered navigation","The previously broken /governance link now resolves inside the merged package."],["Backend-neutral","No token voting or eligibility logic is invented in the frontend."],["Audit-ready design","Proposal and outcome records have clear places in the UI."],["Ecosystem fit","Governance remains distinct from trading and custody workflows."]]
  }
};

export default function InternalShell({ page }: { page: keyof typeof specs }) {
  const s = specs[page];
  return <div className={styles.page}>
    <header className={styles.header}>
      <a href="/" className={styles.brand}><span className={styles.mark}>A</span><span>ACE<small>EXCHANGE</small></span></a>
      <nav className={styles.nav}><a href="/trading">Trade</a><a href="/wallet">Wallet</a><a href="/creator">Creator</a><a href="/ai">AI</a><a href="/community">Community</a><a href="/about">About</a></nav>
      <div className={styles.actions}><a className={styles.ghost} href="/profile">Profile</a><a className={styles.primary} href="/dashboard">Dashboard</a></div>
    </header>
    <main className={styles.main}>
      <div className={styles.crumb}>{s.kicker}</div>
      <section className={styles.hero}>
        <div><h1>{s.title}<br/><span>{s.accent}</span></h1><p>{s.intro}</p></div>
        <aside className={styles.heroPanel}><div className={styles.panelLabel}>ACE STATUS</div>{s.status.map(([a,b],i)=><div className={styles.statusRow} key={a}><span>{a}</span><strong className={i===2?styles.green:styles.blue}>{b}</strong></div>)}</aside>
      </section>
      <section className={styles.grid}>{s.cards.map(([h,p],i)=><article className={styles.card} key={h}><span className={styles.index}>0{i+1}</span><h3>{h}</h3><p>{p}</p></article>)}</section>
      <section className={styles.surface}>
        <div className={styles.surfaceTop}><span>{s.workspaceTitle}</span><span>ACE EXCHANGE</span></div>
        <div className={styles.surfaceBody}>
          <div className={styles.workspace}><div className={styles.panelLabel}>WORKSPACE</div><div className={styles.bigMetric}>{s.workspaceMetric}</div><p className={styles.muted}>{s.workspaceSub}</p><div className={styles.miniGrid}>{s.mini.map(([a,b])=><div className={styles.mini} key={a}><small>{a.toUpperCase()}</small><strong>{b}</strong></div>)}</div></div>
          <div className={styles.side}><div className={styles.panelLabel}>CONNECTED AREAS</div><div className={styles.rows}>{s.rows.map(([a,b])=><div className={styles.row} key={a}><span>{a}</span><strong>{b}</strong></div>)}</div></div>
        </div>
      </section>
      <div className={styles.sectionTitle}><small>PLATFORM ARCHITECTURE</small><h2>Built as part of one<br/>connected ACE system.</h2></div>
      <section className={styles.featureGrid}>{s.features.map(([h,p])=><article className={styles.feature} key={h}><h3>{h}</h3><p>{p}</p></article>)}</section>
    </main>
    <footer className={styles.footer}><span>© 2026 ACE Exchange</span><span>Trade. Create. Connect.</span></footer>
  </div>;
}
