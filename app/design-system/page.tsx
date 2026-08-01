import {
  BayanBadge,
  BayanButton,
  BayanCard,
  BayanSectionHeader,
  bayanTokens,
} from "@/packages/bayan-design-system/src";
import styles from "./showcase.module.css";

export default function DesignSystemPage() {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.hero}>
          <BayanBadge tone="accent">BAYAN DESIGN SYSTEM 1.0</BayanBadge>
          <h1>لغة تصميم واحدة لكل تجربة بيان.</h1>
          <p>مرجع حي للألوان، الخطوط، المسافات، الارتفاعات، الحركة والزوايا.</p>
        </header>

        <section>
          <BayanSectionHeader eyebrow="COLOR ROLES" title="الألوان الدلالية" description="استخدم الدور، لا القيمة الخام، حتى تبقى الهوية قابلة للتطوير." />
          <div className={styles.colorGrid}>
            {[
              ["Brand", bayanTokens.color.brand.emerald],
              ["Brand Deep", bayanTokens.color.brand.emeraldDeep],
              ["Accent", bayanTokens.color.brand.orange],
              ["Success", bayanTokens.color.semantic.success],
              ["Warning", bayanTokens.color.semantic.warning],
              ["Danger", bayanTokens.color.semantic.danger],
              ["Info", bayanTokens.color.semantic.info],
              ["Live", bayanTokens.color.semantic.live],
            ].map(([name,color]) => (
              <article key={name}><i style={{background:String(color)}}/><strong>{name}</strong><code>{color}</code></article>
            ))}
          </div>
        </section>

        <section>
          <BayanSectionHeader eyebrow="TYPOGRAPHY" title="مقياس الطباعة" description="تدرج واضح من العنوان السينمائي حتى النص المصغر." />
          <div className={styles.typeScale}>
            <h2>عنوان عرض رئيسي</h2>
            <h3>عنوان قسم رئيسي</h3>
            <h4>عنوان بطاقة أو قصة</h4>
            <p>نص القراءة الأساسي مصمم ليكون واضحًا ومريحًا في الواجهات العربية.</p>
            <small>تعليق صغير أو بيانات وصفية</small>
          </div>
        </section>

        <section>
          <BayanSectionHeader eyebrow="COMPONENTS" title="المكونات الأساسية" />
          <div className={styles.componentRow}>
            <BayanButton>زر رئيسي</BayanButton>
            <BayanButton variant="secondary">زر ثانوي</BayanButton>
            <BayanButton variant="ghost">زر هادئ</BayanButton>
            <BayanBadge>Brand</BayanBadge>
            <BayanBadge tone="success">Success</BayanBadge>
            <BayanBadge tone="warning">Warning</BayanBadge>
          </div>
          <div className={styles.cardGrid}>
            <BayanCard elevated><BayanBadge tone="brand">STORY</BayanBadge><h3>بطاقة بيان</h3><p>سطح موحد، مسافة داخلية متزنة، وظل من المستوى الثالث.</p></BayanCard>
            <BayanCard><BayanBadge tone="accent">EVENT</BayanBadge><h3>فعالية اليوم</h3><p>نفس النظام يعمل عبر النبض والإنجازات وتجربة العائلة.</p></BayanCard>
          </div>
        </section>

        <section>
          <BayanSectionHeader eyebrow="FOUNDATIONS" title="المسافات والزوايا والارتفاعات" />
          <div className={styles.foundationGrid}>
            {["8px","12px","16px","24px","32px","48px"].map((value) => <div key={value}><i style={{width:value,height:value}}/><span>{value}</span></div>)}
          </div>
          <div className={styles.radiusGrid}>
            {["xs","sm","md","lg","xl","2xl"].map((item,index) => <div key={item} style={{borderRadius:[8,12,16,20,28,36][index]}}>{item}</div>)}
          </div>
          <div className={styles.elevationGrid}>
            {[1,2,3,4,5].map((level)=><article key={level}>Elevation {level}</article>)}
          </div>
        </section>
      </div>
    </main>
  );
}
