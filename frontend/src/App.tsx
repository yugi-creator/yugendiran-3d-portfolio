import styles from './App.module.css';
import { SkipToContent } from '@/components/common/SkipToContent/SkipToContent';
import { Header } from '@/components/layout/Header/Header';
import { Footer } from '@/components/layout/Footer/Footer';
import { Hero } from '@/components/sections/Hero/Hero';
import { About } from '@/components/sections/About/About';
import { Experience } from '@/components/sections/Experience/Experience';
import { Skills } from '@/components/sections/Skills/Skills';
import { Projects } from '@/components/sections/Projects/Projects';
import { Certifications } from '@/components/sections/Certifications/Certifications';
import { Contact } from '@/components/sections/Contact/Contact';

function App() {
  return (
    <div className={styles.app}>
      <SkipToContent />
      <Header />
      <main id="main-content" className={styles.main}>
        <Hero />
        <About />
        <Experience />
        <Skills />
        <Projects />
        <Certifications />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

export default App;
