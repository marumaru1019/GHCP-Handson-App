import { LucideIcon } from 'lucide-react';
import { KanbanStatus } from '../shared/todo';

export interface KanbanColumn {
  id: KanbanStatus;
  title: string;
  color: string;
  icon: LucideIcon;
}
