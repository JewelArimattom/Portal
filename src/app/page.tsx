import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Check, ChevronDown, CircleHelp, Clock3 } from 'lucide-react';
import { MarketingNav } from '@/components/landing/marketing-nav';
import { Footer } from '@/components/layout/footer';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'UniMatch | Compare university programme requirements',
  description:
    'Compare your academic record with published Bachelor’s and Master’s requirements at universities in Germany and Austria.',
};

const exampleRequirements = [
  {
    title: 'Degree level',
    record: 'Current academic degree',
    programme: 'Minimum degree level',
    status: 'Met',
    kind: 'met',
    Icon: Check,
  },
  {
    title: 'Subject credits',
    record: 'Semester-wise course list',
    programme: 'Subject credit minimums',
    status: 'Needs verification',
    kind: 'review',
    Icon: Clock3,
  },
  {
    title: 'Language evidence',
    record: 'Language test or waiver',
    programme: 'Accepted test and threshold',
    status: 'Add evidence',
    kind: 'pending',
    Icon: CircleHelp,
  },
];

const exampleProgrammes = [
  {
    university: 'Technical University of Munich',
    location: 'Munich · Germany',
    programme: 'M.Sc. Informatics (Computer Science)',
  },
  {
    university: 'University of Vienna',
    location: 'Vienna · Austria',
    programme: 'M.Sc. Computer Science',
  },
  {
    university: 'RWTH Aachen University',
    location: 'Aachen · Germany',
    programme: 'M.Sc. Data Science',
  },
];

const featuredUniversities = [
  {
    name: 'Freie Universität Berlin',
    location: 'Berlin · Germany',
    image: '/images/campus/photo-f140924-960.jpg',
    alt: 'The Rost- und Silberlaube building complex at Freie Universität Berlin.',
    search: 'Freie Universität Berlin',
    photoCredit: 'Photo: torinberl · CC BY-SA 3.0',
    photoUrl: 'https://commons.wikimedia.org/wiki/File:Freie_Universitaet_Berlin_-_Gebaeudekomplex_Rost-_und_Silberlaube.jpg',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/',
  },
  {
    name: 'RWTH Aachen University',
    location: 'Aachen · Germany',
    image: '/images/campus/rwth-aachen-main-building.jpg',
    alt: 'The sandstone main building of RWTH Aachen University.',
    search: 'RWTH Aachen',
    photoCredit: 'Photo: Aleph · CC BY-SA 2.5',
    photoUrl: 'https://commons.wikimedia.org/wiki/File:RWTH_Aachen_Hauptgeb%C3%A4ude.jpg',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/2.5/',
  },
  {
    name: 'University of Vienna',
    location: 'Vienna · Austria',
    image: '/images/campus/photo-f180545329-1280.jpg',
    alt: 'The historic main building of the University of Vienna.',
    search: 'University of Vienna',
    photoCredit: 'Photo: Ian Ehm · CC BY 4.0',
    photoUrl: 'https://commons.wikimedia.org/wiki/File:Universit%C3%A4t_Wien_Hauptgeb%C3%A4ude_(Ian_Ehm)_12.jpg',
    licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
  },
];

const faqs = [
  {
    question: 'How does UniMatch find programmes for me?',
    answer:
      'UniMatch compares the academic information in your profile with published programme requirements. You can see which checks are met, which need more evidence, and which still need verification.',
  },
  {
    question: 'Does a match guarantee that I will be admitted?',
    answer:
      'No. A match is an advisory comparison with the published information available in UniMatch. Each university makes the final admission decision and may request additional documents.',
  },
  {
    question: 'What if one of my requirements is not verified?',
    answer:
      'The result will show that the information needs verification instead of treating it as met or unmet. You can review the linked university source and confirm the requirement before applying.',
  },
  {
    question: 'Can I browse programmes before creating a profile?',
    answer:
      'Yes. Browse the catalogue by university, subject, degree level, and other available filters. Create a profile when you are ready to compare your own academic record.',
  },
];

