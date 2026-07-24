import json
import random
import os
import sympy as sp

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(BASE_DIR, "..", "src", "content", "math")
os.makedirs(OUTPUT_DIR, exist_ok=True)

def save_problems(grade, problems):
    random.shuffle(problems) # Shuffle to ensure variety
    # Cap at exactly 100 problems
    problems = problems[:100]
    # Assign IDs and sequential dates
    for i, p in enumerate(problems):
        p["id"] = f"math-{grade}-{i:03d}"
    
    filepath = os.path.join(OUTPUT_DIR, f"grade-{grade}.json")
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(problems, f, indent=2, ensure_ascii=False)
    print(f"Grade {grade}: Generated {len(problems)} problems.")

# Helper to generate latex without solving it automatically in the string
def to_latex(expr):
    return sp.latex(expr)

def generate_7th():
    problems = []
    x, y = sp.symbols('x y')
    
    # Unit 2: Numeros positivos y negativos
    for _ in range(35):
        a = random.randint(-20, 20)
        b = random.randint(-20, 20)
        c = random.randint(-20, 20)
        if a == 0 or b == 0: continue
        ans = a - b + c
        p = {
            "grade": 7,
            "category": "Números Positivos y Negativos",
            "subcategory": "Operaciones combinadas",
            "difficulty": 1,
            "title": "Suma y resta de enteros",
            "question": "Calcula el resultado de la siguiente expresión:",
            "latex": f"{a} - ({b}) + ({c})",
            "answer": str(ans),
            "solution": [
                {"latex": f"{a} - ({b}) + ({c})", "explanation": "Expresión original."},
                {"latex": f"{a} + {-b} + {c}", "explanation": "Eliminamos paréntesis aplicando ley de los signos."},
                {"latex": str(ans), "explanation": "Sumamos los términos."}
            ],
            "hints": ["Recuerda que restar un número es igual a sumar su opuesto (- por + es -)."]
        }
        problems.append(p)
        
    # Unit 3: Algebra (Evaluacion)
    for _ in range(35):
        a = random.randint(2, 6)
        b = random.randint(2, 6)
        val_x = random.randint(-5, 5)
        expr = a*x - b
        ans = expr.subs(x, val_x)
        p = {
            "grade": 7,
            "category": "Álgebra",
            "subcategory": "Valor numérico",
            "difficulty": 1,
            "title": "Evaluación de expresiones",
            "question": f"Encuentra el valor numérico de la expresión si $x = {val_x}$:",
            "latex": f"{a}x - {b}",
            "answer": str(ans),
            "solution": [
                {"latex": f"{a}({val_x}) - {b}", "explanation": "Sustituimos el valor de x en la expresión."},
                {"latex": f"{a * val_x} - {b}", "explanation": "Multiplicamos."},
                {"latex": str(ans), "explanation": "Restamos para obtener el resultado."}
            ],
            "hints": ["Reemplaza la 'x' por su valor numérico, asegurándote de usar paréntesis si es negativo."]
        }
        problems.append(p)

    # Unit 4: Ecuaciones de 1er grado
    for _ in range(35):
        a = random.choice([2, 3, 4, 5, 6])
        ans_x = random.randint(-10, 10)
        b = random.randint(-15, 15)
        c = a * ans_x + b
        p = {
            "grade": 7,
            "category": "Ecuaciones de Primer Grado",
            "subcategory": "Solución de ecuaciones",
            "difficulty": 2,
            "title": "Ecuación Lineal",
            "question": "Resuelve la siguiente ecuación para encontrar el valor de $x$:",
            "latex": f"{a}x {'+' if b>=0 else ''} {b} = {c}",
            "answer": str(ans_x),
            "solution": [
                {"latex": f"{a}x = {c} {'-' if b>=0 else '+'} {abs(b)}", "explanation": "Despejamos el término con x."},
                {"latex": f"{a}x = {c - b}", "explanation": "Simplificamos el lado derecho."},
                {"latex": f"x = \\frac{{{c-b}}}{{{a}}} = {ans_x}", "explanation": "Dividimos entre el coeficiente de x."}
            ],
            "hints": ["Pasa los números sin 'x' al otro lado de la igualdad cambiando su signo."]
        }
        problems.append(p)

    # Unit 5: Proporcionalidad
    for _ in range(35):
        k = random.randint(2, 8)
        x1 = random.randint(2, 5)
        y1 = k * x1
        x2 = random.randint(6, 12)
        ans = k * x2
        p = {
            "grade": 7,
            "category": "Proporcionalidad",
            "subcategory": "Proporcionalidad directa",
            "difficulty": 2,
            "title": "Regla de Tres Directa",
            "question": f"Si $y$ es directamente proporcional a $x$, y sabemos que $y = {y1}$ cuando $x = {x1}$. ¿Cuál es el valor de $y$ cuando $x = {x2}$?",
            "latex": f"\\frac{{{y1}}}{{{x1}}} = \\frac{{y}}{{{x2}}}",
            "answer": str(ans),
            "solution": [
                {"latex": f"k = \\frac{{{y1}}}{{{x1}}} = {k}", "explanation": "Encontramos la constante de proporcionalidad k."},
                {"latex": f"y = {k} \\times {x2}", "explanation": "Multiplicamos k por el nuevo valor de x."},
                {"latex": str(ans), "explanation": "Resultado final."}
            ],
            "hints": ["En proporciones directas, el cociente y/x siempre es constante."]
        }
        problems.append(p)

    save_problems(7, problems)

