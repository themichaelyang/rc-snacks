import random
from itertools import combinations_with_replacement
from enum import Enum

class Color(Enum):
  RED = 1
  GREEN = 2
  BLUE = 3
  YELLOW = 4
  ORANGE = 5
  PURPLE = 6

class Board:
  def __init__(self, solution: list[Color], guesses_allowed: int):
    self.guesses: list[list[Color]] = []
    self.solution: list[Color] = solution
    self.guesses_allowed: int = guesses_allowed

# TODO: look into random.choices
all_possibilities = list(combinations_with_replacement([value for value in Color], 6))
random_selection = all_possibilities[random.randint(0, len(all_possibilities) - 1)]

board = Board(list(random_selection), 6)
print(random_selection)

'''
Next steps?
- take 6 color inputs from user
- check against solution > indicate correct place/color
'''

def check_guess(guess: list[Color], solution: list[Color]):
  right_place_count = 0
  right_color_count = 0
  seen_indices = []

  for idx in range(len(guess)):
    if guess[idx] == solution[idx]:
      right_place_count += 1
      seen_indices.append(idx)
    elif guess[idx] in solution and idx not in seen_indices:
      right_color_count += 1
      seen_indices.append(idx)
  return (right_place_count, right_color_count)

def ask_guess(board: Board, game_turn):
  raw_guess = str(input("Enter a string of 6 colors: R, G, B, Y, O, P: "))
  board.guesses[game_turn] = is_valid_guess(list(raw_guess))

  return board.guesses[game_turn]

def is_valid_guess(guess: list[str]) -> list[Color]:
  guessed_colors = []
  colors_as_chars = dict([(value.name[0], value) for value in Color])

  for c in guess:
    if c not in colors_as_chars:
      raise ValueError("Not a valid color!")
    else:
      guessed_colors.append(colors_as_chars[c])

  return guessed_colors

def game_loop(board, guesses_allowed: int):
  is_done = False
  game_turn = 0

  while not is_done:
    board.guesses.append([])
    input = ask_guess(board, game_turn)

    print(check_guess(input, board.solution))

    game_turn += 1
    if game_turn >= guesses_allowed:
      is_done = True

game_loop(board, 6)