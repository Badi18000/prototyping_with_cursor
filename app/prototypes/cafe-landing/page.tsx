"use client";

import Link from "next/link";
import styles from "./styles.module.css";

export default function CafeLanding() {
  return (
    <div className={styles.page}>
      {/* Back to prototypes */}
      <Link href="/" className={styles.backLink}>
        ← Retour
      </Link>

      {/* Hero section */}
      <header className={styles.hero}>
        <span className={styles.heroLabel}>Bienvenue</span>
        <h1 className={styles.heroTitle}>Le Café du Coin</h1>
        <p className={styles.heroSubtitle}>
          Torréfaction artisanale · Pâtisseries maison · Ambiance chaleureuse
        </p>
        <a href="#reserver" className={styles.ctaButton}>
          Réserver une table
        </a>
      </header>

      {/* Menu highlights */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Nos spécialités</h2>
        <div className={styles.menuGrid}>
          <div className={styles.menuCard}>
            <span className={styles.menuIcon}>☕</span>
            <h3>Café filtre</h3>
            <p>Origine Éthiopie, notes fruitées</p>
          </div>
          <div className={styles.menuCard}>
            <span className={styles.menuIcon}>🥐</span>
            <h3>Viennoiseries</h3>
            <p>Faites maison chaque matin</p>
          </div>
          <div className={styles.menuCard}>
            <span className={styles.menuIcon}>🍰</span>
            <h3>Pâtisseries</h3>
            <p>Tarte du jour & gâteaux</p>
          </div>
        </div>
      </section>

      {/* Location & Hours */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Nous trouver</h2>
        <div className={styles.infoCard}>
          <div className={styles.infoBlock}>
            <h4>Adresse</h4>
            <p>12 rue de la Paix<br />75002 Paris</p>
          </div>
          <div className={styles.infoBlock}>
            <h4>Horaires</h4>
            <p>Lun–Ven 8h–19h<br />Sam–Dim 9h–20h</p>
          </div>
        </div>
      </section>

      {/* CTA / Reservation */}
      <section className={styles.ctaSection} id="reserver">
        <h2 className={styles.ctaTitle}>Une pause café ?</h2>
        <p className={styles.ctaText}>
          Réservez votre table ou commandez à emporter.
        </p>
        <div className={styles.ctaButtons}>
          <a href="#" className={styles.ctaPrimary}>
            Réserver
          </a>
          <a href="tel:+33123456789" className={styles.ctaSecondary}>
            Nous appeler
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>Le Café du Coin · Depuis 2015</p>
      </footer>
    </div>
  );
}
