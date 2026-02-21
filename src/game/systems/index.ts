import { InputSystem } from './InputSystem';
import { PhysicsSystem } from './PhysicsSystem';
import { RenderSystem } from './RenderSystem';

export const systems = {
    input: new InputSystem(),
    physics: new PhysicsSystem(),
    render: new RenderSystem(),
};