def generate_8th():
    problems = []
    x, y = sp.symbols('x y')
    
    # Unit 1: Polinomios
    for _ in range(35):
        a = random.randint(1, 5)
        b = random.randint(-5, 5)
        c = random.randint(1, 5)
        d = random.randint(-5, 5)
        if b == 0: b = 1
        if d == 0: d = -1
        expr1 = a*x + b
        expr2 = c*x + d
        ans = sp.expand(expr1 * expr2)
        p = {
            "grade": 8,
            "category": "Operaciones con Polinomios",
            "subcategory": "Multiplicación",
            "difficulty": 2,
            "title": "Multiplicación de Binomios",
            "question": "Desarrolla el siguiente producto de binomios:",
            "latex": f"({sp.latex(expr1)})({sp.latex(expr2)})",
            "answer": sp.latex(ans),
            "solution": [
                {"latex": f"({a}x)({c}x) + ({a}x)({d}) + ({b})({c}x) + ({b})({d})", "explanation": "Aplicamos propiedad distributiva multiplicando cada término."},
                {"latex": f"{a*c}x^2 + {a*d}x + {b*c}x + {b*d}", "explanation": "Resolvemos las multiplicaciones parciales."},
                {"latex": sp.latex(ans), "explanation": "Simplificamos términos semejantes."}
            ],
            "hints": ["Multiplica el primer término del primer binomio por ambos del segundo, y luego haz lo mismo con el segundo término."]
        }
        problems.append(p)

    # Unit 2: Sistema de ecuaciones
    for _ in range(35):
        ans_x = random.randint(-5, 5)
        ans_y = random.randint(-5, 5)
        a1, b1 = random.randint(1, 4), random.randint(-4, 4)
        a2, b2 = random.randint(1, 4), random.randint(-4, 4)
        if a1*b2 == a2*b1 or b1 == 0 or b2 == 0: continue # Evitar colineales
        c1 = a1*ans_x + b1*ans_y
        c2 = a2*ans_x + b2*ans_y
        p = {
            "grade": 8,
            "category": "Sistemas de Ecuaciones",
            "subcategory": "Ecuaciones 2x2",
            "difficulty": 3,
            "title": "Sistema de Ecuaciones Lineales",
            "question": "Resuelve el sistema para x e y. Escribe la respuesta como par ordenado (x, y):",
            "latex": f"\\begin{{cases}} {a1}x {'+' if b1>0 else ''}{b1}y = {c1} \\\\ {a2}x {'+' if b2>0 else ''}{b2}y = {c2} \\end{{cases}}",
            "answer": f"({ans_x}, {ans_y})",
            "solution": [
                {"latex": "x, y", "explanation": "Usamos reducción o sustitución para resolver el sistema."},
                {"latex": f"x = {ans_x}, y = {ans_y}", "explanation": "Solución del sistema."}
            ],
            "hints": ["Intenta multiplicar una o ambas ecuaciones por un número para que al sumarlas se elimine una variable."]
        }
        problems.append(p)

    # Unit 3: Funcion Lineal
    for _ in range(35):
        m = random.choice([-3,-2,-1,1,2,3,4])
        b = random.randint(-5, 5)
        vx = random.randint(-3, 3)
        ans = m * vx + b
        p = {
            "grade": 8,
            "category": "Funciones Lineales",
            "subcategory": "Evaluación",
            "difficulty": 1,
            "title": "Evaluación de la Función Lineal",
            "question": f"Si $y = {m}x {'+' if b>=0 else ''} {b}$. ¿Cuál es el valor de $y$ cuando $x = {vx}$?",
            "latex": f"y = {m}({vx}) {'+' if b>=0 else ''} {b}",
            "answer": str(ans),
            "solution": [
                {"latex": f"y = {m*vx} {'+' if b>=0 else ''} {b}", "explanation": "Multiplicamos el valor de x por la pendiente."},
                {"latex": f"y = {ans}", "explanation": "Sumamos el intercepto para obtener el resultado."}
            ],
            "hints": ["Sustituye la x por el número indicado y respeta la jerarquía de operaciones."]
        }
        problems.append(p)

    save_problems(8, problems)