export default function HomePage() {
  return (
    <div className={styles.page}>
      <a className={styles.skipLink} href="#main">Skip to content</a>

      <section className={styles.hero} aria-labelledby="hero-title">
        <Image
          className={styles.heroImage}
          src="/images/hero-oxford.jpg"
          alt="Historic Oxford college façade beneath an open sky."
          fill
          preload
          sizes="100vw"
        />
        <MarketingNav />

        <div className={styles.heroCopy}>
          <div className={styles.heroTitleBlock}>
            <h1 className={styles.heroTitle} id="hero-title">
              Course matches for international students.
            </h1>
            <p className={styles.heroRegion}>Bachelor’s and Master’s programmes · Germany &amp; Austria</p>
          </div>
          <div className={styles.heroAction}>
            <p>
              Compare Bachelor’s and Master’s programmes in Germany and Austria against your
              coursework, grades, language results, and documents.
            </p>
            <div className={styles.heroLinks}>
              <Link className={styles.buttonLight} href="/onboarding" data-primary-action>
                Start eligibility check <ArrowUpRight aria-hidden="true" />
              </Link>
              <Link className={styles.heroBrowse} href="/programmes">
                Browse programmes
              </Link>
            </div>
          </div>
        </div>
      </section>

      <main id="main">
        <section className={`${styles.section} ${styles.comparison}`} id="how-it-works" aria-labelledby="comparison-title">
          <div className={styles.sectionHeading}>
            <div>
              <h2 id="comparison-title">Compare the requirements behind every match.</h2>
            </div>
            <p>
              UniMatch checks your academic record against each programme’s published entry rules.
              Review what meets a requirement and what still needs evidence.
            </p>
          </div>

          <div className={styles.evaluation} data-ui>
            <div className={styles.evaluationTop}>
              <div>
                <p className={styles.panelTitle}>Requirement review</p>
                <p className={styles.panelSubtitle}>Illustrative example · synthetic student profile</p>
              </div>
              <span className={styles.panelStamp}>Germany &amp; Austria</span>
            </div>

            <div className={styles.tableHeader} aria-hidden="true">
              <span>Requirement</span>
              <span>Student record</span>
              <span>Programme rule</span>
              <span>Result</span>
            </div>
            <div className={styles.requirementRows} role="table" aria-label="Illustrative requirement comparison">
              {exampleRequirements.map(({ title, record, programme, status, kind, Icon }) => (
                <div className={styles.requirementRow} role="row" key={title}>
                  <div className={styles.requirementName} role="rowheader">{title}</div>
                  <div className={styles.requirementValue} role="cell" data-label="Student record">{record}</div>
                  <div className={styles.requirementValue} role="cell" data-label="Programme rule">{programme}</div>
                  <div className={styles.resultCell} role="cell" data-label="Result">
                    <span className={`${styles.result} ${styles[kind]}`}>
                      <Icon aria-hidden="true" />{status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.evaluationFoot}>
              <p>Each result explains the requirement and the information used to assess it.</p>
              <Link href="/onboarding" className={styles.textLink}>Add your academic record <ArrowUpRight aria-hidden="true" /></Link>
            </div>
            <div className={styles.sectionAction}>
              <Link className={styles.buttonNavy} href="/onboarding">
                Start eligibility check <ArrowUpRight aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.universities}`} id="universities" aria-labelledby="universities-title">
          <div className={styles.universityHeading}>
            <div>
              <h2 id="universities-title">Universities to explore.</h2>
            </div>
            <p>
              Start with a few distinctive campuses, then browse programmes across Germany and Austria.
            </p>
          </div>

          <div className={styles.universityGrid}>
            {featuredUniversities.map((university) => (
              <article className={styles.universityItem} key={university.name}>
                <Link
                  className={styles.universityImageLink}
                  href={`/programmes?search=${encodeURIComponent(university.search)}`}
                  aria-label={`Browse programmes at ${university.name}`}
                >
                  <Image
                    className={styles.universityImage}
                    src={university.image}
                    alt={university.alt}
                    fill
                    sizes="(max-width: 640px) 88vw, (max-width: 1000px) 48vw, 30vw"
                  />
                  <span className={styles.imageLinkLabel}>Explore programmes <ArrowUpRight aria-hidden="true" /></span>
                </Link>
                <div className={styles.universityMeta}>
                  <div>
                    <h3>{university.name}</h3>
                    <p>{university.location}</p>
                  </div>
                  <Link
                    className={styles.photoCredit}
                    href={university.photoUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${university.photoCredit}; view image source`}
                  >
                    {university.photoCredit}
                  </Link>
                  <span className={styles.licenseCredit}>Licensed under <Link href={university.licenseUrl} target="_blank" rel="noreferrer">Creative Commons</Link></span>
                </div>
              </article>
            ))}
          </div>

          <div className={styles.universityMore}>
            <p>Explore the full catalogue and find more universities through their programmes.</p>
            <Link className={styles.textLink} href="/programmes">View more <ArrowUpRight aria-hidden="true" /></Link>
          </div>
        </section>

        <section className={`${styles.section} ${styles.programmes}`} id="programmes" aria-labelledby="programmes-title">
          <div className={styles.programmeIntro}>
            <h2 id="programmes-title">Browse programmes. Compare the entry rules.</h2>
            <p>
              Search by university, subject, or degree level. These examples come from UniMatch’s
              demo catalogue.
            </p>
          </div>

          <div className={styles.programmeList} data-ui>
            {exampleProgrammes.map((item) => (
              <Link className={styles.programmeRow} href="/programmes" key={item.programme}>
                <span className={styles.programmeName}>{item.programme}</span>
                <span className={styles.programmeUniversity}>{item.university}</span>
                <span className={styles.programmeLocation}>{item.location}</span>
                <ArrowUpRight aria-hidden="true" className={styles.programmeArrow} />
              </Link>
            ))}
          </div>

          <div className={styles.coverageNote}>
            <span className={styles.noteMark} aria-hidden="true">i</span>
            <p>
              Detailed credit mapping currently includes Indian UGC/AICTE records. Other study
              systems may need manual verification.
            </p>
            <Link href="/programmes" className={styles.textLink}>View the catalogue <ArrowUpRight aria-hidden="true" /></Link>
          </div>
          <div className={styles.catalogueAction}>
            <Link className={styles.buttonNavy} href="/programmes">
              Browse all programmes <ArrowUpRight aria-hidden="true" />
            </Link>
          </div>
        </section>

        <section className={`${styles.section} ${styles.faq}`} id="faq" aria-labelledby="faq-title">
          <div className={styles.faqIntro}>
            <div className={styles.faqCopy}>
              <h2 id="faq-title">Frequently asked questions</h2>
              <p>A few quick answers about programme matching and what to expect.</p>
            </div>
            <figure className={styles.faqImage}>
              <Image
                src="/images/campus/photo-f483767-960.jpg"
                alt="A quiet university library gallery lined with tall bookshelves."
                fill
                sizes="(max-width: 760px) 100vw, 42vw"
              />
              <figcaption>
                <span>Photo: Dr. Marcus Gossler (assumed)</span>
                <Link href="https://commons.wikimedia.org/wiki/File:Library_gallery.jpg" target="_blank" rel="noreferrer">CC BY-SA 3.0 · Source</Link>
              </figcaption>
            </figure>
          </div>

          <div className={styles.faqList}>
            {faqs.map((faq, index) => (
              <details className={styles.faqItem} key={faq.question} open={index === 0}>
                <summary>
                  <span>{faq.question}</span>
                  <ChevronDown aria-hidden="true" />
                </summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        </main>

        <Footer variant="home" />
    </div>
  );
}
