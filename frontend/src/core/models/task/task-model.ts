import { TaskPriority } from './task-priority';
import { TaskState } from './task-state';
import { TaskType } from './task-type';

export interface TaskModel {
  id: number;
  summary: string;
  description?: string;
  state: TaskState;
  type: TaskType;
  priority: TaskPriority;
  authorId: number;
  projectId: number;
  sprintId: number;
  lastUpdatedById: number;
  parentTaskId: number;
  createdAt: Date;
  updatedAt: Date;
  deadline: Date;
  finishedAt?: Date;
  estimate?: number;
}
