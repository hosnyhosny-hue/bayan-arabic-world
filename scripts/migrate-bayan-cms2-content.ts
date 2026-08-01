import { adminDb } from "../src/lib/firebase-admin";
import {
  BAYAN_CONTENT_COLLECTION,
  type BayanContentType,
  normalizeContentRecord,
} from "../src/lib/cms2/content-model";

interface MigrationSource {
  collection: string;
  type: BayanContentType;
}

const sources: MigrationSource[] = [
  {
    collection: "cms_news",
    type: "news",
  },
  {
    collection: "cms_events",
    type: "event",
  },
  {
    collection: "cms_magazines",
    type: "article",
  },
  {
    collection: "cms_resources",
    type: "resource",
  },
  {
    collection: "cms_students",
    type: "student-work",
  },
];

async function migrateSource(
  source: MigrationSource,
) {
  const snapshot = await adminDb
    .collection(source.collection)
    .get();

  console.log(
    `\n${source.collection}: ${snapshot.size} records`,
  );

  if (snapshot.empty) {
    return {
      migrated: 0,
      skipped: 0,
    };
  }

  let migrated = 0;
  let skipped = 0;

  for (
    let index = 0;
    index < snapshot.docs.length;
    index += 400
  ) {
    const chunk = snapshot.docs.slice(
      index,
      index + 400,
    );

    const batch = adminDb.batch();

    for (const document of chunk) {
      const targetRef = adminDb
        .collection(
          BAYAN_CONTENT_COLLECTION,
        )
        .doc(document.id);

      const targetSnapshot =
        await targetRef.get();

      if (
        targetSnapshot.exists &&
        !targetSnapshot.data()
          ?.legacyCollection
      ) {
        console.warn(
          `Skipping ${document.id}: target ID already belongs to native Pulse content`,
        );

        skipped += 1;
        continue;
      }

      batch.set(
        targetRef,
        normalizeContentRecord(
          document.data(),
          {
            id: document.id,
            type: source.type,
            legacyCollection:
              source.collection,
            includeCreatedAt: true,
          },
        ),
        { merge: true },
      );

      migrated += 1;
    }

    await batch.commit();
  }

  return {
    migrated,
    skipped,
  };
}

async function main() {
  console.log(
    "Starting BAYAN CMS 2.0 content migration...",
  );

  let migratedTotal = 0;
  let skippedTotal = 0;

  for (const source of sources) {
    try {
      const result =
        await migrateSource(source);

      migratedTotal += result.migrated;
      skippedTotal += result.skipped;
    } catch (error) {
      console.error(
        `Migration failed for ${source.collection}`,
        error,
      );

      process.exitCode = 1;
      return;
    }
  }

  console.log("\nMigration completed.");
  console.log(
    `Migrated: ${migratedTotal}`,
  );
  console.log(
    `Skipped: ${skippedTotal}`,
  );
}

main()
  .then(() => process.exit(process.exitCode || 0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
