import { Exercise } from './Exercise.entity.js';
import { MuscleGroup } from './MuscleGroup.entity.js';
import { InvalidExerciseException } from '../errors/InvalidExerciseException.js';

describe('Exercise', () => {
  const props = { id: 'exercise-id', name: '  Press de banca ', img: null, muscleGroupId: 'pecho' };

  it('recorta el nombre y deja img en null si viene vacía', () => {
    const exercise = Exercise.create({ ...props, img: '   ' });

    expect(exercise.getName()).toBe('Press de banca');
    expect(exercise.getImg()).toBeNull();
  });

  it('conserva la url de la imagen', () => {
    expect(Exercise.create({ ...props, img: 'https://img.test/press.png' }).getImg()).toBe('https://img.test/press.png');
  });

  it.each([
    ['el nombre está vacío', '   '],
    ['el nombre es demasiado largo', 'x'.repeat(101)],
  ])('lanza InvalidExerciseException si %s', (_caso, name) => {
    expect(() => Exercise.create({ ...props, name })).toThrow(InvalidExerciseException);
  });
});

describe('MuscleGroup', () => {
  it.each([
    ['Bíceps', 'biceps'],
    ['Tríceps', 'triceps'],
    ['  Parte alta de la espalda ', 'parte-alta-de-la-espalda'],
  ])('genera el id "%s" -> "%s"', (name, id) => {
    const group = MuscleGroup.create(name);

    expect(group.Id).toBe(id);
    expect(group.getName()).toBe(name.trim());
  });

  it('lanza InvalidExerciseException si el nombre está vacío', () => {
    expect(() => MuscleGroup.create(' ')).toThrow(InvalidExerciseException);
  });
});
