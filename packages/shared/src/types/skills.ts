export interface Skill {
  name: string;
  level: number;
}

export interface SkillCategory {
  id: string;
  name: string;
  icon: string;
  skills: Skill[];
}
