from mimesis import Generic, Locale
import random
import string

class WordHunt:
    ROWS, COLS = 25, 20
    DIRECTIONS = [
        (0, 1),   # right
        (1, 0),   # down
        (1, 1),   # diagonal down-right
        (0, -1),  # left
        (-1, 0),  # up
        (-1, -1), # diagonal up-left
        (1, -1),  # diagonal down-left
        (-1, 1),  # diagonal up-right
    ]

    def create_grid(self, rows, cols):
        return [["" for _ in range(cols)] for _ in range(rows)]

    def can_place_word(self, grid, word, row, col, dr, dc):
        for i, char in enumerate(word):
            r = row + dr * i
            c = col + dc * i
            if (
                r < 0 or r >= len(grid) or
                c < 0 or c >= len(grid[0]) or
                (grid[r][c] not in ("", char))
            ):
                return False
        return True

    def place_word(self, grid, word):
        for _ in range(100):  # try multiple times
            row = random.randint(0, len(grid) - 1)
            col = random.randint(0, len(grid[0]) - 1)
            dr, dc = random.choice(self.DIRECTIONS)

            if self.can_place_word(grid, word, row, col, dr, dc):
                for i, char in enumerate(word):
                    grid[row + dr * i][col + dc * i] = char
                return True
        return False

    def fill_empty(self, grid):
        for r in range(len(grid)):
            for c in range(len(grid[0])):
                if grid[r][c] == "":
                    grid[r][c] = random.choice(string.ascii_uppercase)
        return grid

    def print_grid(self, grid):
        for row in grid:
            print(" ".join(row))
  
    def random_words(self):
        generic = Generic(Locale.PT_BR)
        words = list()
        # sorted([ generic.text.word().upper() for _ in range(28) ])
        for _ in range(28):
            word = generic.text.word().upper()
            while len(word) < 6 or len(word) > 10 or word in words:
                word = generic.text.word().upper()
            words.append(word)

        return sorted(words)
    
    def run(self):
        words = self.random_words()
        grid = self.create_grid(self.ROWS, self.COLS)

        for word in words:
            placed = self.place_word(grid, word)
        if not placed:
            print(f"Could not place word: {word}")

        self.fill_empty(grid)
        
        # print(f"Placed words")
        # line = [ words[i:i + 7] for i in range(0, len(words), 7)]
        # width = max(len(word) for word in words)
        # divider = "=" * (width * 7 + 3 * 6)

        # for l in line:
        #     formatted = " | ".join(word.ljust(width) for word in l)
        #     print(formatted)

        # print(divider)
        # self.print_grid(grid)

        return grid, words

# if __name__ == "__main__":
#     wh = WordHunt()
#     wh.run()
