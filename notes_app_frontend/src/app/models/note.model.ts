export interface Note {
  id: string;
  title: string;
  content: string;
  notebookId: string | null;
  tags: string[];
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}
