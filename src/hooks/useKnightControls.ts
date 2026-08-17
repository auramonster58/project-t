import { useCallback, useEffect, useRef, useState } from 'react';
import { PASSAGE_MAX_Y, PASSAGE_MIN_Y, PASSAGE_WIDTH, PLAY_MAX_Y, PLAY_MIN_Y,
  UPPER_ROOM_DOOR_LEFT, UPPER_ROOM_DOOR_RIGHT, UPPER_ROOM_INDEX, UPPER_ROOM_LEFT,
  UPPER_ROOM_MIN_Y, UPPER_ROOM_RIGHT } from '../lib/gameData';
import type { MovementDirection } from '../lib/spriteData';

const WALK_SPEED = 360;
const VERTICAL_SPEED = 42;
const WALL_HALF_WIDTH = 75;
const DOOR_TOP = PASSAGE_MIN_Y;
const DOOR_BOTTOM = PASSAGE_MAX_Y;
type MovementBlocker = { x: number; y: number; health: number };

function isInsidePassage(x: number, roomWidth: number) {
  const localX = ((x % roomWidth) + roomWidth) % roomWidth;
  return localX >= roomWidth - PASSAGE_WIDTH;
}

function isAtUpperRoom(x: number, roomWidth: number) {
  const room = Math.floor(x / roomWidth);
  const localX = x - room * roomWidth;
  return room === UPPER_ROOM_INDEX ? localX : null;
}

function verticalBoundsAtPosition(x: number, y: number, roomWidth: number, upperRoomUnlocked: boolean) {
  const upperLocalX = isAtUpperRoom(x, roomWidth);
  const isAtUpperDoor = upperLocalX !== null
    && upperLocalX >= UPPER_ROOM_DOOR_LEFT && upperLocalX <= UPPER_ROOM_DOOR_RIGHT;
  const isInsideUpperRoom = y < PLAY_MIN_Y && upperLocalX !== null
    && upperLocalX >= UPPER_ROOM_LEFT && upperLocalX <= UPPER_ROOM_RIGHT;
  if (isAtUpperDoor && upperRoomUnlocked) return { min: UPPER_ROOM_MIN_Y, max: PLAY_MAX_Y };
  if (isInsideUpperRoom) return { min: UPPER_ROOM_MIN_Y, max: PLAY_MIN_Y - 2 };
  return isInsidePassage(x, roomWidth)
    ? { min: PASSAGE_MIN_Y, max: PASSAGE_MAX_Y }
    : { min: PLAY_MIN_Y, max: PLAY_MAX_Y };
}

function keepInsideUpperRoom(x: number, y: number, roomWidth: number) {
  if (y >= PLAY_MIN_Y) return x;
  const roomStart = UPPER_ROOM_INDEX * roomWidth;
  return Math.min(roomStart + UPPER_ROOM_RIGHT, Math.max(roomStart + UPPER_ROOM_LEFT, x));
}

function isBlockedByEnemy(x: number, y: number, blockers: MovementBlocker[]) {
  return blockers.some((blocker) => blocker.health > 0
    && Math.hypot(blocker.x - x, (blocker.y - y) * 9) < 88);
}

function moveIntoPassages(currentX: number, nextX: number, y: number, roomWidth: number, worldWidth: number) {
  if (y >= PASSAGE_MIN_Y && y <= PASSAGE_MAX_Y) return nextX;
  for (let start = roomWidth - PASSAGE_WIDTH; start < worldWidth; start += roomWidth) {
    if (nextX > currentX && currentX <= start && nextX > start) return start;
  }
  return nextX;
}

function moveThroughDoors(currentX: number, nextX: number, y: number, roomWidth: number, worldWidth: number) {
  if (y >= DOOR_TOP && y <= DOOR_BOTTOM) return nextX;
  for (let boundary = roomWidth; boundary < worldWidth; boundary += roomWidth) {
    const leftEdge = boundary - WALL_HALF_WIDTH;
    const rightEdge = boundary + WALL_HALF_WIDTH;
    if (nextX > currentX && currentX <= leftEdge && nextX > leftEdge) return leftEdge;
    if (nextX < currentX && currentX >= rightEdge && nextX < rightEdge) return rightEdge;
  }
  return nextX;
}

