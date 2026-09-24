

import { teamMembers } from "./components/teamMembers";
import { TeamCard } from "./components/TeamCard";




const sections = [
  {
    title: "Project Management",
    members: teamMembers.slice(0, 2),
  },
  {
    title: "Design & Quality Assurance",
    members: teamMembers.slice(2, 4),
  },
  {
    title: "Development & Frontend ",
    members: teamMembers.slice(4, 6),
  },
  {
    title: "Data & Infrastructure",
    members: teamMembers.slice(6, 8),
  },
 
];



export const AboutUs = () => {
  return (
    <div className="min-h-full bg-gray-50 px-6 py-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium text-blue-600">
            Our Team
          </p>

          <h1 className="text-2xl font-semibold text-gray-900">
            About Us
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
            Meet the team behind the CRM project. Each member contributed
            their expertise to building and delivering the product.
          </p>
        </div>

        {/* Team sections */}
        <div className="space-y-8">
          {sections.map((section) => (
            <section key={section.title}>
              <div className="mb-4 flex items-center gap-3">
                <h2 className="text-sm font-semibold text-gray-900">
                  {section.title}
                </h2>

                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500">
                  {section.members.length}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {section.members.map((member) => (
                  <TeamCard
                    key={`${member.name}-${member.role}`}
                    member={member}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
};

