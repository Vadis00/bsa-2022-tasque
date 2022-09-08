import { TaskCustomField } from './task-custom-field';

export interface TaskTemplate {
    id?: string,
    title: string,
    projectId: number,
    typeId?: number,

    customFields: TaskCustomField[],
}
