export interface ControllerConfig {
  entityId: string;
  model: any;
  populatedFields?: string | string[] | Record<string, any> | Record<string, any>[];
}