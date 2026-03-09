import type { Feature, FAQItem, NewsItem, TimelineEvent } from "../types/home";

export const FEATURES: Feature[] = [
  {
    id: 1,
    icon: "group",
    title: "Structured Collaboration",
    description:
      "Form teams, assign roles, and work in shared digital workspaces tailored for efficient communication.",
  },
  {
    id: 2,
    icon: "rocket_launch",
    title: "Milestone Tracking",
    description:
      "Stay ahead of deadlines with a visual roadmap of project stages and automated submission reminders.",
  },
  {
    id: 3,
    icon: "comment_bank",
    title: "Centralized Feedback",
    description:
      "Receive timely, contextual feedback from instructors directly on your deliverables to ensure high-quality output.",
  },
];

export const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    id: 1,
    step: "01",
    title: "Registration",
    status: "ACTIVE",
    statusColor: "bg-green-100 text-green-600",
    description:
      "Team formation, topic selection, and initial proposal submission.",
    side: "left",
    isActive: true,
  },
  {
    id: 2,
    step: "02",
    title: "Mid-term",
    status: "OCT 15",
    statusColor: "bg-amber-100 text-amber-600",
    description: "Progress report submission and preliminary prototype demo.",
    side: "right",
    isActive: false,
  },
  {
    id: 3,
    step: "03",
    title: "Final Submission",
    status: "DEC 10",
    statusColor: "bg-amber-100 text-amber-600",
    description:
      "Full source code delivery, final documentation, and presentation.",
    side: "left",
    isActive: false,
  },
];

export const NEWS_ITEMS: NewsItem[] = [
  {
    id: 1,
    date: "Sept 20, 2024",
    title: "Team Formation Portal is Now Live",
    description:
      "All students are required to register their teams by the end of next week. Use the 'Teams' module in the dashboard to find partners or invite existing team members.",
    linkText: "Read details",
  },
  {
    id: 2,
    date: "Sept 15, 2024",
    title: "Project Guidelines PDF Updated",
    description:
      "The 2024 Project Guidelines document has been updated with new criteria for the Mid-term presentation and Final documentation requirements.",
    linkText: "Download PDF",
  },
  {
    id: 3,
    date: "Sept 10, 2024",
    title: "Welcome to PIMS for CS402",
    description:
      "Welcome to the new academic year. PIMS is your central hub for all things related to your course projects. Please explore the platform and familiarize yourselves with the timeline.",
    linkText: "General FAQ",
  },
];

export const FAQ_ITEMS: FAQItem[] = [
  {
    id: 1,
    question: "How do I form a team?",
    answer:
      'Log in to the dashboard, navigate to the "Teams" tab, and use the "Find Partners" tool or create a new team and invite your classmates via their student IDs.',
  },
  {
    id: 2,
    question: "What are the submission formats?",
    answer:
      "All reports must be in PDF format. Code repositories should be linked via GitHub or GitLab URLs provided in the submission portal.",
  },
  {
    id: 3,
    question: "Who do I contact for technical support?",
    answer:
      "For system-related issues, contact the IT helpdesk. For course-specific questions, please use the internal messaging system to reach your assigned TA.",
  },
];
