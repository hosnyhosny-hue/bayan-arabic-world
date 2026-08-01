"use client";
import Link from "next/link";

import {
  useDeferredValue,
  useMemo,
  useState,
} from "react";

import type {
  GraphEdge,
  GraphExperiencePayload,
  GraphNode,
  GraphRelation,
} from "../lib/graph-types";

import styles from "../arabic-b.module.css";

type ViewMode =
  | "journey"
  | "knowledge"
  | "missions";

type NodeFilter =
  | "all"
  | "vocabulary"
  | "dialogue"
  | "grammar"
  | "skill"
  | "assessment"
  | "culture";

const NODE_TYPES: Array<{
  id: NodeFilter;
  ar: string;
  en: string;
  icon: string;
}> = [
  { id: "all", ar: "الكل", en: "All", icon: "✦" },
  {
    id: "vocabulary",
    ar: "المفردات",
    en: "Vocabulary",
    icon: "أ",
  },
  {
    id: "dialogue",
    ar: "الحوار",
    en: "Dialogue",
    icon: "◌",
  },
  {
    id: "grammar",
    ar: "القواعد",
    en: "Grammar",
    icon: "ق",
  },
  {
    id: "skill",
    ar: "المهارات",
    en: "Skills",
    icon: "◎",
  },
  {
    id: "assessment",
    ar: "التقييم",
    en: "Assessment",
    icon: "✓",
  },
  {
    id: "culture",
    ar: "الثقافة",
    en: "Culture",
    icon: "◇",
  },
];

const TYPE_LABELS: Record<
  string,
  { ar: string; en: string; icon: string }
> = {
  "framework-level": {
    ar: "مستوى",
    en: "Level",
    icon: "◈",
  },
  vocabulary: {
    ar: "مفردة",
    en: "Vocabulary",
    icon: "أ",
  },
  dialogue: {
    ar: "حوار",
    en: "Dialogue",
    icon: "◌",
  },
  grammar: {
    ar: "قاعدة",
    en: "Grammar",
    icon: "ق",
  },
  skill: {
    ar: "مهارة",
    en: "Skill",
    icon: "◎",
  },
  assessment: {
    ar: "تقييم",
    en: "Assessment",
    icon: "✓",
  },
  culture: {
    ar: "ثقافة",
    en: "Culture",
    icon: "◇",
  },
  topic: {
    ar: "موضوع",
    en: "Topic",
    icon: "#",
  },
};

const EDGE_LABELS: Record<
  string,
  { ar: string; en: string }
> = {
  BELONGS_TO_LEVEL: {
    ar: "ينتمي إلى المستوى",
    en: "Belongs to level",
  },
  NEXT_LEVEL: {
    ar: "المستوى التالي",
    en: "Next level",
  },
  PREVIOUS_LEVEL: {
    ar: "المستوى السابق",
    en: "Previous level",
  },
  PREREQUISITE_OF: {
    ar: "متطلب سابق",
    en: "Prerequisite",
  },
  HAS_PREREQUISITE: {
    ar: "يعتمد على",
    en: "Requires",
  },
  USES_VOCABULARY: {
    ar: "يستخدم المفردة",
    en: "Uses vocabulary",
  },
  USED_IN: {
    ar: "تُستخدم في",
    en: "Used in",
  },
  PRACTICES_GRAMMAR: {
    ar: "يدرّب على القاعدة",
    en: "Practises grammar",
  },
  PRACTICED_IN: {
    ar: "تُمارس في",
    en: "Practised in",
  },
  ALIGNS_WITH_SKILL: {
    ar: "يطوّر المهارة",
    en: "Develops skill",
  },
  DEVELOPED_BY: {
    ar: "تتطور بواسطة",
    en: "Developed by",
  },
  ASSESSED_BY: {
    ar: "يُقاس بواسطة",
    en: "Assessed by",
  },
  ASSESSES: {
    ar: "يقيس",
    en: "Assesses",
  },
  RELATED_TO_TOPIC: {
    ar: "مرتبط بموضوع",
    en: "Related topic",
  },
};

