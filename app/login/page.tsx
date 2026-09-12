import PlatformShell from "../PlatformShell";
import AuthForm from "../AuthForm";
import ReviewerLoginForm from "../ReviewerLoginForm";
import { previewReviewerEnabled } from "../../lib/reviewer-session";
import styles from "../PlatformShell.module.css";

export default async function Login({ searchParams }: { searchParams: Promise<{ next?: string; reason?: string }> }) {
  const params = await searchParams;
  const next = params.next && params.next.startsWith("/") && !params.next.startsWith("//") ? params.next : undefined;
  const reviewer = previewReviewerEnabled();
  return <PlatformShell><main className={styles.main}><div className={styles.kicker}>ACE IDENTITY</div><section className={styles.hero}><div><h1>Sign<br/><span>In.</span></h1><p>{reviewer ? "Use Preview reviewer access to inspect protected User and Admin pages. Financial actions remain disabled." : "Authentication requests are forwarded only to a configured production identity provider. Protected account routes fail closed when production authentication is unavailable."}</p>{params.reason === "auth_not_configured" && <div className={styles.notice}>Production authentication is not configured yet. Public product pages remain available; private account areas stay locked.</div>}</div></section><section className={styles.section}>{reviewer ? <ReviewerLoginForm nextPath={next} /> : <AuthForm mode="login" nextPath={next}/>}<div style={{ marginTop: "18px" }}><a href="/forgot-password">Forgot password?</a></div></section></main></PlatformShell>;
}
