from z3 import *


def add_distance_constraint(solver, v1, v2):
  # solver.add(sum(x * y for x, y in zip(v1, v2)) <= 0.5)
  solver.add(sum((x - y) * (x - y) for x, y in zip(v1, v2)) >= 1)

def add_mag_constraint(solver, v1):
  solver.add(sum(el * el for el in v1) == 1)
  #pass

def make_vector(solver, i, dimension):
  # return RealVector('s' + str(i), dimension)
  ret = []
  for j in range(dimension):
    ret.append(Real(f's{i}__{j}'))
    solver.add(ret[-1] >= -1)
    solver.add(ret[-1] <= 1)

  # ret.append((1-sum(x * x for x in ret)) ** 0.5)
  return ret

def define_problem(dimension, n_balls):
  solver = Solver()
  existing_vectors = []

  for i in range(n_balls):
    vect = make_vector(solver, i, dimension)
    add_mag_constraint(solver, vect)

    for other in existing_vectors:
      add_distance_constraint(solver, vect, other)

    existing_vectors += [vect]

  return solver

solver = define_problem(2,6)
print(solver.check())
print(solver.model())