function moveBesideDoors(x: number, nextY: number, roomWidth: number, worldWidth: number) {
  for (let boundary = roomWidth; boundary < worldWidth; boundary += roomWidth) {
    if (Math.abs(x - boundary) < WALL_HALF_WIDTH) return Math.min(DOOR_BOTTOM, Math.max(DOOR_TOP, nextY));
  }
  return isInsidePassage(x, roomWidth)
    ? Math.min(PASSAGE_MAX_Y, Math.max(PASSAGE_MIN_Y, nextY))
    : nextY;
}

export function useKnightControls(
  onStrike: (worldX: number, y: number, facing: 1 | -1) => void,
  maxWorldX: number,
  worldWidth: number,
  roomWidth: number,
  instantAttack: boolean,
  speedMultiplier = 1,
  upperRoomUnlocked = false,
  movementBlockers: MovementBlocker[] = [],
  canControl = true,
  viewScale = 1,
) {
  const [worldX, setWorldX] = useState(150);
  const [y, setY] = useState(52);
  const [facing, setFacing] = useState<1 | -1>(1);
  const [direction, setDirection] = useState<MovementDirection>('right');
  const [isMoving, setIsMoving] = useState(false);
  const [isAttacking, setIsAttacking] = useState(false);
  const [attackSequence, setAttackSequence] = useState(0);
  const keys = useRef(new Set<string>());
  const position = useRef({ worldX, y, facing });
  const attackLocked = useRef(false);
  const maxXRef = useRef(maxWorldX);
  const blockersRef = useRef(movementBlockers);
  const canControlRef = useRef(canControl);

  useEffect(() => { position.current = { worldX, y, facing }; }, [facing, worldX, y]);
  useEffect(() => { maxXRef.current = maxWorldX; }, [maxWorldX]);
  useEffect(() => { blockersRef.current = movementBlockers; }, [movementBlockers]);
  useEffect(() => { canControlRef.current = canControl; }, [canControl]);

  const attack = useCallback(() => {
    if (!canControlRef.current || (!instantAttack && attackLocked.current)) return;
    attackLocked.current = !instantAttack;
    setAttackSequence((current) => current + 1);
    setIsAttacking(true);
    const strike = () => onStrike(position.current.worldX, position.current.y, position.current.facing);
    if (instantAttack) strike(); else window.setTimeout(strike, 140);
    window.setTimeout(() => setIsAttacking(false), instantAttack ? 100 : 360);
    if (!instantAttack) window.setTimeout(() => { attackLocked.current = false; }, 460);
  }, [instantAttack, onStrike]);

  const move = useCallback((directionX: -1 | 0 | 1, directionY: -1 | 0 | 1) => {
    if (!canControlRef.current) return;
    setIsMoving(Boolean(directionX || directionY));
    if (directionX) setFacing(directionX);
    if (directionY) setDirection(directionY < 0 ? 'up' : 'down');
    else if (directionX) setDirection(directionX < 0 ? 'left' : 'right');
    setWorldX((value) => {
      const next = Math.min(maxXRef.current, Math.max(80, value + directionX * 35 * speedMultiplier));
      const passageMove = moveIntoPassages(value, next, position.current.y, roomWidth, worldWidth);
      const doorMove = moveThroughDoors(value, passageMove, position.current.y, roomWidth, worldWidth);
      const upperRoomMove = keepInsideUpperRoom(doorMove, position.current.y, roomWidth);
      return isBlockedByEnemy(upperRoomMove, position.current.y, blockersRef.current) ? value : upperRoomMove;
    });
    setY((value) => {
      const bounds = verticalBoundsAtPosition(position.current.worldX, value, roomWidth, upperRoomUnlocked);
      const next = Math.min(bounds.max, Math.max(bounds.min, value + directionY * 4 * speedMultiplier));
      const doorMove = moveBesideDoors(position.current.worldX, next, roomWidth, worldWidth);
      return isBlockedByEnemy(position.current.worldX, doorMove, blockersRef.current) ? value : doorMove;
    });
  }, [roomWidth, speedMultiplier, upperRoomUnlocked, worldWidth]);

  const teleport = useCallback((nextX: number, nextY: number) => {
    keys.current.clear();
    position.current = { worldX: nextX, y: nextY, facing: 1 };
    setWorldX(nextX);
    setY(nextY);
    setFacing(1);
    setDirection('right');
    setIsMoving(false);
  }, []);

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (event.code.startsWith('Arrow') || ['KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(event.code)) {
        event.preventDefault(); keys.current.add(event.code);
      }
    };
    const up = (event: KeyboardEvent) => keys.current.delete(event.code);
    const blur = () => keys.current.clear();
    window.addEventListener('keydown', down); window.addEventListener('keyup', up); window.addEventListener('blur', blur);
    return () => {
      window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); window.removeEventListener('blur', blur);
    };
  }, []);

  useEffect(() => {
    let frame = 0;
    let previous = performance.now();
    const tick = (now: number) => {
      const seconds = Math.min((now - previous) / 1000, 0.032); previous = now;
      const left = keys.current.has('KeyA') || keys.current.has('ArrowLeft');
      const right = keys.current.has('KeyD') || keys.current.has('ArrowRight');
      const up = keys.current.has('KeyW') || keys.current.has('ArrowUp');
      const down = keys.current.has('KeyS') || keys.current.has('ArrowDown');
      if (!canControlRef.current) {
        keys.current.clear();
        setIsMoving(false);
        frame = requestAnimationFrame(tick);
        return;
      }
      const dx = left === right ? 0 : right ? 1 : -1;
      const dy = up === down ? 0 : down ? 1 : -1;
      const moving = Boolean(dx || dy);
      setIsMoving((current) => current === moving ? current : moving);
      if (dy) setDirection(dy < 0 ? 'up' : 'down');
      else if (dx) setDirection(dx < 0 ? 'left' : 'right');
      if (dx) {
        setFacing(dx);
        setWorldX((value) => {
          const next = Math.min(maxXRef.current, Math.max(80, value + dx * WALK_SPEED * speedMultiplier * seconds));
          const passageMove = moveIntoPassages(value, next, position.current.y, roomWidth, worldWidth);
          const doorMove = moveThroughDoors(value, passageMove, position.current.y, roomWidth, worldWidth);
          const upperRoomMove = keepInsideUpperRoom(doorMove, position.current.y, roomWidth);
          return isBlockedByEnemy(upperRoomMove, position.current.y, blockersRef.current) ? value : upperRoomMove;
        });
      }
      if (dy) setY((value) => {
        const bounds = verticalBoundsAtPosition(position.current.worldX, value, roomWidth, upperRoomUnlocked);
        const next = Math.min(bounds.max, Math.max(bounds.min, value + dy * VERTICAL_SPEED * speedMultiplier * seconds));
        const doorMove = moveBesideDoors(position.current.worldX, next, roomWidth, worldWidth);
        return isBlockedByEnemy(position.current.worldX, doorMove, blockersRef.current) ? value : doorMove;
      });
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [roomWidth, speedMultiplier, upperRoomUnlocked, worldWidth]);

  const anchor = typeof window === 'undefined' ? 300 : Math.min(window.innerWidth * 0.3, 340) / viewScale;
  const viewportWidth = typeof window === 'undefined' ? 1200 : window.innerWidth;
  const visibleWorldWidth = viewportWidth / viewScale;
  const cameraX = Math.min(Math.max(0, worldX - anchor), Math.max(0, worldWidth - visibleWorldWidth));
  return { worldX, cameraX, screenX: (worldX - cameraX) * viewScale, y, facing, direction, isMoving, isAttacking,
    attackSequence, attack, move, teleport };
}
