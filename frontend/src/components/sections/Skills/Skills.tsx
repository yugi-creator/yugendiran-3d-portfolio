import { useState } from 'react';
import { SectionWrapper } from '@/components/common/SectionWrapper/SectionWrapper';
import { skillIconMap } from '@/components/common/Icon/iconMap';
import skillsData from '@/data/skills.json';
import type { SkillCategory } from '@portfolio/shared';
import styles from './Skills.module.css';

const categories = skillsData as SkillCategory[];

function getProficiencyTier(level: number): string {
  if (level >= 85) return 'Advanced';
  if (level >= 75) return 'Proficient';
  return 'Competent';
}

export function Skills() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const visibleCategories =
    selectedCategory === 'All' ? categories : categories.filter((c) => c.name === selectedCategory);

  return (
    <SectionWrapper
      id="skills"
      title="Skills"
      subtitle="Technologies and disciplines I specialize in"
    >
      {/* Category Filter Tabs */}
      <div className={styles.filters} role="tablist" aria-label="Skill categories">
        <button
          type="button"
          role="tab"
          aria-selected={selectedCategory === 'All'}
          className={`${styles.filterBtn} ${selectedCategory === 'All' ? styles.active : ''}`}
          onClick={() => setSelectedCategory('All')}
        >
          All Disciplines
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            role="tab"
            aria-selected={selectedCategory === category.name}
            className={`${styles.filterBtn} ${selectedCategory === category.name ? styles.active : ''}`}
            onClick={() => setSelectedCategory(category.name)}
          >
            {category.name}
          </button>
        ))}
      </div>

      <div className={styles.grid}>
        {visibleCategories.map((category) => {
          const IconComponent = skillIconMap[category.icon];
          return (
            <article key={category.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.iconWrapper}>
                  {IconComponent && <IconComponent size={24} />}
                </div>
                <h3 className={styles.categoryName}>{category.name}</h3>
              </div>

              <div className={styles.skills}>
                {category.skills.map((skill) => {
                  const tier = getProficiencyTier(skill.level);
                  return (
                    <div key={skill.name} className={styles.skill}>
                      <div className={styles.skillInfo}>
                        <span className={styles.skillName}>{skill.name}</span>
                        <div className={styles.metaGroup}>
                          <span className={styles.tierBadge}>{tier}</span>
                          <span className={styles.skillLevel}>{skill.level}%</span>
                        </div>
                      </div>
                      <div
                        className={styles.bar}
                        role="progressbar"
                        aria-valuenow={skill.level}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${skill.name} proficiency: ${skill.level}% (${tier})`}
                      >
                        <div className={styles.barFill} style={{ width: `${skill.level}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </article>
          );
        })}
      </div>
    </SectionWrapper>
  );
}
