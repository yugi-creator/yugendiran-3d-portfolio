import { useState, useMemo } from 'react';
import { SectionWrapper } from '@/components/common/SectionWrapper/SectionWrapper';
import { ExternalLinkIcon, GitHubIcon, CodeIcon } from '@/components/common/Icon/Icon';
import { Button } from '@/components/common/Button/Button';
import { ProjectModal } from './ProjectModal';
import projectsData from '@/data/projects.json';
import profileData from '@/data/profile.json';
import type { Project } from '@portfolio/shared';
import styles from './Projects.module.css';

const projects = projectsData as Project[];

export function Projects() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  // Extract unique categories when projects exist
  const categories = useMemo(() => {
    if (projects.length === 0) return [];
    const cats = new Set(projects.map((p) => p.category).filter(Boolean));
    return ['All', ...Array.from(cats)];
  }, []);

  const filteredProjects = useMemo(() => {
    if (selectedCategory === 'All') return projects;
    return projects.filter((p) => p.category === selectedCategory);
  }, [selectedCategory]);

  const githubUrl = profileData.socialLinks.find((s) => s.platform === 'github')?.url;

  return (
    <SectionWrapper id="projects" title="Projects" subtitle="Systems and solutions I've engineered">
      {projects.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIconWrapper}>
            <CodeIcon size={36} />
          </div>
          <h3 className={styles.emptyTitle}>Projects in Development</h3>
          <p className={styles.emptyText}>
            Production case studies and AI-driven applications are currently being prepared for
            deployment. In the meantime, explore code repositories and contributions on GitHub.
          </p>
          {githubUrl && (
            <div className={styles.emptyAction}>
              <Button
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                variant="secondary"
              >
                <GitHubIcon size={18} />
                Explore GitHub Profile
              </Button>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Category filter tabs only rendered when multiple categories exist */}
          {categories.length > 2 && (
            <div className={styles.filters} role="tablist" aria-label="Project categories">
              {categories.map((cat) => (
                <button
                  key={cat}
                  role="tab"
                  aria-selected={selectedCategory === cat}
                  type="button"
                  className={`${styles.filterBtn} ${selectedCategory === cat ? styles.active : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          <div className={styles.grid}>
            {filteredProjects.map((project) => (
              <article key={project.id} className={styles.card}>
                <div className={styles.cardBody}>
                  <div className={styles.headerRow}>
                    <h3 className={styles.projectTitle}>{project.title}</h3>
                    {project.featured && <span className={styles.featuredBadge}>Featured</span>}
                  </div>
                  <p className={styles.projectDesc}>{project.description}</p>
                  <div className={styles.tags}>
                    {project.technologies.map((tech) => (
                      <span key={tech} className={styles.tag}>
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div className={styles.cardFooter}>
                  <div className={styles.links}>
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.link}
                        aria-label={`${project.title} source code`}
                      >
                        <GitHubIcon size={16} />
                        Code
                      </a>
                    )}
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.link}
                        aria-label={`${project.title} live demo`}
                      >
                        <ExternalLinkIcon size={16} />
                        Live Demo
                      </a>
                    )}
                  </div>
                  <button
                    type="button"
                    className={styles.detailsBtn}
                    onClick={() => setActiveProject(project)}
                    aria-label={`View case study for ${project.title}`}
                  >
                    View Details →
                  </button>
                </div>
              </article>
            ))}
          </div>
        </>
      )}

      {/* Accessible Project Details Modal */}
      <ProjectModal project={activeProject} onClose={() => setActiveProject(null)} />
    </SectionWrapper>
  );
}
