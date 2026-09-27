export const metadata = {
  title: 'About',
  description: 'Learn more about our team and what we do.',
};

const team = [
  {
    name: 'Alex Morgan',
    role: 'Founder & Engineer',
    bio: 'Builds products end to end, from infrastructure to interface.',
    skills: ['Next.js', 'Node.js', 'PostgreSQL'],
    tags: ['leadership', 'engineering'],
  },
  {
    name: 'Jordan Lee',
    role: 'Design Lead',
    bio: 'Focused on accessible, human-centered interfaces.',
    skills: ['Design Systems', 'Figma', 'Accessibility'],
    tags: ['design'],
  },
  {
    name: 'Sam Rivera',
    role: 'Operations',
    bio: 'Keeps everything running smoothly behind the scenes.',
  },
];

const values = [
  {
    title: 'Craft',
    description: 'We sweat the details so the experience feels effortless.',
    tags: ['quality', 'consistency'],
  },
  {
    title: 'Clarity',
    description: 'Simple explanations beat clever ones.',
    tags: ['communication'],
  },
  {
    title: 'Care',
    description: 'We build for real people with real constraints.',
  },
];

function toList(value) {
  return Array.isArray(value) ? value : [];
}

export default function AboutPage() {
  return (
    <main className="about">
      <section className="about__intro">
        <h1>About Us</h1>
        <p>
          We are a small team building thoughtful software. Our goal is to make
          tools that feel fast, clear, and dependable.
        </p>
      </section>

      <section className="about__team">
        <h2>Team</h2>
        <ul>
          {team.map((member) => {
            const { skills = [], tags = [] } = member || {};
            return (
              <li key={member.name}>
                <h3>{member.name}</h3>
                <p className="role">{member.role}</p>
                <p>{member.bio}</p>
                <p className="skills">{toList(skills).join(', ')}</p>
                <p className="tags">{toList(tags).join(' \u00b7 ')}</p>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="about__values">
        <h2>Values</h2>
        <ul>
          {values.map((value) => {
            const { tags = [] } = value || {};
            return (
              <li key={value.title}>
                <h3>{value.title}</h3>
                <p>{value.description}</p>
                <p className="tags">{toList(tags).join(' \u00b7 ')}</p>
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}