def generate_9th():
    problems = []
    x = sp.symbols('x')
    
    # Unit 1: Productos Notables
    for _ in range(35):
        a = random.randint(1, 4)
        b = random.randint(1, 6)
        ans = sp.expand((a*x + b)**2)
        p = {
            "grade": 9,
            "category": "Productos Notables",
            "subcategory": "Cuadrado de un binomio",
            "difficulty": 2,
            "title": "Cuadrado Perfecto",
            "question": "Desarrolla el siguiente producto notable:",
            "latex": f"({a}x + {b})^2",
            "answer": sp.latex(ans),
            "solution": [
                {"latex": f"({a}x)^2 + 2({a}x)({b}) + ({b})^2", "explanation": "La regla es: el cuadrado del primero, más el doble del primero por el segundo, más el cuadrado del segundo."},
                {"latex": sp.latex(ans), "explanation": "Realizamos las multiplicaciones indicadas."}
            ],
            "hints": ["Aplica la fórmula: (a+b)² = a² + 2ab + b²"]
        }
        problems.append(p)

    # Unit 2: Ecuacion Cuadratica
    for _ in range(35):
        r1 = random.randint(-5, 5)
        r2 = random.randint(-5, 5)
        if r1 == r2: r2 += 1
        expr = sp.expand((x - r1) * (x - r2))
        ans = f"{min(r1, r2)}, {max(r1, r2)}"
        p = {
            "grade": 9,
            "category": "Ecuaciones de Segundo Grado",
            "subcategory": "Raíces",
            "difficulty": 2,
            "title": "Raíces de Ecuación Cuadrática",
            "question": "Encuentra las soluciones (raíces) de la ecuación, separadas por coma (menor a mayor):",
            "latex": f"{sp.latex(expr)} = 0",
            "answer": ans,
            "solution": [
                {"latex": f"(x - {r1})(x - {r2}) = 0", "explanation": "Factorizamos el polinomio (buscamos números que sumen b y multipliquen c)."},
                {"latex": f"x = {r1}, x = {r2}", "explanation": "Igualamos cada factor a cero."}
            ],
            "hints": ["Factoriza el trinomio o utiliza la fórmula general cuadrática."]
        }
        problems.append(p)

    # Unit 6: Pitágoras
    for _ in range(35):
        m = random.randint(2, 5)
        n = random.randint(1, m-1)
        a = m**2 - n**2
        b = 2*m*n
        c = m**2 + n**2
        p = {
            "grade": 9,
            "category": "Teorema de Pitágoras",
            "subcategory": "Cálculo de hipotenusa",
            "difficulty": 1,
            "title": "Hipotenusa de Triángulo Rectángulo",
            "question": f"En un triángulo rectángulo, los catetos miden {a} y {b}. ¿Cuánto mide la hipotenusa?",
            "latex": f"c = \\sqrt{{{a}^2 + {b}^2}}",
            "answer": str(c),
            "solution": [
                {"latex": f"c^2 = {a}^2 + {b}^2", "explanation": "Aplicamos el Teorema de Pitágoras: la suma de los cuadrados de los catetos es igual al cuadrado de la hipotenusa."},
                {"latex": f"c^2 = {a**2} + {b**2} = {c**2}", "explanation": "Calculamos los cuadrados y sumamos."},
                {"latex": f"c = \\sqrt{{{c**2}}} = {c}", "explanation": "Extraemos la raíz cuadrada."}
            ],
            "hints": ["Recuerda que c² = a² + b²"]
        }
        problems.append(p)

    save_problems(9, problems)

