import Link from "next/link";
import styles from './styles/home.module.css';

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
    {
      title: 'Café landing page',
      description: 'Landing page prototype for a café — hero, menu, location, reservation CTA',
      path: '/prototypes/cafe-landing'
    },
    {
      title: 'Digital piano',
      description: 'Minimalist luxury digital piano inspired by macOS — play 2 octaves with Web Audio',
      path: '/prototypes/digital-piano'
    },
    {
      title: 'Typography experiments',
      description: 'CSS-only type treatments — circular text, 3D skew, wavy animation with Instrument Serif & Imperial Script',
      path: '/prototypes/typography-experiments'
    },
    {
      title: 'Noted OS',
      description: 'Windows-inspired note-taking app — draggable windows, taskbar, Start Menu, rich text, drawing canvas, and 4 themes (Fluent, Aero, XP, Classic)',
      path: '/prototypes/noted-os'
    },
    {
      title: 'Book Shelf',
      description: 'Notion-powered reading list gallery — connects to your Notion database to display books with cover, genre, rating, and review',
      path: '/prototypes/book-shelf'
    },
    // Add your new prototypes here like this:
    // {
    //   title: 'Your new prototype',
    //   description: 'A short description of what this prototype does',
    //   path: '/prototypes/my-new-prototype'
    // },
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Oubadi Designer</h1>
        <div className={styles.subtitle}>
          Prototypes & experiments
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