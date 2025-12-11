export type ReportFilters = {
  search: string;
  tags: string[]; // Changed from tag (string) to tags (array)
};

export type Report = {
  id: string;
  title: string;
  description: string | null;
  tags: string[];
  fileUrl: string;
  createdAt: string;
  updatedAt: string;
};
