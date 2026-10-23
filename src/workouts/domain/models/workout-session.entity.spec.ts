import { WorkoutSession } from './WorkoutSession.entity.js';
import { SetLog } from './SetLog.entity.js';
import { SessionStatus } from './enums/SessionStatus.enum.js';
import { InvalidWorkoutException } from '../errors/InvalidWorkoutException.js';
import { WorkoutSessionClosedException } from '../errors/WorkoutSessionClosedException.js';
import { SetLogNotFoundException } from '../errors/SetLogNotFoundException.js';

describe('WorkoutSession', () => {
  const start = () =>
    WorkoutSession.start({ id: 'session-id', userId: 'user-id', routineId: 'routine-id', time: new Date(), notes: '  ' });
  const set = (id: string) => SetLog.create({ id, exerciseId: 'press', reps: 10, weight: 60, createdAt: new Date() });

  it('empieza en curso, sin series y con notas vacías como null', () => {
    const session = start();

    expect(session.getStatus()).toBe(SessionStatus.IN_PROGRESS);
    expect(session.getSets()).toEqual([]);
    expect(session.getNotes()).toBeNull();
  });

  it('añade y quita series mientras está en curso', () => {
    const session = start();

    session.addSet(set('s1'));
    session.addSet(set('s2'));
    session.removeSet('s1');

    expect(session.getSets().map((s) => s.Id)).toEqual(['s2']);
  });

  it('lanza SetLogNotFoundException al quitar una serie que no existe', () => {
    expect(() => start().removeSet('no-existe')).toThrow(SetLogNotFoundException);
  });

  it.each([SessionStatus.COMPLETED, SessionStatus.CANCELLED])('no permite cambiar series si está %s', (status) => {
    const session = start();
    session.addSet(set('s1'));
    session.changeStatus(status);

    expect(() => session.addSet(set('s2'))).toThrow(WorkoutSessionClosedException);
    expect(() => session.removeSet('s1')).toThrow(WorkoutSessionClosedException);
  });

  it('no se puede reabrir ni cambiar de estado una vez cerrada', () => {
    const session = start();
    session.changeStatus(SessionStatus.COMPLETED);

    expect(() => session.changeStatus(SessionStatus.CANCELLED)).toThrow(WorkoutSessionClosedException);
    expect(() => session.changeStatus(SessionStatus.IN_PROGRESS)).toThrow(WorkoutSessionClosedException);
  });

  it('pedir el mismo estado no hace nada', () => {
    const session = start();
    session.changeStatus(SessionStatus.COMPLETED);

    expect(() => session.changeStatus(SessionStatus.COMPLETED)).not.toThrow();
  });

  it('pasar a en curso estando en curso no falla', () => {
    expect(() => start().changeStatus(SessionStatus.IN_PROGRESS)).not.toThrow();
  });

  it('permite editar las notas aunque esté cerrada', () => {
    const session = start();
    session.changeStatus(SessionStatus.COMPLETED);

    session.updateNotes('  Buen día ');

    expect(session.getNotes()).toBe('Buen día');
  });

  it('lanza InvalidWorkoutException si las notas son demasiado largas', () => {
    expect(() => start().updateNotes('x'.repeat(1001))).toThrow(InvalidWorkoutException);
  });
});

describe('SetLog', () => {
  const props = { id: 's1', exerciseId: 'press', reps: 8, weight: 62.555, createdAt: new Date() };

  it('redondea el peso a 2 decimales', () => {
    expect(SetLog.create(props).getWeight()).toBe(62.56);
  });

  it('acepta peso 0 para ejercicios con peso corporal', () => {
    expect(SetLog.create({ ...props, weight: 0 }).getWeight()).toBe(0);
  });

  it.each([
    ['reps es 0', { reps: 0 }],
    ['reps no es entero', { reps: 7.5 }],
    ['reps es demasiado alto', { reps: 1001 }],
    ['el peso es negativo', { weight: -1 }],
    ['el peso es demasiado alto', { weight: 1001 }],
    ['el peso no es un número finito', { weight: Number.NaN }],
  ])('lanza InvalidWorkoutException si %s', (_caso, override) => {
    expect(() => SetLog.create({ ...props, ...override })).toThrow(InvalidWorkoutException);
  });
});