function normalizeArabic(value = "") {
  return value
    .normalize("NFKC")
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/gu, "")
    .replace(/\u0640/gu, "")
    .replace(/[أإآٱ]/gu, "ا")
    .replace(/ؤ/gu, "و")
    .replace(/ئ/gu, "ي")
    .replace(/ى/gu, "ي")
    .replace(/ة/gu, "ه")
    .replace(/[^\p{L}\p{N}\s:_-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function nodeSearchScore(node: GraphNode, query: string) {
  const normalizedQuery = normalizeArabic(query);

  if (!normalizedQuery) {
    return 0;
  }

  const label = normalizeArabic(node.label);
  const labelEn = normalizeArabic(node.labelEn ?? "");
  const searchText =
    node.normalizedSearchText ??
    normalizeArabic(node.searchableText ?? "");

  if (label === normalizedQuery) {
    return 100;
  }

  if (label.startsWith(normalizedQuery)) {
    return 90;
  }

  if (label.includes(normalizedQuery)) {
    return 80;
  }

  if (labelEn.includes(normalizedQuery)) {
    return 75;
  }

  if (searchText.includes(normalizedQuery)) {
    return 65;
  }

  return 0;
}

function getNodeType(node: GraphNode) {
  return (
    TYPE_LABELS[node.type] ?? {
      ar: node.type,
      en: node.type,
      icon: "•",
    }
  );
}

function confidencePercent(edge: GraphEdge) {
  return Math.round(
    (edge.confidence ?? edge.weight ?? 0) * 100,
  );
}

export default function ArabicBKnowledgeExperience({
  payload,
}: {
  payload: GraphExperiencePayload;
}) {
  const [language, setLanguage] = useState<"ar" | "en">("ar");
  const [viewMode, setViewMode] =
    useState<ViewMode>("journey");
  const [filter, setFilter] =
    useState<NodeFilter>("all");
  const [query, setQuery] = useState("");
  const [selectedNodeId, setSelectedNodeId] =
    useState<string | null>(
      payload.featuredNodeIds[0] ??
        payload.dailyMission.nodeId,
    );

  const deferredQuery = useDeferredValue(query);
  const isArabic = language === "ar";

  const nodesById = useMemo(
    () =>
      new Map(
        payload.nodes.map((node) => [
          node.graphId,
          node,
        ]),
      ),
    [payload.nodes],
  );

  const relationsByNode = useMemo(() => {
    const relationMap = new Map<
      string,
      GraphRelation[]
    >();

    for (const edge of payload.edges) {
      const sourceNode = nodesById.get(edge.from);
      const targetNode = nodesById.get(edge.to);

      if (sourceNode && targetNode) {
        relationMap.set(edge.from, [
          ...(relationMap.get(edge.from) ?? []),
          {
            edge,
            node: targetNode,
            direction: "outgoing",
          },
        ]);

        relationMap.set(edge.to, [
          ...(relationMap.get(edge.to) ?? []),
          {
            edge,
            node: sourceNode,
            direction: "incoming",
          },
        ]);
      }
    }

    return relationMap;
  }, [nodesById, payload.edges]);

  const selectedNode =
    (selectedNodeId &&
      nodesById.get(selectedNodeId)) ||
    null;

  const selectedRelations = useMemo(
    () =>
      selectedNode
        ? [...(relationsByNode.get(
            selectedNode.graphId,
          ) ?? [])].sort(
            (left, right) =>
              confidencePercent(right.edge) -
              confidencePercent(left.edge),
          )
        : [],
    [relationsByNode, selectedNode],
  );

  const searchableNodes = useMemo(
    () =>
      payload.nodes.filter(
        (node) =>
          node.type !== "topic" &&
          node.type !== "framework-level",
      ),
    [payload.nodes],
  );

  const visibleNodes = useMemo(() => {
    const filtered = searchableNodes.filter(
      (node) =>
        filter === "all" ||
        node.type === filter,
    );

    if (!deferredQuery.trim()) {
      return filtered.slice(0, 12);
    }

    return filtered
      .map((node) => ({
        node,
        score: nodeSearchScore(
          node,
          deferredQuery,
        ),
      }))
      .filter(({ score }) => score > 0)
      .sort(
        (left, right) =>
          right.score - left.score,
      )
      .slice(0, 16)
      .map(({ node }) => node);
  }, [
    deferredQuery,
    filter,
    searchableNodes,
  ]);

  const featuredNodes = payload.featuredNodeIds
    .map((nodeId) => nodesById.get(nodeId))
    .filter(
      (node): node is GraphNode =>
        Boolean(node),
    );

  const currentLevel =
    payload.levels.find(
      (level) => level.isCurrent,
    ) ?? payload.levels[0];

  function openNode(nodeId: string) {
    setSelectedNodeId(nodeId);
  }

  function renderNodeCard(node: GraphNode) {
    const type = getNodeType(node);
    const relationCount =
      relationsByNode.get(node.graphId)?.length ?? 0;

    return (
      <button
        className={styles.nodeCard}
        key={node.graphId}
        onClick={() => openNode(node.graphId)}
        type="button"
      >
        <span className={styles.nodeCardIcon}>
          {type.icon}
        </span>

        <span className={styles.nodeCardContent}>
          <span className={styles.nodeCardMeta}>
            <span>
              {isArabic ? type.ar : type.en}
            </span>
            {node.level && (
              <strong>{node.level}</strong>
            )}
          </span>

          <strong className={styles.nodeCardTitle}>
            {isArabic
              ? node.label
              : node.labelEn ?? node.label}
          </strong>

          <span className={styles.nodeCardFooter}>
            <span>
              {relationCount}{" "}
              {isArabic
                ? "علاقة تعليمية"
                : "learning links"}
            </span>
            <span aria-hidden="true">←</span>
          </span>
        </span>
      </button>
    );
  }

  return (
    <main
      className={styles.page}
      dir={isArabic ? "rtl" : "ltr"}
    >
      <div className={styles.ambientOne} />
      <div className={styles.ambientTwo} />

      <header className={styles.topbar}>
        <Link
          className={styles.brand}
          href="/"
          aria-label="BAYAN Arabic World"
        >
          <span className={styles.brandMark}>
            ض
          </span>
          <span>
            <strong>BAYAN Arabic B</strong>
            <small>
              Arabic for Global Learners
            </small>
          </span>
        </Link>

        <nav
          className={styles.viewTabs}
          aria-label="Learning views"
        >
          <button
            className={
              viewMode === "journey"
                ? styles.activeViewTab
                : ""
            }
            onClick={() =>
              setViewMode("journey")
            }
            type="button"
          >
            {isArabic
              ? "رحلتي"
              : "My journey"}
          </button>

          <button
            className={
              viewMode === "knowledge"
                ? styles.activeViewTab
                : ""
            }
            onClick={() =>
              setViewMode("knowledge")
            }
            type="button"
          >
            {isArabic
              ? "خريطة المعرفة"
              : "Knowledge map"}
          </button>

          <button
            className={
              viewMode === "missions"
                ? styles.activeViewTab
                : ""
            }
            onClick={() =>
              setViewMode("missions")
            }
            type="button"
          >
            {isArabic
              ? "المهمات"
              : "Missions"}
          </button>
        </nav>

        <div className={styles.topbarActions}>
          <button
            className={styles.languageButton}
            onClick={() =>
              setLanguage(
                isArabic ? "en" : "ar",
              )
            }
            type="button"
          >
            {isArabic ? "EN" : "العربية"}
          </button>

          <div className={styles.streak}>
            <span>🔥</span>
            <strong>7</strong>
          </div>

          <div className={styles.avatar}>
            M
          </div>
        </div>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.eyebrow}>
            <span className={styles.liveDot} />
            {isArabic
              ? "تجربة يقودها محرك BAYAN المعرفي"
              : "Powered by the BAYAN Knowledge Graph"}
          </div>

          <h1>
            {isArabic ? (
              <>
                تعلّم العربية من خلال
                <span> رحلات حقيقية مترابطة</span>
              </>
            ) : (
              <>
                Learn Arabic through
                <span> connected real-life journeys</span>
              </>
            )}
          </h1>

          <p>
            {isArabic
              ? "المفردات والقواعد والحوارات والمهارات والتقييمات تعمل الآن كمسار تعلم واحد يتكيّف مع تقدمك."
              : "Vocabulary, grammar, dialogues, skills and assessments now work as one adaptive learning journey."}
          </p>

          <div className={styles.heroActions}>
            <button
              className={styles.primaryButton}
              onClick={() => {
                if (
                  payload.dailyMission.nodeId
                ) {
                  openNode(
                    payload.dailyMission.nodeId,
                  );
                }
              }}
              type="button"
            >
              <span>
                {isArabic
                  ? "أكمل التعلم"
                  : "Continue learning"}
              </span>
              <span aria-hidden="true">←</span>
            </button>

            <button
              className={styles.secondaryButton}
              onClick={() =>
                setViewMode("knowledge")
              }
              type="button"
            >
              {isArabic
                ? "استكشف الخريطة"
                : "Explore the map"}
            </button>
          </div>
        </div>

        <div className={styles.heroDashboard}>
          <div className={styles.progressRing}>
            <div>
              <strong>
                {currentLevel.progress}%
              </strong>
              <span>
                {isArabic
                  ? "تقدم المستوى"
                  : "Level progress"}
              </span>
            </div>
          </div>

          <div className={styles.heroLevel}>
            <span>
              {isArabic
                ? "مستواك الحالي"
                : "Current level"}
            </span>
            <strong>{currentLevel.id}</strong>
            <small>
              {isArabic
                ? currentLevel.titleAr
                : currentLevel.titleEn}
            </small>
          </div>

          <div className={styles.heroStats}>
            <div>
              <strong>
                {
                  payload.statistics
                    .nodesByType.vocabulary
                }
              </strong>
              <span>
                {isArabic
                  ? "مفردة"
                  : "Words"}
              </span>
            </div>
            <div>
              <strong>
                {
                  payload.statistics
                    .nodesByType.dialogue
                }
              </strong>
              <span>
                {isArabic
                  ? "حوارات"
                  : "Dialogues"}
              </span>
            </div>
            <div>
              <strong>
                {payload.statistics.edgeCount}
              </strong>
              <span>
                {isArabic
                  ? "رابط ذكي"
                  : "Smart links"}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.dashboardGrid}>
        <article className={styles.missionCard}>
          <div className={styles.cardHeading}>
            <div>
              <span className={styles.sectionLabel}>
                {isArabic
                  ? "مهمة اليوم"
                  : "Today's mission"}
              </span>
              <h2>
                {isArabic
                  ? payload.dailyMission.titleAr
                  : payload.dailyMission.titleEn}
              </h2>
            </div>

            <span className={styles.xpBadge}>
              +{payload.dailyMission.rewardXp} XP
            </span>
          </div>

          <p>
            {isArabic
              ? payload.dailyMission.descriptionAr
              : payload.dailyMission.descriptionEn}
          </p>

          <div className={styles.missionMeta}>
            <span>
              ◷{" "}
              {payload.dailyMission.durationMinutes}{" "}
              {isArabic ? "دقائق" : "min"}
            </span>
            <span>
              ◉{" "}
              {isArabic
                ? "استماع · نطق · تطبيق"
                : "Listen · Speak · Apply"}
            </span>
          </div>

          <button
            className={styles.missionButton}
            onClick={() => {
              if (
                payload.dailyMission.nodeId
              ) {
                openNode(
                  payload.dailyMission.nodeId,
                );
              }
            }}
            type="button"
          >
            {isArabic
              ? "ابدأ المهمة"
              : "Start mission"}
            <span aria-hidden="true">←</span>
          </button>
        </article>

        <article className={styles.continueCard}>
          <div className={styles.cardHeading}>
            <div>
              <span className={styles.sectionLabel}>
                {isArabic
                  ? "استكمل من حيث توقفت"
                  : "Continue where you left off"}
              </span>
              <h2>
                {isArabic
                  ? "رحلة المقهى"
                  : "The café journey"}
              </h2>
            </div>

            <span className={styles.lessonBadge}>
              A1
            </span>
          </div>

          <div className={styles.lessonPath}>
            {[
              {
                icon: "أ",
                ar: "المفردات",
                en: "Vocabulary",
                done: true,
              },
              {
                icon: "◌",
                ar: "الحوار",
                en: "Dialogue",
                done: true,
              },
              {
                icon: "ق",
                ar: "القواعد",
                en: "Grammar",
                done: false,
              },
              {
                icon: "✓",
                ar: "التقييم",
                en: "Assessment",
                done: false,
              },
            ].map((step) => (
              <div
                className={styles.lessonStep}
                key={step.en}
              >
                <span
                  className={
                    step.done
                      ? styles.completedStep
                      : styles.pendingStep
                  }
                >
                  {step.done ? "✓" : step.icon}
                </span>
                <small>
                  {isArabic
                    ? step.ar
                    : step.en}
                </small>
              </div>
            ))}
          </div>

          <div className={styles.lessonProgress}>
            <span>
              {isArabic
                ? "اكتمل 2 من 4"
                : "2 of 4 completed"}
            </span>
            <strong>50%</strong>
          </div>

          <div className={styles.progressTrack}>
            <span style={{ width: "50%" }} />
          </div>
        </article>
      </section>

      <section className={styles.levelSection}>
        <div className={styles.sectionHeader}>
          <div>
            <span className={styles.sectionLabel}>
              {isArabic
                ? "رحلة CEFR"
                : "CEFR journey"}
            </span>
            <h2>
              {isArabic
                ? "مسارك من أول كلمة إلى الطلاقة"
                : "Your path from first words to fluency"}
            </h2>
          </div>

          <p>
            {isArabic
              ? "كل مستوى متصل بالمفردات والمهارات والتقييمات المطلوبة للانتقال إلى المستوى التالي."
              : "Every level connects the knowledge and skills needed for the next stage."}
          </p>
        </div>

        <div className={styles.levelJourney}>
          {payload.levels.map(
            (level, index) => (
              <button
                className={[
                  styles.levelCard,
                  level.isCurrent
                    ? styles.currentLevelCard
                    : "",
                  level.isLocked
                    ? styles.lockedLevelCard
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                key={level.id}
                onClick={() => {
                  const levelNode =
                    payload.nodes.find(
                      (node) =>
                        node.type ===
                          "framework-level" &&
                        node.level === level.id,
                    );

                  if (levelNode) {
                    openNode(levelNode.graphId);
                  }
                }}
                type="button"
              >
                <div className={styles.levelTop}>
                  <strong>{level.id}</strong>
                  <span>
                    {level.isLocked
                      ? "🔒"
                      : level.progress === 100
                        ? "✓"
                        : `${level.progress}%`}
                  </span>
                </div>

                <h3>
                  {isArabic
                    ? level.titleAr
                    : level.titleEn}
                </h3>

                <p>
                  {isArabic
                    ? level.descriptionAr
                    : level.descriptionEn}
                </p>

                <div
                  className={styles.levelProgress}
                >
                  <span
                    style={{
                      width: `${level.progress}%`,
                    }}
                  />
                </div>

                <small>
                  {level.nodeCount}{" "}
                  {isArabic
                    ? "عنصرًا معرفيًا"
                    : "knowledge items"}
                </small>

                {index <
                  payload.levels.length - 1 && (
                  <span
                    className={styles.levelConnector}
                    aria-hidden="true"
                  >
                    ←
                  </span>
                )}
              </button>
            ),
          )}
        </div>
      </section>

      <section className={styles.knowledgeSection}>
        <div className={styles.sectionHeader}>
          <div>
            <span className={styles.sectionLabel}>
              {isArabic
                ? "محرك المعرفة"
                : "Knowledge engine"}
            </span>
            <h2>
              {isArabic
                ? "ابحث عن أي كلمة واكتشف رحلتها"
                : "Search any word and discover its journey"}
            </h2>
          </div>

          <div className={styles.graphHealth}>
            <span className={styles.healthDot} />
            <span>
              {payload.statistics.nodeCount}{" "}
              {isArabic ? "عقدة" : "nodes"} ·{" "}
              {payload.statistics.edgeCount}{" "}
              {isArabic
                ? "علاقة"
                : "relations"}{" "}
              · 0{" "}
              {isArabic
                ? "عقد يتيمة"
                : "orphans"}
            </span>
          </div>
        </div>

        <div className={styles.searchPanel}>
          <div className={styles.searchBox}>
            <span aria-hidden="true">⌕</span>
            <input
              aria-label={
                isArabic
                  ? "البحث في المعرفة"
                  : "Search knowledge"
              }
              onChange={(event) =>
                setQuery(event.target.value)
              }
              placeholder={
                isArabic
                  ? "جرّب: أريد، المقهى، التحية..."
                  : "Try: I want, café, greeting..."
              }
              type="search"
              value={query}
            />
            {query && (
              <button
                aria-label={
                  isArabic
                    ? "مسح البحث"
                    : "Clear search"
                }
                onClick={() => setQuery("")}
                type="button"
              >
                ×
              </button>
            )}
          </div>

          <div className={styles.filterTabs}>
            {NODE_TYPES.map((type) => (
              <button
                className={
                  filter === type.id
                    ? styles.activeFilter
                    : ""
                }
                key={type.id}
                onClick={() =>
                  setFilter(type.id)
                }
                type="button"
              >
                <span>{type.icon}</span>
                {isArabic ? type.ar : type.en}
              </button>
            ))}
          </div>
        </div>

        {query && visibleNodes.length === 0 ? (
          <div className={styles.emptySearch}>
            <strong>
              {isArabic
                ? "لم نجد نتيجة مطابقة"
                : "No matching result"}
            </strong>
            <p>
              {isArabic
                ? "جرّب كلمة أخرى أو استخدم صيغة مختلفة."
                : "Try another word or a different form."}
            </p>
          </div>
        ) : (
          <div className={styles.nodeGrid}>
            {(query
              ? visibleNodes
              : featuredNodes.length > 0
                ? [
                    ...featuredNodes,
                    ...visibleNodes.filter(
                      (node) =>
                        !featuredNodes.some(
                          (featured) =>
                            featured.graphId ===
                            node.graphId,
                        ),
                    ),
                  ].slice(0, 12)
                : visibleNodes
            ).map(renderNodeCard)}
          </div>
        )}
      </section>

      <section className={styles.insightStrip}>
        <div>
          <span>◈</span>
          <strong>
            {isArabic
              ? "BAYAN يفهم ما تتعلمه، وليس فقط ما فتحته."
              : "BAYAN understands what you learn, not only what you open."}
          </strong>
        </div>

        <p>
          {isArabic
            ? "كل اختيار يفتح مفرداته وقواعده ومهاراته وتقييماته المرتبطة."
            : "Every selection reveals its connected vocabulary, grammar, skills and assessments."}
        </p>
      </section>

      {selectedNode && (
        <div
          className={styles.drawerBackdrop}
          onClick={() =>
            setSelectedNodeId(null)
          }
          role="presentation"
        >
          <aside
            aria-label={
              isArabic
                ? "تفاصيل عنصر المعرفة"
                : "Knowledge item details"
            }
            className={styles.nodeDrawer}
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <button
              aria-label={
                isArabic ? "إغلاق" : "Close"
              }
              className={styles.drawerClose}
              onClick={() =>
                setSelectedNodeId(null)
              }
              type="button"
            >
              ×
            </button>

            <div className={styles.drawerHero}>
              <span
                className={styles.drawerTypeIcon}
              >
                {getNodeType(selectedNode).icon}
              </span>

              <div>
                <div className={styles.drawerMeta}>
                  <span>
                    {isArabic
                      ? getNodeType(selectedNode).ar
                      : getNodeType(selectedNode).en}
                  </span>

                  {selectedNode.level && (
                    <strong>
                      {selectedNode.level}
                    </strong>
                  )}
                </div>

                <h2>{selectedNode.label}</h2>

                {selectedNode.labelEn && (
                  <p>{selectedNode.labelEn}</p>
                )}
              </div>
            </div>

            {selectedNode.topics &&
              selectedNode.topics.length >
                0 && (
                <div className={styles.topicTags}>
                  {selectedNode.topics
                    .slice(0, 6)
                    .map((topic) => (
                      <span key={topic}>
                        #{topic}
                      </span>
                    ))}
                </div>
              )}

            <div className={styles.practiceActions}>
              <button type="button">
                <span>🔊</span>
                {isArabic
                  ? "استمع"
                  : "Listen"}
              </button>
              <button type="button">
                <span>🎙</span>
                {isArabic
                  ? "انطق"
                  : "Speak"}
              </button>
              <button type="button">
                <span>✎</span>
                {isArabic
                  ? "تدرّب"
                  : "Practice"}
              </button>
            </div>

            <div className={styles.relationsHeader}>
              <div>
                <span className={styles.sectionLabel}>
                  {isArabic
                    ? "خريطة العلاقات"
                    : "Relationship map"}
                </span>
                <h3>
                  {selectedRelations.length}{" "}
                  {isArabic
                    ? "رابطًا تعليميًا"
                    : "learning connections"}
                </h3>
              </div>
            </div>

            <div className={styles.relationList}>
              {selectedRelations
                .slice(0, 14)
                .map((relation) => {
                  const edgeLabel =
                    EDGE_LABELS[
                      relation.edge.type
                    ] ?? {
                      ar: relation.edge.type,
                      en: relation.edge.type,
                    };

                  const relatedType =
                    getNodeType(relation.node);

                  return (
                    <button
                      className={
                        styles.relationCard
                      }
                      key={`${relation.edge.id}-${relation.direction}`}
                      onClick={() =>
                        openNode(
                          relation.node.graphId,
                        )
                      }
                      type="button"
                    >
                      <span
                        className={
                          styles.relationIcon
                        }
                      >
                        {relatedType.icon}
                      </span>

                      <span
                        className={
                          styles.relationContent
                        }
                      >
                        <small>
                          {isArabic
                            ? edgeLabel.ar
                            : edgeLabel.en}
                        </small>
                        <strong>
                          {isArabic
                            ? relation.node.label
                            : relation.node
                                .labelEn ??
                              relation.node.label}
                        </strong>
                      </span>

                      <span
                        className={
                          styles.confidenceBadge
                        }
                      >
                        {confidencePercent(
                          relation.edge,
                        )}
                        %
                      </span>
                    </button>
                  );
                })}
            </div>

            {selectedRelations.length === 0 && (
              <div className={styles.emptyRelations}>
                {isArabic
                  ? "لا توجد علاقات إضافية لهذا العنصر."
                  : "No additional relations for this item."}
              </div>
            )}

            <button
              className={styles.startLearningButton}
              type="button"
            >
              {isArabic
                ? "ابدأ رحلة هذا العنصر"
                : "Start this learning journey"}
              <span aria-hidden="true">←</span>
            </button>
          </aside>
        </div>
      )}

      <footer className={styles.footer}>
        <div>
          <strong>BAYAN Arabic World</strong>
          <span>
            {isArabic
              ? "تعلم عربي عالمي مدعوم بمحرك معرفة مترابط"
              : "Global Arabic learning powered by connected knowledge"}
          </span>
        </div>

        <div>
          Graph v{payload.version} ·{" "}
          {payload.statistics.nodeCount} nodes ·{" "}
          {payload.statistics.edgeCount} edges
        </div>
      </footer>
    </main>
  );
}
