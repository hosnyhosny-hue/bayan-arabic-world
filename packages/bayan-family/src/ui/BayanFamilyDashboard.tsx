"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { FamilyDashboardData } from "../types";

type Props = {
  endpoint?: string;
  pulseHref?: string;
  loginHref?: string;
};

const empty: FamilyDashboardData = {
  parent: { name: "ولي الأمر" },
  children: [],
  pulse: [],
  messages: [],
  events: [],
  achievements: [],
  stats: { unreadUpdates: 0, upcomingEvents: 0, pendingHomework: 0 },
};

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "صباح الخير";
  if (hour < 18) return "مساء الخير";
  return "مساء النور";
}

function dateLabel() {
  try {
    return new Intl.DateTimeFormat("ar-QA", {
      weekday: "long",
      day: "numeric",
      month: "long",
    }).format(new Date());
  } catch {
    return "اليوم";
  }
}

export function BayanFamilyDashboard({
  endpoint = "/api/bayan-family/dashboard",
  pulseHref = "/parents/pulse",
  loginHref = "/login",
}: Props) {
  const [data, setData] = useState<FamilyDashboardData>(empty);
  const [status, setStatus] = useState<"loading" | "ready" | "auth" | "error">("loading");

  useEffect(() => {
    let active = true;
    fetch(endpoint, { credentials: "include", cache: "no-store" })
      .then(async (response) => {
        if (response.status === 401) {
          if (active) setStatus("auth");
          return null;
        }
        if (!response.ok) throw new Error(`Dashboard request failed: ${response.status}`);
        return response.json();
      })
      .then((payload) => {
        if (!active || !payload) return;
        setData(payload.data ?? payload);
        setStatus("ready");
      })
      .catch(() => active && setStatus("error"));
    return () => {
      active = false;
    };
  }, [endpoint]);

  const firstName = useMemo(() => data.parent.name.split(" ")[0] || "ولي الأمر", [data.parent.name]);

  if (status === "loading") {
    return <DashboardShell><div className="bf-loading"><span /><strong>نُعِدّ بيتك الرقمي...</strong></div></DashboardShell>;
  }

  if (status === "auth") {
    return (
      <DashboardShell>
        <section className="bf-auth">
          <div className="bf-auth-mark">ب</div>
          <p className="bf-eyebrow">BAYAN FAMILY</p>
          <h1>مرحبًا بك في بيت العائلة الرقمي</h1>
          <p>سجّل الدخول لعرض تحديثات أبنائك، نبض المدرسة، الرسائل والفعاليات في مكان واحد.</p>
          <a href={loginHref}>تسجيل الدخول الآمن</a>
        </section>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="bf-layout" dir="rtl">
        <aside className="bf-sidebar">
          <a className="bf-brand" href="/parents" aria-label="BAYAN Family">
            <span>ب</span><div><b>BAYAN</b><small>FAMILY</small></div>
          </a>
          <nav>
            <a className="active" href="/parents"><i>⌂</i>الرئيسية</a>
            <a href={pulseHref}><i>◉</i>نبض بيان</a>
            <a href="#children"><i>♙</i>أبنائي</a>
            <a href="#learning"><i>▤</i>التعلم</a>
            <a href="#messages"><i>✉</i>الرسائل</a>
            <a href="#events"><i>◇</i>الفعاليات</a>
            <a href="#achievements"><i>★</i>الإنجازات</a>
          </nav>
          <div className="bf-side-card">
            <span>✦</span><b>مساعد بيان</b><small>إجابات ذكية حول رحلة أبنائك</small>
            <button type="button">اسأل بيان</button>
          </div>
        </aside>

        <main className="bf-main">
          <header className="bf-topbar">
            <div><span className="bf-date">{dateLabel()}</span></div>
            <div className="bf-top-actions">
              <button aria-label="الإشعارات">♢<em>{data.stats.unreadUpdates}</em></button>
              <div className="bf-avatar">{firstName.charAt(0)}</div>
            </div>
          </header>

          <section className="bf-hero">
            <div className="bf-hero-copy">
              <p>{greeting()}،</p>
              <h1>{firstName}</h1>
              <h2>كل ما يهم عائلتك، في مشهد واحد.</h2>
              <div className="bf-hero-actions">
                <a href={pulseHref}>استكشف نبض اليوم <span>←</span></a>
                <button type="button">عرض التقويم</button>
              </div>
            </div>
            <div className="bf-hero-orbit" aria-hidden="true">
              <div className="orbit one" /><div className="orbit two" />
              <div className="bf-orb-core"><span>ب</span><small>BAYAN FAMILY</small></div>
              <span className="spark s1">✦</span><span className="spark s2">✦</span>
            </div>
            <div className="bf-hero-stats">
              <div><strong>{data.stats.unreadUpdates}</strong><span>تحديثات جديدة</span></div>
              <div><strong>{data.stats.upcomingEvents}</strong><span>فعاليات قادمة</span></div>
              <div><strong>{data.stats.pendingHomework}</strong><span>مهام مستحقة</span></div>
            </div>
          </section>

          <section className="bf-section" id="children">
            <div className="bf-section-head"><div><p>العائلة أولًا</p><h2>أبنائي</h2></div><button>إدارة الملفات</button></div>
            <div className="bf-child-grid">
              {data.children.map((child) => (
                <article className="bf-child-card" key={child.id}>
                  <div className="bf-child-profile"><span>{child.initials ?? child.name.charAt(0)}</span><div><h3>{child.name}</h3><p>{child.yearGroup}</p></div><b>←</b></div>
                  <div className="bf-progress"><div><span>الحضور</span><strong>{child.attendance ?? 0}%</strong></div><div className="track"><i style={{ width: `${child.attendance ?? 0}%` }} /></div></div>
                  <div className="bf-child-metrics">
                    <div><small>الواجبات</small><strong>{child.homeworkDue ?? 0}</strong></div>
                    <div><small>الرسائل</small><strong>{child.unreadMessages ?? 0}</strong></div>
                    <div><small>الإنجازات</small><strong>{child.achievementCount ?? 0}</strong></div>
                  </div>
                  <footer><span className="dot" />{child.progressLabel ?? "متابعة مستمرة"}</footer>
                </article>
              ))}
              <article className="bf-child-card bf-add-child"><div>＋</div><h3>ربط طالب آخر</h3><p>أضف ملفًا جديدًا إلى لوحة العائلة</p></article>
            </div>
          </section>

          <div className="bf-content-grid">
            <section className="bf-section bf-pulse" id="learning">
              <div className="bf-section-head"><div><p>من مجتمعنا</p><h2>نبض بيان</h2></div><a href={pulseHref}>عرض الكل ←</a></div>
              {data.pulse.length ? (
                <div className="bf-feed">
                  {data.pulse.slice(0, 3).map((item, index) => (
                    <article className={index === 0 ? "featured" : ""} key={item.id}>
                      {item.imageUrl ? <img src={item.imageUrl} alt="" /> : <div className="bf-feed-art">{item.type === "achievement" ? "★" : "ب"}</div>}
                      <div><span>{item.authorName ?? "مجتمع بيان"}</span><h3>{item.title}</h3><p>{item.excerpt}</p><small>{item.publishedAt ? new Date(item.publishedAt).toLocaleDateString("ar-QA") : "اليوم"}</small></div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="bf-empty"><span>◉</span><h3>نبضك يبدأ من هنا</h3><p>ستظهر أخبار المدرسة والإنجازات والقصص المنشورة هنا فور اعتمادها.</p><a href={pulseHref}>فتح نبض بيان</a></div>
              )}
            </section>

            <aside className="bf-rail">
              <section className="bf-mini" id="events"><div className="bf-mini-head"><h3>الفعاليات القادمة</h3><a href="#">الكل</a></div>{data.events.length ? data.events.slice(0,3).map(event => <div className="bf-event" key={event.id}><time>{event.date}</time><div><b>{event.title}</b><small>{event.time ?? event.location}</small></div></div>) : <div className="bf-soft-empty">لا توجد فعاليات قريبة الآن</div>}</section>
              <section className="bf-mini" id="messages"><div className="bf-mini-head"><h3>الرسائل</h3><a href="#">فتح</a></div>{data.messages.length ? data.messages.slice(0,3).map(message => <div className="bf-message" key={message.id}><span>{message.sender.charAt(0)}</span><div><b>{message.sender}</b><small>{message.subject}</small></div>{message.unread && <i />}</div>) : <div className="bf-soft-empty">صندوقك هادئ — لا رسائل جديدة</div>}</section>
              <section className="bf-mini bf-achievement" id="achievements"><span>★</span><div><small>آخر الإنجازات</small><h3>{data.achievements[0]?.title ?? "الإنجاز القادم ينتظر أن يُكتب"}</h3><p>{data.achievements[0]?.description ?? "ستظهر هنا شهادات وتكريمات أبنائك."}</p></div></section>
            </aside>
          </div>
        </main>
      </div>
    </DashboardShell>
  );
}

function DashboardShell({ children }: { children: ReactNode }) {
  return <><style>{styles}</style><div className="bf-root">{children}</div></>;
}

const styles = String.raw`
:root{--bf-green:#0d5c46;--bf-green2:#073d31;--bf-orange:#ff8a1f;--bf-ink:#14251f;--bf-muted:#6f7e78;--bf-bg:#f5f7f5;--bf-card:#fff;--bf-line:#e4e9e6}
*{box-sizing:border-box}.bf-root{min-height:100vh;background:var(--bf-bg);color:var(--bf-ink);font-family:Arial,"Noto Sans Arabic",sans-serif}.bf-root a{text-decoration:none;color:inherit}.bf-layout{min-height:100vh;display:grid;grid-template-columns:260px 1fr}.bf-sidebar{background:linear-gradient(180deg,#073f32,#0b5642);padding:28px 22px;color:white;display:flex;flex-direction:column;position:sticky;top:0;height:100vh}.bf-brand{display:flex;align-items:center;gap:12px;margin-bottom:42px}.bf-brand>span{width:46px;height:46px;border-radius:15px;background:var(--bf-orange);display:grid;place-items:center;font-size:28px;font-family:serif}.bf-brand div{display:flex;flex-direction:column;letter-spacing:2px}.bf-brand small{opacity:.65;font-size:10px}.bf-sidebar nav{display:grid;gap:7px}.bf-sidebar nav a{padding:13px 15px;border-radius:13px;display:flex;align-items:center;gap:12px;color:#dcebe5;font-size:14px}.bf-sidebar nav a i{font-style:normal;width:22px;text-align:center;font-size:18px}.bf-sidebar nav a:hover,.bf-sidebar nav .active{background:rgba(255,255,255,.12);color:white}.bf-sidebar nav .active:before{content:"";width:3px;height:22px;border-radius:4px;background:var(--bf-orange);position:absolute;right:0}.bf-side-card{margin-top:auto;background:rgba(255,255,255,.09);border:1px solid rgba(255,255,255,.12);border-radius:20px;padding:18px;display:grid;gap:8px}.bf-side-card>span{color:#ffb266;font-size:24px}.bf-side-card small{color:#c5dbd3;line-height:1.6}.bf-side-card button{border:0;border-radius:12px;padding:10px;background:white;color:var(--bf-green2);font-weight:700;cursor:pointer}.bf-main{min-width:0;padding:0 34px 50px}.bf-topbar{height:78px;display:flex;align-items:center;justify-content:space-between}.bf-date{color:var(--bf-muted);font-size:13px}.bf-top-actions{display:flex;align-items:center;gap:12px}.bf-top-actions button{width:40px;height:40px;border:1px solid var(--bf-line);background:white;border-radius:12px;position:relative}.bf-top-actions em{position:absolute;top:-5px;left:-4px;background:var(--bf-orange);color:white;border-radius:10px;font-size:10px;padding:2px 5px;font-style:normal}.bf-avatar{width:42px;height:42px;background:#dfece7;color:var(--bf-green);border-radius:14px;display:grid;place-items:center;font-weight:800}.bf-hero{min-height:315px;border-radius:30px;overflow:hidden;padding:46px 48px;position:relative;background:radial-gradient(circle at 80% 20%,rgba(255,255,255,.18),transparent 28%),linear-gradient(125deg,#0b4939,#0d6a4f);color:white;display:grid;grid-template-columns:1.1fr .7fr;align-items:center;box-shadow:0 20px 55px rgba(9,78,58,.16)}.bf-hero:after{content:"";position:absolute;inset:auto -80px -120px auto;width:400px;height:400px;border-radius:50%;border:70px solid rgba(255,255,255,.04)}.bf-hero-copy{position:relative;z-index:2}.bf-hero-copy>p{color:#bbd9ce;margin:0 0 3px}.bf-hero h1{font-size:50px;line-height:1;margin:0 0 14px}.bf-hero h2{font-size:20px;font-weight:500;margin:0;color:#d8e9e2}.bf-hero-actions{display:flex;gap:12px;margin-top:30px}.bf-hero-actions a,.bf-hero-actions button{padding:12px 18px;border-radius:13px;font-weight:700;font-size:13px}.bf-hero-actions a{background:var(--bf-orange);color:white}.bf-hero-actions button{border:1px solid rgba(255,255,255,.28);color:white;background:rgba(255,255,255,.07)}.bf-hero-orbit{height:200px;position:relative;display:grid;place-items:center}.bf-orb-core{width:118px;height:118px;border-radius:37px;background:linear-gradient(145deg,#fff,#eaf5f1);color:var(--bf-green);display:grid;place-items:center;align-content:center;box-shadow:0 22px 55px rgba(0,0,0,.18);transform:rotate(-4deg);position:relative;z-index:2}.bf-orb-core span{font-size:54px;font-family:serif;line-height:1}.bf-orb-core small{font-size:7px;letter-spacing:1px}.orbit{position:absolute;border:1px solid rgba(255,255,255,.2);border-radius:50%}.orbit.one{width:180px;height:180px}.orbit.two{width:250px;height:130px;transform:rotate(25deg)}.spark{position:absolute;color:#ffc27d}.s1{top:5px;right:18%}.s2{bottom:14px;left:14%}.bf-hero-stats{position:absolute;left:34px;bottom:27px;display:flex;gap:8px;z-index:3}.bf-hero-stats div{background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.13);border-radius:13px;padding:9px 13px;display:flex;gap:8px;align-items:center}.bf-hero-stats strong{font-size:18px}.bf-hero-stats span{font-size:10px;color:#c8ddd5}.bf-section{margin-top:32px}.bf-section-head{display:flex;justify-content:space-between;align-items:end;margin-bottom:16px}.bf-section-head p{margin:0;color:var(--bf-orange);font-weight:800;font-size:11px;letter-spacing:.5px}.bf-section-head h2{margin:4px 0 0;font-size:24px}.bf-section-head button,.bf-section-head>a{border:0;background:transparent;color:var(--bf-green);font-weight:700;font-size:12px}.bf-child-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}.bf-child-card{background:white;border:1px solid var(--bf-line);border-radius:22px;padding:20px;box-shadow:0 8px 25px rgba(18,45,35,.035)}.bf-child-profile{display:flex;align-items:center;gap:12px}.bf-child-profile>span{width:48px;height:48px;border-radius:16px;background:#e2f0eb;color:var(--bf-green);display:grid;place-items:center;font-size:20px;font-weight:800}.bf-child-profile div{flex:1}.bf-child-profile h3{margin:0;font-size:16px}.bf-child-profile p{margin:4px 0 0;color:var(--bf-muted);font-size:11px}.bf-child-profile>b{color:#93a19c}.bf-progress{margin:22px 0 14px}.bf-progress>div:first-child{display:flex;justify-content:space-between;font-size:11px}.bf-progress strong{color:var(--bf-green)}.track{height:6px;background:#edf1ef;border-radius:8px;margin-top:8px;overflow:hidden}.track i{display:block;height:100%;background:linear-gradient(90deg,var(--bf-green),#38a47e);border-radius:8px}.bf-child-metrics{display:grid;grid-template-columns:repeat(3,1fr);border-top:1px solid var(--bf-line);border-bottom:1px solid var(--bf-line);padding:12px 0}.bf-child-metrics div{text-align:center;border-left:1px solid var(--bf-line)}.bf-child-metrics div:last-child{border:0}.bf-child-metrics small{display:block;color:var(--bf-muted);font-size:9px;margin-bottom:4px}.bf-child-metrics strong{font-size:16px}.bf-child-card footer{padding-top:12px;color:var(--bf-muted);font-size:10px}.dot{display:inline-block;width:7px;height:7px;background:#31aa77;border-radius:50%;margin-left:6px}.bf-add-child{display:grid;place-items:center;align-content:center;text-align:center;border-style:dashed;background:transparent;min-height:230px}.bf-add-child div{width:48px;height:48px;border-radius:17px;background:white;border:1px solid var(--bf-line);display:grid;place-items:center;color:var(--bf-green);font-size:24px}.bf-add-child h3{font-size:14px;margin:12px 0 4px}.bf-add-child p{color:var(--bf-muted);font-size:10px;margin:0}.bf-content-grid{display:grid;grid-template-columns:minmax(0,1.6fr) minmax(280px,.7fr);gap:22px}.bf-pulse{min-width:0}.bf-feed{display:grid;grid-template-columns:1.25fr .75fr;gap:13px}.bf-feed article{background:white;border:1px solid var(--bf-line);border-radius:20px;overflow:hidden;display:grid;grid-template-columns:110px 1fr;min-height:150px}.bf-feed article.featured{grid-row:span 2;display:block}.bf-feed img,.bf-feed-art{width:100%;height:100%;object-fit:cover;min-height:140px}.bf-feed-art{background:linear-gradient(145deg,#dbece5,#f4f0e8);display:grid;place-items:center;color:var(--bf-green);font-size:40px}.bf-feed .featured img,.bf-feed .featured .bf-feed-art{height:220px}.bf-feed article>div:last-child{padding:15px}.bf-feed article span{font-size:9px;color:var(--bf-orange);font-weight:800}.bf-feed h3{font-size:14px;margin:7px 0}.bf-feed p{font-size:10px;color:var(--bf-muted);line-height:1.7;margin:0}.bf-feed small{display:block;margin-top:10px;color:#9ba7a2;font-size:9px}.bf-rail{margin-top:32px;display:grid;gap:14px;align-content:start}.bf-mini{background:white;border:1px solid var(--bf-line);border-radius:20px;padding:18px}.bf-mini-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:13px}.bf-mini-head h3{font-size:14px;margin:0}.bf-mini-head a{font-size:10px;color:var(--bf-green)}.bf-event,.bf-message{display:flex;align-items:center;gap:11px;padding:10px 0;border-top:1px solid var(--bf-line)}.bf-event time{width:45px;height:45px;border-radius:13px;background:#f0f5f2;color:var(--bf-green);display:grid;place-items:center;font-size:9px;text-align:center}.bf-event div,.bf-message div{flex:1}.bf-event b,.bf-message b{font-size:11px;display:block}.bf-event small,.bf-message small{font-size:9px;color:var(--bf-muted)}.bf-message>span{width:35px;height:35px;border-radius:12px;background:#e6efeB;display:grid;place-items:center;color:var(--bf-green);font-weight:800}.bf-message>i{width:7px;height:7px;border-radius:50%;background:var(--bf-orange)}.bf-achievement{background:linear-gradient(135deg,#fff8ee,#fff);display:flex;gap:14px}.bf-achievement>span{width:42px;height:42px;border-radius:14px;background:#ffe5c5;color:var(--bf-orange);display:grid;place-items:center;font-size:20px}.bf-achievement small{font-size:9px;color:var(--bf-orange)}.bf-achievement h3{font-size:13px;margin:5px 0}.bf-achievement p{font-size:9px;color:var(--bf-muted);margin:0}.bf-empty,.bf-soft-empty{text-align:center;color:var(--bf-muted)}.bf-empty{background:white;border:1px solid var(--bf-line);border-radius:22px;padding:55px 20px}.bf-empty>span{font-size:36px;color:var(--bf-green)}.bf-empty h3{color:var(--bf-ink)}.bf-empty p{font-size:12px}.bf-empty a{display:inline-block;margin-top:10px;background:var(--bf-green);color:white;padding:10px 16px;border-radius:12px;font-size:11px;font-weight:700}.bf-soft-empty{font-size:10px;padding:17px 5px}.bf-loading,.bf-auth{min-height:100vh;display:grid;place-items:center;align-content:center;gap:15px;text-align:center;padding:30px}.bf-loading span{width:42px;height:42px;border:3px solid #dbe8e3;border-top-color:var(--bf-green);border-radius:50%;animation:bfspin .8s linear infinite}.bf-auth-mark{width:78px;height:78px;border-radius:25px;background:var(--bf-green);color:white;display:grid;place-items:center;font-size:45px;font-family:serif;box-shadow:0 18px 40px rgba(13,92,70,.2)}.bf-eyebrow{color:var(--bf-orange);font-size:11px;font-weight:900;letter-spacing:2px}.bf-auth h1{font-size:32px;margin:0}.bf-auth>p:not(.bf-eyebrow){max-width:520px;color:var(--bf-muted);line-height:1.8}.bf-auth a{background:var(--bf-green);color:white;padding:13px 22px;border-radius:14px;font-weight:700}@keyframes bfspin{to{transform:rotate(360deg)}}
@media(max-width:1100px){.bf-layout{grid-template-columns:86px 1fr}.bf-sidebar{padding:25px 14px}.bf-brand div,.bf-sidebar nav a:not(.active){font-size:0}.bf-sidebar nav a{justify-content:center}.bf-sidebar nav a i{font-size:19px}.bf-side-card{display:none}.bf-child-grid{grid-template-columns:repeat(2,1fr)}.bf-content-grid{grid-template-columns:1fr}.bf-rail{grid-template-columns:repeat(3,1fr)}}
@media(max-width:760px){.bf-layout{display:block}.bf-sidebar{position:fixed;z-index:20;bottom:0;top:auto;width:100%;height:auto;padding:8px 10px}.bf-brand,.bf-side-card{display:none}.bf-sidebar nav{display:flex;justify-content:space-around}.bf-sidebar nav a{padding:8px;font-size:0!important}.bf-sidebar nav a i{font-size:20px}.bf-main{padding:0 14px 95px}.bf-topbar{height:64px}.bf-hero{padding:28px 22px;grid-template-columns:1fr;min-height:390px}.bf-hero h1{font-size:39px}.bf-hero-orbit{position:absolute;left:-15px;top:70px;opacity:.45;transform:scale(.75)}.bf-hero-stats{right:18px;left:18px;overflow:auto}.bf-hero-stats div{min-width:max-content}.bf-child-grid,.bf-feed,.bf-rail{grid-template-columns:1fr}.bf-feed article.featured{grid-row:auto}.bf-content-grid{display:block}.bf-rail{display:grid}.bf-child-card{min-height:auto}.bf-add-child{min-height:150px}}
`;
