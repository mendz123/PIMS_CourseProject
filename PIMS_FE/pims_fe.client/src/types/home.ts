export interface NewsItem {
  id: number;
  date: string;
  title: string;
  description: string;
  linkText: string;
}

export interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

export interface TimelineEvent {
  id: number;
  step: string;
  title: string;
  status?: string;
  statusColor?: string;
  dateText?: string;
  description: string;
  side: "left" | "right";
  isActive?: boolean;
}

export interface Feature {
  id: number;
  icon: string;
  title: string;
  description: string;
}
