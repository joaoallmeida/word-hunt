from mimesis import Generic, Locale
import random
import string


class WordHunt:
    THEMES = {
        'animais': ['CACHORRO', 'GATO', 'LEAO', 'TIGRE', 'ELEFANTE', 'MACACO', 'GIRAFA', 'JACARE', 'TARTARUGA', 'COBRA', 'BALEIA', 'GOLFINHO', 'PINGUIM', 'URUBU', 'ZEBRA', 'HIPOPOTAMO', 'RINOCERONTE', 'LOBO', 'RAPOSA', 'URSO', 'COELHO', 'SAPO', 'ARANHA', 'ESCORPIAO', 'BORBOLETA', 'ABELHA', 'FORMIGA', 'MOSQUITO', 'GAVIAO', 'CORUJA', 'TUCANO', 'PAPAGAIO', 'ARARA', 'CANGURU', 'KOALA', 'CAMELO', 'LHAMA', 'OVELHA', 'CABRA', 'PORCO', 'VACA', 'CAVALO', 'GALINHA', 'PATO', 'PERU', 'AVESTRUZ'],
        'paises': ['BRASIL', 'CANADA', 'JAPAO', 'FRANCA', 'ITALIA', 'ALEMANHA', 'MEXICO', 'ARGENTINA', 'ESPANHA', 'PORTUGAL', 'CHINA', 'INDIA', 'RUSSIA', 'AUSTRALIA', 'EGITO', 'ANGOLA', 'PERU', 'COLOMBIA', 'CHILE', 'URUGUAI', 'PARAGUAI', 'EQUADOR', 'VENEZUELA', 'BOLIVIA', 'SUECIA', 'NORUEGA', 'DINAMARCA', 'FINLANDIA', 'POLONIA', 'UCRANIA', 'GRECIA', 'TURQUIA', 'IRLANDA', 'ESCANDINAVIA', 'MARROCOS', 'NIGERIA', 'QUENIA', 'TAILANDIA', 'VIETNA', 'FILIPINAS', 'INDONESIA', 'MALASIA', 'CINGAPURA'],
        'alimentos': ['PIZZA', 'HAMBURGUER', 'SALADA', 'BATATA', 'CENOURA', 'BANANA', 'MACA', 'LARANJA', 'MELANCIA', 'ABACAXI', 'MORANGO', 'UVA', 'PERA', 'PESSEGO', 'GOIABA', 'MANGA', 'MAMAO', 'MELAO', 'TOMATE', 'CEBOLA', 'ALHO', 'PIMENTAO', 'BROCOLIS', 'COUVE', 'ALFACE', 'RUCULA', 'ESPINAFRE', 'FEIJAO', 'ARROZ', 'MACARRAO', 'CARNE', 'FRANGO', 'PEIXE', 'OVO', 'QUEIJO', 'PRESUNTO', 'LEITE', 'IOGURTE', 'MANTEIGA', 'BOLO', 'BELA', 'DOCE', 'CHOCOLATE', 'SORVETE', 'BISCOITO'],
        'tecnologia': ['COMPUTADOR', 'CELULAR', 'INTERNET', 'PROGRAMACAO', 'TECLADO', 'MOUSE', 'MONITOR', 'SOFTWARE', 'HARDWARE', 'SISTEMA', 'APLICATIVO', 'SITE', 'REDE', 'SERVIDOR', 'DADOS', 'INFORMACOES', 'ARQUIVO', 'PASTA', 'DOCUMENTO', 'IMAGEM', 'VIDEO', 'AUDIO', 'MENSAGEM', 'EMAIL', 'SENHA', 'USUARIO', 'LOGIN', 'LOGOUT', 'DOWNLOAD', 'UPLOAD', 'CLIQUE', 'TOQUE', 'TELA', 'BATERIA', 'CARREGADOR', 'CABO', 'CONEXAO', 'WIFI', 'BLUETOOTH', 'GPS', 'CAMERA', 'MICROFONE']
    }

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
        positions = [(r, c, dr, dc) for r in range(len(grid)) for c in range(len(grid[0])) for dr, dc in self.DIRECTIONS]
        random.shuffle(positions)
        for r, c, dr, dc in positions:
            if self.can_place_word(grid, word, r, c, dr, dc):
                for i, char in enumerate(word):
                    grid[r + dr * i][c + dc * i] = char
                return (r, c)
        return None

    def fill_empty(self, grid):
        for r in range(len(grid)):
            for c in range(len(grid[0])):
                if grid[r][c] == "":
                    grid[r][c] = random.choice(string.ascii_uppercase)
        return grid

    def random_words(self, num_words, theme='random', max_len=10):
        if theme != 'random' and theme in self.THEMES:
            available_words = [w.upper().replace(' ', '').replace('-', '') for w in self.THEMES[theme]]
            valid_words = [w for w in available_words if 4 <= len(w) <= max_len]
            
            if len(valid_words) >= num_words:
                words = random.sample(valid_words, num_words)
            else:
                words = valid_words
            return sorted(words)

        generic = Generic(Locale.PT_BR)
        words = list()

        for _ in range(num_words):
            word = generic.text.word().upper()
            word = word.replace(' ', '').replace('-', '')
            while len(word) < 4 or len(word) > max_len or word in words:
                word = generic.text.word().upper()
                word = word.replace(' ', '').replace('-', '')
            words.append(word)

        return sorted(words)

    def run(self, difficulty='medium', theme='random'):
        if difficulty == 'easy':
            rows, cols = 10, 10
            num_words = 8
        elif difficulty == 'hard':
            rows, cols = 15, 30
            num_words = 25
        else: # medium
            rows, cols = 15, 20
            num_words = 15

        max_len = min(rows, cols)
        
        pool_size = num_words * 2
        words_pool = self.random_words(pool_size, theme, max_len=max_len)
        random.shuffle(words_pool)
        
        grid = self.create_grid(rows, cols)

        hints = []
        placed_words = []

        for word in words_pool:
            if len(placed_words) >= num_words:
                break
                
            placed_at = self.place_word(grid, word)
            if placed_at:
                placed_words.append(word)
                hints.append({
                    "word": word,
                    "row": placed_at[0],
                    "col": placed_at[1],
                    "index": placed_at[0] * cols + placed_at[1]
                })

        self.fill_empty(grid)

        return grid, sorted(placed_words), hints, cols, rows
