import { Routine } from './Routine.entity.js';
import { RoutineExercise } from './RoutineExercise.vo.js';
import { InvalidRoutineException } from '../errors/InvalidRoutineException.js';

describe('Routine', () => {
  const exercise = (exerciseId: string) => RoutineExercise.create({ exerciseId, targetSets: 4, targetReps: 10 });
  const props = () => ({
    id: 'routine-id',
    userId: 'user-id',
    name: '  Torso ',
    date: new Date('2026-10-01'),
    frequency: 3,
    exercises: [exercise('a'), exercise('b')],
  });

  describe('create', () => {
    it('crea la rutina con el nombre recortado y los ejercicios en orden', () => {
      const routine = Routine.create(props());

      expect(routine.getName()).toBe('Torso');
      expect(routine.getExerciseIds()).toEqual(['a', 'b']);
      expect(routine.isOwnedBy('user-id')).toBe(true);
      expect(routine.isOwnedBy('otro')).toBe(false);
    });

    it('permite una rutina sin ejercicios', () => {
      expect(Routine.create({ ...props(), exercises: [] }).getExercises()).toEqual([]);
    });

    it.each([
      ['el nombre está vacío', { name: ' ' }],
      ['el nombre es demasiado largo', { name: 'x'.repeat(101) }],
      ['la frecuencia es 0', { frequency: 0 }],
      ['la frecuencia es mayor que 7', { frequency: 8 }],
      ['la frecuencia no es entera', { frequency: 2.5 }],
      ['un ejercicio está repetido', { exercises: [exercise('a'), exercise('a')] }],
    ])('lanza InvalidRoutineException si %s', (_caso, override) => {
      expect(() => Routine.create({ ...props(), ...override })).toThrow(InvalidRoutineException);
    });
  });

  describe('update', () => {
    it('cambia solo los campos enviados', () => {
      const routine = Routine.create(props());

      routine.update({ frequency: 5 });

      expect(routine.getFrequency()).toBe(5);
      expect(routine.getName()).toBe('Torso');
      expect(routine.getExerciseIds()).toEqual(['a', 'b']);
    });

    it('reemplaza la lista de ejercicios', () => {
      const routine = Routine.create(props());

      routine.update({ exercises: [exercise('c')] });

      expect(routine.getExerciseIds()).toEqual(['c']);
    });

    it('valida los cambios igual que al crear', () => {
      const routine = Routine.create(props());

      expect(() => routine.update({ name: '' })).toThrow(InvalidRoutineException);
      expect(() => routine.update({ exercises: [exercise('a'), exercise('a')] })).toThrow(InvalidRoutineException);
    });
  });
});

describe('RoutineExercise', () => {
  it.each([
    ['targetSets es 0', { targetSets: 0, targetReps: 10 }],
    ['targetSets es mayor que 20', { targetSets: 21, targetReps: 10 }],
    ['targetReps es 0', { targetSets: 3, targetReps: 0 }],
    ['targetReps es mayor que 100', { targetSets: 3, targetReps: 101 }],
    ['targetReps no es entero', { targetSets: 3, targetReps: 8.5 }],
  ])('lanza InvalidRoutineException si %s', (_caso, values) => {
    expect(() => RoutineExercise.create({ exerciseId: 'a', ...values })).toThrow(InvalidRoutineException);
  });
});
