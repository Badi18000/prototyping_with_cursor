import Link from "next/link";
import styles from './styles/home.module.css';
import { instrumentSans } from './fonts';

export default function Home() {
  // Add your prototypes to this array
  const prototypes = [
    {
      title: 'Getting started',
      description: 'How to create a prototype',
      path: '/prototypes/example'
    },
    {
      title: 'Confetti button',
      description: 'An interactive button that creates a colorful confetti explosion',
      path: '/prototypes/confetti-button'
    },
    // Add your new prototypes here like this:
    // {
    //   title: 'Your new prototype',
    //   description: 'A short description of what this prototype does',
    //   path: '/prototypes/my-new-prototype'
    // },
  ];

  return (
    <div className={`${styles.container} ${instrumentSans.className}`}>
      {/* Butterflies in the background */}
      <img
        src="/playground/butterfly-flutter.webp"
        className={styles.butterfly1}
        alt=""
        aria-hidden="true"
      />
      <img
        src="/playground/butterfly-flutter.webp"
        className={styles.butterfly2}
        alt=""
        aria-hidden="true"
      />
      <img
        src="/playground/butterfly-flutter.webp"
        className={styles.butterfly3}
        alt=""
        aria-hidden="true"
      />
      <header className={styles.header}>
        <h1>Oubadi Momo's prototypes</h1>
        <div className={styles.subtitle}>
          ・｡☆ Exploring the digital frontier ☆｡・
        </div>
      </header>

      <main>
        <section className={styles.grid}>
          {/* Goes through the prototypes list (array) to create cards */}
          {prototypes.map((prototype, index) => (
            <Link 
              key={index}
              href={prototype.path} 
              className={styles.card}
            >
              <h3>{prototype.title}</h3>
              <p>{prototype.description}</p>
            </Link>
          ))}
        </section>
      </main>
    </div>
  );
}
