export function isColliding(rectA: { x: number; y: number; width: number; height: number }, rectB: { x: number; y: number; width: number; height: number }): boolean {
    return (
        rectA.x < rectB.x + rectB.width &&
        rectA.x + rectA.width > rectB.x &&
        rectA.y < rectB.y + rectB.height &&
        rectA.y + rectA.height > rectB.y
    );
}

export function getCollisionDirection(rectA: { x: number; y: number; width: number; height: number }, rectB: { x: number; y: number; width: number; height: number }): string {
    const overlapX = Math.min(rectA.x + rectA.width, rectB.x + rectB.width) - Math.max(rectA.x, rectB.x);
    const overlapY = Math.min(rectA.y + rectA.height, rectB.y + rectB.height) - Math.max(rectA.y, rectB.y);

    if (overlapX < overlapY) {
        return rectA.x < rectB.x ? 'left' : 'right';
    } else {
        return rectA.y < rectB.y ? 'top' : 'bottom';
    }
}