def generate_10th():
    problems = []
    x = sp.symbols('x')
    
    # Unit 4: Division sintetica
    for _ in range(35):
        a = random.randint(1, 3)
        b = random.randint(-4, 4)
        c = random.randint(-4, 4)
        d = random.randint(-4, 4)
        val = random.randint(-2, 2)
        expr = a*x**3 + b*x**2 + c*x + d
        ans = expr.subs(x, val)
        p = {
            "grade": 10,
            "category": "Polinomios de Tercer Grado",
            "subcategory": "Teorema del Residuo",
            "difficulty": 2,
            "title": "Residuo de un Polinomio",
            "question": f"Usa el teorema del residuo para encontrar el resto al dividir el polinomio entre $(x - {val})$:",
            "latex": f"P(x) = {sp.latex(expr)}",
            "answer": str(ans),
            "solution": [
                {"latex": f"P({val})", "explanation": "Por el teorema del residuo, evaluamos el polinomio en el valor."},
                {"latex": f"{a}({val})^3 + {b}({val})^2 + {c}({val}) + {d}", "explanation": "Sustituimos x."},
                {"latex": str(ans), "explanation": "Evaluamos para obtener el residuo."}
            ],
            "hints": ["Sustituye x por el valor que hace cero al divisor."]
        }
        problems.append(p)
        
    # Unit 2: Inecuaciones 2do grado
    for _ in range(35):
        r1 = random.randint(-3, 1)
        r2 = random.randint(2, 5)
        expr = sp.expand((x - r1)*(x - r2))
        p = {
            "grade": 10,
            "category": "Inecuaciones",
            "subcategory": "Inecuación cuadrática",
            "difficulty": 3,
            "title": "Inecuación Cuadrática",
            "question": "Resuelve la inecuación y expresa la solución en notación de intervalo (ej. (-inf, a) U (b, inf)):",
            "latex": f"{sp.latex(expr)} > 0",
            "answer": f"(-inf, {r1}) U ({r2}, inf)",
            "solution": [
                {"latex": f"(x - {r1})(x - {r2}) > 0", "explanation": "Encontramos las raíces críticas factorizando."},
                {"latex": f"x_1 = {r1}, x_2 = {r2}", "explanation": "Puntos críticos en la recta numérica."},
                {"latex": f"(-inf, {r1}) \\cup ({r2}, inf)", "explanation": "Evaluamos los intervalos. Como es >, tomamos las zonas positivas (los extremos)."}
            ],
            "hints": ["Encuentra las raíces y evalúa los signos en la recta numérica."]
        }
        problems.append(p)

    # Unit 3: Simplificacion Fracciones Algebraicas
    for _ in range(40):
        r1 = random.randint(1, 5)
        r2 = random.randint(-5, -1)
        common = x - r1
        num = sp.expand(common * (x + r2))
        den = sp.expand(common * (x + random.randint(2, 5)))
        
        num_factored = sp.factor(num)
        den_factored = sp.factor(den)
        ans = sp.simplify(num / den)
        
        p = {
            "grade": 10,
            "category": "Fracciones Algebraicas",
            "subcategory": "Simplificación",
            "difficulty": 2,
            "title": "Simplificación de Expresiones",
            "question": "Simplifica al máximo la siguiente fracción algebraica:",
            "latex": f"\\frac{{{sp.latex(num)}}}{{{sp.latex(den)}}}",
            "answer": sp.latex(ans).replace('\\frac', ''),
            "solution": [
                {"latex": f"\\frac{{{sp.latex(num_factored)}}}{{{sp.latex(den_factored)}}}", "explanation": "Factorizamos tanto el numerador como el denominador."},
                {"latex": sp.latex(ans), "explanation": "Cancelamos el factor común para obtener la expresión simplificada."}
            ],
            "hints": ["Busca factorizar los trinomios en el numerador y denominador."]
        }
        p["answer"] = sp.latex(ans)
        problems.append(p)

    save_problems(10, problems)

