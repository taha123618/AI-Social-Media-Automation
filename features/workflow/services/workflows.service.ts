import { Workflow, WorkflowTemplate } from '../types';
import { SystemLogger } from "@/features/system/services/logger.service";

export interface CreateWorkflowData {
  name: string;
  description?: string;
  trigger: {
    type: 'MANUAL' | 'SCHEDULED' | 'EVENT_BASED';
    config: Record<string, unknown>;
  };
  steps: Omit<Workflow['steps'][0], 'id'>[];
  businessId: string;
  creatorId: string;
}

export interface UpdateWorkflowData {
  name?: string;
  description?: string;
  trigger?: {
    type: 'MANUAL' | 'SCHEDULED' | 'EVENT_BASED';
    config: Record<string, unknown>;
  };
  steps?: Omit<Workflow['steps'][0], 'id'>[];
  isActive?: boolean;
}

export class WorkflowsService {
  private static workflows: Workflow[] = [
    {
      id: '1',
      name: 'Daily Content Generation',
      description: 'Generate and schedule content for all platforms daily',
      trigger: {
        type: 'SCHEDULED',
        config: { schedule: '0 9 * * *' }
      },
      steps: [
        {
          id: '1',
          name: 'Generate Content',
          type: 'CONTENT_GENERATION',
          config: { intent: 'ENGAGEMENT', platforms: ['LINKEDIN', 'TWITTER'] },
          order: 1,
          conditions: []
        },
        {
          id: '2',
          name: 'Review Content',
          type: 'CONTENT_REVIEW',
          config: { requireApproval: true },
          order: 2,
          conditions: []
        },
        {
          id: '3',
          name: 'Schedule Posting',
          type: 'CONTENT_SCHEDULING',
          config: { scheduleInHours: 24 },
          order: 3,
          conditions: []
        }
      ],
      isActive: true,
      runCount: 15,
      lastRunAt: new Date('2024-01-20T09:00:00Z'),
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-15T10:30:00Z'),
      businessId: '1',
      creatorId: '1',
      successRate: '95%'
    }
  ];

  private static templates: WorkflowTemplate[] = [
    {
      id: '1',
      name: 'Daily Content Generation',
      description: 'Generate and post content automatically every day',
      category: 'Content',
      steps: [
        {
          name: 'Generate Content',
          type: 'CONTENT_GENERATION',
          config: { intent: 'ENGAGEMENT' },
          order: 1,
          conditions: []
        },
        {
          name: 'Schedule Posting',
          type: 'CONTENT_SCHEDULING',
          config: { scheduleInHours: 24 },
          order: 2,
          conditions: []
        }
      ],
      icon: 'Calendar',
      isPopular: true
    },
    {
      id: '2',
      name: 'Weekly Analytics Report',
      description: 'Generate and send weekly performance reports',
      category: 'Analytics',
      steps: [
        {
          name: 'Generate Report',
          type: 'CUSTOM',
          config: { reportType: 'analytics' },
          order: 1,
          conditions: []
        },
        {
          name: 'Send Email Notification',
          type: 'NOTIFICATION',
          config: { type: 'email' },
          order: 2,
          conditions: []
        }
      ],
      icon: 'BarChart',
      isPopular: true
    }
  ];

  static async findMany(businessId: string) {
    // In a real implementation, this would query the database
    return this.workflows.filter(w => w.businessId === businessId);
  }

  static async findById(id: string, businessId: string) {
    return this.workflows.find(w => w.id === id && w.businessId === businessId);
  }

  static async create(data: CreateWorkflowData) {
    const workflow: Workflow = {
      id: Date.now().toString(),
      ...data,
      description: data.description || null,
      steps: data.steps.map((step, index) => ({
        ...step,
        id: `${Date.now()}-${index}`,
        order: index + 1
      })) as Workflow['steps'],
      isActive: false,
      runCount: 0,
      lastRunAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      successRate: '100%'
    };

    this.workflows.push(workflow);

    await SystemLogger.logAudit({
      action: "WORKFLOW_CREATED",
      resource: `Workflow:${workflow.id}`,
      userId: data.creatorId,
      status: "SUCCESS",
      details: { businessId: data.businessId, name: data.name }
    });

    return workflow;
  }

  static async update(id: string, businessId: string, data: UpdateWorkflowData) {
    const index = this.workflows.findIndex(w => w.id === id && w.businessId === businessId);
    if (index === -1) {
      throw new Error('Workflow not found');
    }

    this.workflows[index] = {
      ...this.workflows[index],
      ...data,
      description: data.description || this.workflows[index].description,
      steps: data.steps ? data.steps.map((step, index) => ({
        ...step,
        id: `${Date.now()}-${index}`,
        order: index + 1
      })) as Workflow['steps'] : this.workflows[index].steps,
      updatedAt: new Date(),
    };

    await SystemLogger.logAudit({
      action: "WORKFLOW_UPDATED",
      resource: `Workflow:${id}`,
      userId: "system", // Should ideally pass userId
      status: "SUCCESS",
      details: { businessId, changes: Object.keys(data) }
    });

    return this.workflows[index];
  }

  static async delete(id: string, businessId: string) {
    const index = this.workflows.findIndex(w => w.id === id && w.businessId === businessId);
    if (index === -1) {
      throw new Error('Workflow not found');
    }

    this.workflows.splice(index, 1);

    await SystemLogger.logAudit({
      action: "WORKFLOW_DELETED",
      resource: `Workflow:${id}`,
      userId: "system",
      status: "SUCCESS",
      details: { businessId }
    });
  }

  static async run(id: string, businessId: string) {
    const workflow = await this.findById(id, businessId);
    if (!workflow) {
      throw new Error('Workflow not found');
    }

    if (!workflow.isActive) {
      throw new Error('Workflow is not active');
    }

    // Increment run count and update last run time
    workflow.runCount += 1;
    workflow.lastRunAt = new Date();

    // In a real implementation, this would trigger the workflow execution
    const execution = {
      executionId: Date.now().toString(),
      status: 'RUNNING' as const,
      startedAt: new Date(),
    };

    await SystemLogger.logActivity({
      action: "WORKFLOW_RUNTIME_TRIGGERED",
      entity: "Workflow",
      entityId: id,
      details: { businessId, executionId: execution.executionId }
    });

    return execution;
  }

  static async toggleStatus(id: string, businessId: string) {
    const workflow = await this.findById(id, businessId);
    if (!workflow) {
      throw new Error('Workflow not found');
    }

    workflow.isActive = !workflow.isActive;
    workflow.updatedAt = new Date();

    await SystemLogger.logActivity({
      action: "WORKFLOW_STATUS_TOGGLED",
      entity: "Workflow",
      entityId: id,
      details: { businessId, isActive: workflow.isActive }
    });

    return workflow;
  }

  static async getTemplates() {
    return this.templates;
  }

  static async getTemplateById(id: string) {
    return this.templates.find(t => t.id === id);
  }

  static async getExecutions(workflowId: string, businessId: string) {
    // In a real implementation, this would query execution logs
    return [];
  }

  static async getExecutionById(executionId: string) {
    // In a real implementation, this would query the execution log
    return null;
  }
}
