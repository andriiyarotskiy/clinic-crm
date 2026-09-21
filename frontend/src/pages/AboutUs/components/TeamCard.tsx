import type { TeamMember } from "@/types/teamMembers";
import { FaLinkedinIn } from "react-icons/fa";

export const TeamCard = ({ member }: { member: TeamMember }) => {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
  src={member.photo}
  alt={member.name}
  className="h-12 w-12 rounded-full object-cover"
/>

          <div>
            <h3 className="text-[15px] font-semibold text-gray-900">
              {member.name}
            </h3>

            <p className="mt-1 text-sm text-blue-600">{member.role}</p>
          </div>
        </div>

        <a
          href={member.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${member.name} LinkedIn`}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
        >
          <FaLinkedinIn size={16} />
        </a>
      </div>

      <div className="mt-5 border-t border-gray-100 pt-4">
        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-400">
          Role on the project
        </p>

        <p className="text-sm leading-6 text-gray-600">{member.description}</p>
      </div>
    </div>
  );
};
