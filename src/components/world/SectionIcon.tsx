import {
  BookOpenText,
  CalendarDays,
  FileText,
  GraduationCap,
  Images,
  Library,
  Medal,
  Newspaper,
  School,
  Sparkles,
  Users,
  Video,
} from "lucide-react";

import type { IconName } from "../../data/world";

const iconMap = {
  book: BookOpenText,
  graduation: GraduationCap,
  school: School,
  users: Users,
  medal: Medal,
  calendar: CalendarDays,
  images: Images,
  newspaper: Newspaper,
  library: Library,
  sparkles: Sparkles,
  file: FileText,
  video: Video,
};

export default function SectionIcon({
  name,
  className,
}: {
  name: IconName;
  className?: string;
}) {
  const Icon = iconMap[name];

  return <Icon className={className} />;
}
