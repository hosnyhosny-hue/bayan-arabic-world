# BAYAN Learning Knowledge Graph

طبقة العلاقات التعليمية في BAYAN Arabic World.

## الهدف

تحويل عناصر BAYAN من مجموعات JSON منفصلة إلى رسم معرفي مترابط:

- Node: عنصر معرفي أو تعليمي.
- Edge: علاقة موجهة بين عنصرين.
- Registry: سجل موحد للعقد والعلاقات.
- Index: فهارس للاستعلام السريع.
- Validator: فحص سلامة الرسم المعرفي.
- Query Engine: استعلام محلي عن العقد والمسارات والعلاقات.

## المبدأ الأساسي

ملفات المحتوى الأصلية تظل المصدر الأساسي للحقيقة.

لا يعدّل Graph Builder ملفات المحتوى، وإنما يقرأ الفهرس الموحد ثم يولد:

- graph/generated/nodes/nodes.json
- graph/generated/edges/edges.json
- graph/generated/indexes/graph-index.json
- graph/generated/graph.json

## أنواع العلاقات في الحزمة الأولى

- BELONGS_TO_LEVEL
- ALIGNS_WITH_SKILL
- USES_VOCABULARY
- PRACTICES_GRAMMAR
- ASSESSED_BY
- PRACTICED_IN
- RELATED_TO_TOPIC
- SAME_LEVEL_AS
- NEXT_LEVEL
- PREVIOUS_LEVEL
- PREREQUISITE_OF
- HAS_PREREQUISITE
- PART_OF
- CONTAINS

الحزمة الأولى تنشئ العلاقات المؤكدة فقط.
العلاقات الدلالية المتقدمة تُضاف في الحزمة الثانية.
