export interface DocFile {
  id: string;
  url: string;
  file?: File;
  name?: string;
  type: 'image' | 'pdf';
}

export interface DocumentationItem {
  id: string;
  date: string;
  activityName: string;
  description: string;
  files: DocFile[];
  createdAt: number;
}

export type FormData = Omit<DocumentationItem, 'id' | 'createdAt'>;