def generate_11th():
    problems = []
    x, y = sp.symbols('x y')
    
    # Unit 1: Sucesiones Aritmeticas
    for _ in range(35):
        a1 = random.randint(-5, 10)
        d = random.randint(2, 6)
        n = random.randint(10, 25)
        ans = a1 + (n - 1) * d
        p = {
            "grade": 11,
            "category": "Sucesiones",
            "subcategory": "Progresión Aritmética",
            "difficulty": 1,
            "title": "Término General",
            "question": f"En una sucesión aritmética, el primer término es $a_1 = {a1}$ y la diferencia común es $d = {d}$. ¿Cuál es el valor del término $a_{{{n}}}$?",
            "latex": f"a_n = a_1 + (n-1)d",
            "answer": str(ans),
            "solution": [
                {"latex": f"a_{{{n}}} = {a1} + ({n}-1)({d})", "explanation": "Aplicamos la fórmula del término general de una sucesión aritmética."},
                {"latex": f"a_{{{n}}} = {a1} + ({n-1})({d})", "explanation": "Restamos dentro del paréntesis."},
                {"latex": str(ans), "explanation": "Multiplicamos y sumamos para obtener el resultado."}
            ],
            "hints": ["Usa la fórmula an = a1 + (n-1)d"]
        }
        problems.append(p)

    # Unit 4: Geometria Analitica
    for _ in range(35):
        x1, y1 = random.randint(-5, 5), random.randint(-5, 5)
        x2, y2 = random.randint(-5, 5), random.randint(-5, 5)
        if x1 == x2: x2 += 1
        m = sp.Rational(y2 - y1, x2 - x1)
        p = {
            "grade": 11,
            "category": "Geometría Analítica",
            "subcategory": "La recta",
            "difficulty": 2,
            "title": "Pendiente de la Recta",
            "question": f"Calcula la pendiente $m$ de la recta que pasa por los puntos $P_1({x1}, {y1})$ y $P_2({x2}, {y2})$:",
            "latex": f"m = \\frac{{y_2 - y_1}}{{x_2 - x_1}}",
            "answer": str(m),
            "solution": [
                {"latex": f"m = \\frac{{{y2} - ({y1})}}{{{x2} - ({x1})}}", "explanation": "Sustituimos las coordenadas en la fórmula de la pendiente."},
                {"latex": f"m = \\frac{{{y2 - y1}}}{{{x2 - x1}}}", "explanation": "Restamos en numerador y denominador."},
                {"latex": sp.latex(m), "explanation": "Simplificamos la fracción."}
            ],
            "hints": ["La pendiente es el cambio en y dividido por el cambio en x: (y2 - y1) / (x2 - x1)"]
        }
        if m.is_integer:
            p["answer"] = str(m)
        else:
            p["answer"] = f"{m.p}/{m.q}"
        problems.append(p)

    # Unit 3: Logaritmos
    for _ in range(40):
        base = random.choice([2, 3, 4, 5])
        exponent = random.randint(2, 4)
        arg = base ** exponent
        p = {
            "grade": 11,
            "category": "Logaritmos",
            "subcategory": "Cálculo básico",
            "difficulty": 2,
            "title": "Evaluación de Logaritmos",
            "question": f"Calcula el valor del siguiente logaritmo:",
            "latex": f"\\log_{{{base}}}({arg})",
            "answer": str(exponent),
            "solution": [
                {"latex": f"{base}^x = {arg}", "explanation": "Transformamos el logaritmo a su forma exponencial equivalente."},
                {"latex": f"{base}^x = {base}^{{{exponent}}}", "explanation": "Expresamos el argumento como potencia de la misma base."},
                {"latex": f"x = {exponent}", "explanation": "Igualamos los exponentes."}
            ],
            "hints": ["Pregúntate: ¿A qué exponente debo elevar la base para obtener el número entre paréntesis?"]
        }
        problems.append(p)

    save_problems(11, problems)

if __name__ == "__main__":
    generate_7th()
    generate_8th()
    generate_9th()
    generate_10th()
    generate_11th()
    print("Successfully generated math curriculum problems for grades 7-11.")
