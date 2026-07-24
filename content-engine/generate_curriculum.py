import json
import random
import os
import sympy as sp
import math

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(BASE_DIR, "..", "src", "content", "math")
os.makedirs(OUTPUT_DIR, exist_ok=True)

def save_problems(grade, problems):
    random.shuffle(problems)
    problems = problems[:100]
    for i, p in enumerate(problems):
        p["id"] = f"math-{grade}-{i:03d}"
        if "type" not in p:
            p["type"] = "numeric"
    
    filepath = os.path.join(OUTPUT_DIR, f"grade-{grade}.json")
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(problems, f, indent=2, ensure_ascii=False)
    print(f"Grade {grade}: Generated {len(problems)} advanced problems.")

def generate_7th():
    problems = []
    x = sp.symbols('x')
    
    # Unit 4: Ecuaciones (Edades)
    for _ in range(35):
        # Juan = x, Ana = k*x. In 'y' years, sum = x + y + k*x + y = (k+1)x + 2y = S
        k = random.randint(2, 4)
        juan_age = random.randint(5, 15)
        ana_age = k * juan_age
        y_years = random.randint(3, 10)
        total_sum = (juan_age + y_years) + (ana_age + y_years)
        
        p = {
            "grade": 7,
            "category": "Ecuaciones de Primer Grado",
            "subcategory": "Aplicaciones",
            "difficulty": 3,
            "title": "Problema de Edades",
            "question": f"Ana tiene {k} veces la edad de Juan. Dentro de {y_years} años, la suma de sus edades será {total_sum}. ¿Cuál es la edad actual de Juan?",
            "latex": f"x + {k}x + {2*y_years} = {total_sum}",
            "answer": str(juan_age),
            "solution": [
                {"latex": f"x + {k}x + {2*y_years} = {total_sum}", "explanation": f"Si Juan tiene x años, Ana tiene {k}x. En {y_years} años tendrán x+{y_years} y {k}x+{y_years} respectivamente."},
                {"latex": f"{k+1}x = {total_sum} - {2*y_years}", "explanation": "Agrupamos las x y pasamos los años restando."},
                {"latex": f"x = {juan_age}", "explanation": "Dividimos para obtener la edad actual de Juan."}
            ],
            "hints": ["Plantea una ecuación donde la edad de Juan sea 'x'. No olvides sumar los años que pasan a ambas edades."]
        }
        problems.append(p)

    # Unit 7: Geometría (Perímetro rectangular)
    for _ in range(35):
        # L = W + c. P = 2(W + W + c) = 4W + 2c
        W = random.randint(10, 30)
        c = random.randint(3, 15)
        L = W + c
        P = 2*L + 2*W
        p = {
            "grade": 7,
            "category": "Medidas de Figuras Geométricas",
            "subcategory": "Perímetro de polígonos",
            "difficulty": 2,
            "title": "Perímetro y Álgebra",
            "question": f"El largo de un terreno rectangular es {c} metros mayor que su ancho. Si el perímetro total es de {P} metros, ¿cuánto mide el ancho del terreno (en metros)?",
            "latex": f"2x + 2(x + {c}) = {P}",
            "answer": str(W),
            "solution": [
                {"latex": f"2x + 2(x + {c}) = {P}", "explanation": "El perímetro es la suma de 2 veces el ancho (x) y 2 veces el largo (x+c)."},
                {"latex": f"4x + {2*c} = {P}", "explanation": "Desarrollamos la ecuación."},
                {"latex": f"4x = {P - 2*c}", "explanation": "Restamos los metros extra."},
                {"latex": f"x = {W}", "explanation": "Dividimos entre 4 para encontrar el ancho."}
            ],
            "hints": ["Usa 'x' para el ancho y 'x + algo' para el largo. El perímetro es la suma de los 4 lados."]
        }
        problems.append(p)

    # Unit 5: Proporcionalidad Inversa (Trabajo)
    for _ in range(35):
        # N workers take D days. (N * D = Total Work). M workers take x days. x = (N*D)/M
        N = random.randint(2, 6)
        M = random.choice([m for m in range(2, 10) if m != N])
        total_work = N * M * random.randint(2, 5)
        D = total_work // N
        ans_days = total_work // M
        p = {
            "grade": 7,
            "category": "Proporcionalidad",
            "subcategory": "Proporcionalidad inversa",
            "difficulty": 3,
            "title": "Proporcionalidad Inversa",
            "question": f"Un equipo de {N} obreros tarda {D} días en construir un muro. Si se quiere hacer el mismo trabajo con un equipo de {M} obreros trabajando al mismo ritmo, ¿cuántos días tardarán?",
            "latex": f"{N} \\times {D} = {M} \\times x",
            "answer": str(ans_days),
            "solution": [
                {"latex": f"{N} \\times {D} = {total_work}", "explanation": "Calculamos el total de 'días-obrero' necesarios (esfuerzo total)."},
                {"latex": f"x = \\frac{{{total_work}}}{{{M}}}", "explanation": "Dividimos el esfuerzo total entre la nueva cantidad de obreros."},
                {"latex": f"x = {ans_days}", "explanation": "Resultado en días."}
            ],
            "hints": ["A más obreros, menos días (es una proporción inversa). Multiplica los obreros iniciales por sus días."]
        }
        problems.append(p)

    save_problems(7, problems)


def generate_8th():
    problems = []
    
    # Unit 2: Sistemas de Ecuaciones (Problema de boletos)
    for _ in range(35):
        adult_p = random.randint(10, 20)
        kid_p = random.randint(4, 9)
        adult_t = random.randint(40, 100)
        kid_t = random.randint(30, 150)
        total_tickets = adult_t + kid_t
        total_revenue = adult_p * adult_t + kid_p * kid_t
        p = {
            "grade": 8,
            "category": "Sistema de Ecuaciones de Primer Grado",
            "subcategory": "Aplicaciones",
            "difficulty": 3,
            "title": "Problema de Recaudación",
            "question": f"En un cine se vendieron {total_tickets} boletos en total. El boleto de adulto cuesta ${adult_p} y el de niño ${kid_p}. Si se recaudaron ${total_revenue}, ¿cuántos boletos de niño se vendieron?",
            "latex": f"A + N = {total_tickets} \\quad \\text{{y}} \\quad {adult_p}A + {kid_p}N = {total_revenue}",
            "answer": str(kid_t),
            "solution": [
                {"latex": f"A = {total_tickets} - N", "explanation": "Despejamos los adultos (A) en términos de los niños (N)."},
                {"latex": f"{adult_p}({total_tickets} - N) + {kid_p}N = {total_revenue}", "explanation": "Sustituimos en la ecuación de ingresos."},
                {"latex": f"{adult_p * total_tickets} - {adult_p}N + {kid_p}N = {total_revenue}", "explanation": "Distribuimos."},
                {"latex": f"{-adult_p + kid_p}N = {total_revenue - adult_p * total_tickets}", "explanation": "Despejamos N."},
                {"latex": f"N = {kid_t}", "explanation": "Resolvemos para el total de boletos de niño."}
            ],
            "hints": ["Plantea dos ecuaciones: una para la cantidad de boletos (A + N) y otra para el dinero (PrecioA*A + PrecioN*N)."]
        }
        problems.append(p)

    # Unit 5: Paralelismo / Triángulos (Ángulos con expresiones algebraicas)
    for _ in range(35):
        # Angles inside a triangle sum to 180.
        # (a*x + c1) + (b*x + c2) + (c*x + c3) = 180
        x_val = random.randint(10, 25)
        a, b, c = random.randint(1,3), random.randint(1,3), random.randint(1,3)
        # We need sum(ax) + sum(c) = 180 => sum(c) = 180 - x_val*sum(a)
        sum_a = a + b + c
        sum_c = 180 - x_val * sum_a
        lower1 = min(-10, sum_c - 10)
        upper1 = max(10, sum_c + 10)
        c1 = random.randint(lower1, upper1)
        lower2 = min(-10, sum_c - c1 - 10)
        upper2 = max(10, sum_c - c1 + 10)
        c2 = random.randint(lower2, upper2)
        c3 = sum_c - c1 - c2
        
        p = {
            "grade": 8,
            "category": "Paralelismo",
            "subcategory": "Ángulos internos de un triángulo",
            "difficulty": 2,
            "title": "Ángulos Algebraicos",
            "question": f"Los tres ángulos internos de un triángulo miden $({a}x {'+' if c1>=0 else ''} {c1})^\\circ$, $({b}x {'+' if c2>=0 else ''} {c2})^\\circ$ y $({c}x {'+' if c3>=0 else ''} {c3})^\\circ$. ¿Cuál es el valor de $x$?",
            "latex": f"({a}x + {c1}) + ({b}x + {c2}) + ({c}x + {c3}) = 180",
            "answer": str(x_val),
            "solution": [
                {"latex": f"({a}x {'+' if c1>=0 else ''} {c1}) + ({b}x {'+' if c2>=0 else ''} {c2}) + ({c}x {'+' if c3>=0 else ''} {c3}) = 180", "explanation": "La suma de los ángulos internos de todo triángulo es 180°."},
                {"latex": f"{sum_a}x {'+' if sum_c>=0 else ''} {sum_c} = 180", "explanation": "Sumamos las 'x' y los términos independientes."},
                {"latex": f"{sum_a}x = {180 - sum_c}", "explanation": "Despejamos el término con x."},
                {"latex": f"x = {x_val}", "explanation": "Dividimos para hallar el valor de x."}
            ],
            "hints": ["Suma las tres expresiones algebraicas e iguala el resultado a 180 grados."]
        }
        problems.append(p)

    # Unit 3: Función Lineal (Tarifa de Taxis)
    for _ in range(35):
        base_fee = random.randint(10, 50)
        per_km = random.randint(3, 15)
        kms = random.randint(8, 45)
        total_cost = base_fee + per_km * kms
        p = {
            "grade": 8,
            "category": "Funciones de Primer Grado",
            "subcategory": "Aplicaciones",
            "difficulty": 2,
            "title": "Modelado Lineal",
            "question": f"Una compañía de taxis cobra una tarifa base de ${base_fee} más ${per_km} por cada kilómetro recorrido. Si un viaje costó un total de ${total_cost}, ¿cuántos kilómetros recorrió el taxi?",
            "latex": f"{per_km}x + {base_fee} = {total_cost}",
            "answer": str(kms),
            "solution": [
                {"latex": f"f(x) = {per_km}x + {base_fee}", "explanation": "Modelamos el costo del viaje como una función lineal donde x son los kilómetros."},
                {"latex": f"{per_km}x + {base_fee} = {total_cost}", "explanation": "Igualamos la función al costo total pagado."},
                {"latex": f"{per_km}x = {total_cost - base_fee}", "explanation": "Restamos la tarifa base."},
                {"latex": f"x = {kms}", "explanation": "Dividimos para obtener los kilómetros recorridos."}
            ],
            "hints": ["A lo que pagaste en total, réstale la tarifa base. El resto divídelo entre el costo por kilómetro."]
        }
        problems.append(p)

    save_problems(8, problems)


def generate_9th():
    problems = []
    
    # Unit 6: Pitágoras (Poste quebrado / Escalera)
    for _ in range(35):
        # Broken pole: Total height H. Breaks at height x. Top falls y away.
        # So x^2 + y^2 = (H-x)^2  => x^2 + y^2 = H^2 - 2Hx + x^2 => 2Hx = H^2 - y^2 => x = (H^2 - y^2) / 2H
        # Need H and y such that H^2 - y^2 is divisible by 2H.
        # Let's use standard Pythagorean triples: a^2 + b^2 = c^2. x = a, y = b, H - x = c => H = a + c.
        # Let a, b, c be a valid triple.
        m = random.randint(2, 6)
        n = random.randint(1, m-1)
        k = random.randint(1, 3) # scale factor
        a = k * (m**2 - n**2)
        b = k * (2*m*n)
        c = k * (m**2 + n**2)
        H = a + c
        y = b
        
        p = {
            "grade": 9,
            "category": "Teorema de Pitágoras",
            "subcategory": "Aplicaciones en geometría",
            "difficulty": 4,
            "title": "El Poste Quebrado",
            "question": f"Un poste vertical de {H} metros de altura se quiebra por el viento. La punta del poste cae y toca el suelo a {y} metros de su base, formando un triángulo rectángulo. ¿A qué altura desde el suelo (en metros) se quebró el poste?",
            "latex": f"x^2 + {y}^2 = ({H}-x)^2",
            "answer": str(a),
            "solution": [
                {"latex": f"x^2 + {y}^2 = ({H}-x)^2", "explanation": "Si el poste se quiebra a una altura x, la hipotenusa (la parte caída) mide el resto del poste: H - x."},
                {"latex": f"x^2 + {y**2} = {H**2} - {2*H}x + x^2", "explanation": "Desarrollamos el binomio al cuadrado en la hipotenusa."},
                {"latex": f"{2*H}x = {H**2} - {y**2}", "explanation": "Cancelamos las x² de ambos lados y despejamos x."},
                {"latex": f"x = {a}", "explanation": "Realizamos la división para encontrar la altura del quiebre."}
            ],
            "hints": ["Dibuja un triángulo rectángulo. El cateto vertical es 'x', la base es la distancia al poste, y la hipotenusa es el resto del poste (Total - x)."]
        }
        problems.append(p)

    # Unit 2: Ecuación Cuadrática (Área rectángulo)
    for _ in range(35):
        # A = x(x + c). x^2 + cx - A = 0
        x = random.randint(5, 20)
        c = random.randint(2, 12)
        A = x * (x + c)
        p = {
            "grade": 9,
            "category": "Ecuaciones de Segundo Grado",
            "subcategory": "Aplicaciones",
            "difficulty": 3,
            "title": "Área de un Rectángulo",
            "question": f"El largo de un salón rectangular es {c} metros mayor que su ancho. Si el área total del salón es de {A} metros cuadrados, ¿cuántos metros mide el ancho?",
            "latex": f"x(x + {c}) = {A}",
            "answer": str(x),
            "solution": [
                {"latex": f"x(x + {c}) = {A}", "explanation": "El área de un rectángulo es base por altura."},
                {"latex": f"x^2 + {c}x - {A} = 0", "explanation": "Multiplicamos y formamos una ecuación cuadrática igualada a cero."},
                {"latex": f"(x - {x})(x + {x+c}) = 0", "explanation": "Factorizamos buscando dos números que multiplicados den el área y restados den la diferencia de lados."},
                {"latex": f"x = {x}", "explanation": "Tomamos la solución positiva, ya que una distancia no puede ser negativa."}
            ],
            "hints": ["Plantea la ecuación Área = x * (x + diferencia). Obtendrás una ecuación cuadrática que debes igualar a cero y factorizar."]
        }
        problems.append(p)
        
    # Unit 5: Semejanza (Sombras / Espejos)
    for _ in range(35):
        # h1 / s1 = h2 / s2  => h2 = (h1 * s2) / s1
        h1 = random.randint(15, 20) / 10.0 # 1.5 to 2.0
        s1 = random.randint(1, 4)
        factor = random.randint(4, 12)
        s2 = s1 * factor
        h2 = h1 * factor
        p = {
            "grade": 9,
            "category": "Semejanza",
            "subcategory": "Semejanza de triángulos rectángulos",
            "difficulty": 2,
            "title": "Semejanza y Sombras",
            "question": f"Un estudiante que mide {h1} metros de altura proyecta una sombra de {s1} metros. En ese mismo instante, un edificio cercano proyecta una sombra de {s2} metros. Usando semejanza de triángulos, ¿cuál es la altura del edificio en metros?",
            "latex": f"\\frac{{{h1}}}{{{s1}}} = \\frac{{h}}{{{s2}}}",
            "answer": str(int(h2) if h2.is_integer() else round(h2, 2)),
            "solution": [
                {"latex": f"\\frac{{{h1}}}{{{s1}}} = \\frac{{h}}{{{s2}}}", "explanation": "Los rayos del sol caen paralelos, formando triángulos rectángulos semejantes."},
                {"latex": f"h = \\frac{{{h1} \\times {s2}}}{{{s1}}}", "explanation": "Despejamos la altura del edificio multiplicando en cruz."},
                {"latex": f"h = {h2}", "explanation": "Calculamos el resultado final."}
            ],
            "hints": ["Plantea una proporción: Altura_Persona / Sombra_Persona = Altura_Edificio / Sombra_Edificio."]
        }
        problems.append(p)

    save_problems(9, problems)


def generate_10th():
    problems = []
    
    # Unit 5: Trigonometría (Ángulos de elevación)
    for _ in range(35):
        # We need a clean tangent value. tan(30) = 1/sqrt(3), tan(45) = 1, tan(60) = sqrt(3).
        angle_deg = random.choice([30, 45, 60])
        dist = random.randint(10, 50)
        
        if angle_deg == 45:
            ans_str = str(dist)
            ans_latex = str(dist)
        elif angle_deg == 30:
            ans_str = f"{dist}/sqrt(3)"
            ans_latex = f"\\frac{{{dist}}}{{\\sqrt{{3}}}}"
        else: # 60
            ans_str = f"{dist}*sqrt(3)"
            ans_latex = f"{dist}\\sqrt{{3}}"
            
        p = {
            "grade": 10,
            "category": "Introducción a la Trigonometría",
            "subcategory": "Resolución de triángulos rectángulos",
            "difficulty": 3,
            "title": "Ángulo de Elevación",
            "question": f"Un observador está a {dist} metros de la base de una torre. El ángulo de elevación hacia la punta de la torre es de {angle_deg}º. Sabiendo que $\\tan(45^\\circ)=1$, $\\tan(30^\\circ)=1/\\sqrt{{3}}$ y $\\tan(60^\\circ)=\\sqrt{{3}}$, ¿cuál es la altura de la torre? (Escribe la respuesta exacta, ej: 10*sqrt(3) o 15/sqrt(3))",
            "latex": f"\\tan({angle_deg}^\\circ) = \\frac{{h}}{{{dist}}}",
            "answer": ans_str,
            "solution": [
                {"latex": f"\\tan({angle_deg}^\\circ) = \\frac{{\\text{{cateto opuesto}}}}{{\\text{{cateto adyacente}}}} = \\frac{{h}}{{{dist}}}", "explanation": "Usamos la función tangente que relaciona el lado opuesto (altura) y el adyacente (distancia)."},
                {"latex": f"h = {dist} \\times \\tan({angle_deg}^\\circ)", "explanation": "Despejamos la altura multiplicando por la distancia."},
                {"latex": f"h = {ans_latex}", "explanation": "Sustituimos el valor exacto de la tangente trigonométrica."}
            ],
            "hints": ["La tangente de un ángulo es igual al opuesto (altura) sobre el adyacente (distancia horizontal). Despeja la altura."]
        }
        problems.append(p)
        
    # Unit 4: Polinomios de 3er grado (Encontrar raíz)
    x = sp.symbols('x')
    for _ in range(35):
        r1 = random.randint(-4, 4)
        r2 = random.randint(-4, 4)
        r3 = random.randint(-4, 4)
        if r1 == r2: r2 += 1
        if r1 == r3: r3 -= 1
        poly = sp.expand((x - r1) * (x - r2) * (x - r3))
        # Find integer root sum to make it interesting, or just ask for the largest root
        largest_root = max(r1, r2, r3)
        p = {
            "grade": 10,
            "category": "Ecuaciones de Tercer Grado",
            "subcategory": "Factorización de polinomios",
            "difficulty": 4,
            "title": "Raíz Máxima del Polinomio",
            "question": f"Encuentra la RAÍZ (solución) MÁS GRANDE de la siguiente ecuación polinómica de tercer grado: ${sp.latex(poly)} = 0$",
            "latex": f"{sp.latex(poly)} = 0",
            "answer": str(largest_root),
            "solution": [
                {"latex": f"P(x) = {sp.latex(poly)}", "explanation": "Usamos división sintética o probamos los divisores del término independiente para encontrar la primera raíz."},
                {"latex": f"(x - {r1})(x - {r2})(x - {r3}) = 0", "explanation": "Al factorizar completamente el polinomio obtenemos 3 raíces."},
                {"latex": f"x_1 = {r1}, x_2 = {r2}, x_3 = {r3}", "explanation": "Estas son las tres soluciones reales."},
                {"latex": f"\\text{{Máxima}} = {largest_root}", "explanation": "Seleccionamos la solución de mayor valor."}
            ],
            "hints": ["Prueba evaluar el polinomio con números pequeños (1, -1, 2, -2) para encontrar la primera raíz usando el Teorema del Factor, luego usa división sintética para obtener una cuadrática."]
        }
        problems.append(p)
        
    # Unit 2: Inecuaciones Racionales o Cuadráticas (Problema de Dominio)
    for _ in range(30):
        # We want roots of a quadratic representing a profit margin
        cost = random.randint(10, 30)
        # Profit = -x^2 + bx - c > 0 => x^2 - bx + c < 0 => (x-r1)(x-r2) < 0
        r1 = random.randint(5, 10)
        r2 = random.randint(15, 25)
        b = r1 + r2
        c = r1 * r2
        profit_expr = -x**2 + b*x - c
        p = {
            "grade": 10,
            "category": "Inecuaciones de Segundo Grado",
            "subcategory": "Aplicaciones",
            "difficulty": 4,
            "title": "Rango de Ganancias",
            "question": f"La ganancia de una empresa al vender $x$ unidades de un producto está dada por $G(x) = {sp.latex(profit_expr)}$. Para no tener pérdidas, la ganancia debe ser estrictamente mayor a cero. ¿Cuál es el rango de unidades $x$ que deben vender? (Responde en formato intervalo abierto, ej: (a, b))",
            "latex": f"{sp.latex(profit_expr)} > 0",
            "answer": f"({r1}, {r2})",
            "solution": [
                {"latex": f"-x^2 + {b}x - {c} > 0", "explanation": "Planteamos la inecuación para cuando las ganancias son positivas."},
                {"latex": f"x^2 - {b}x + {c} < 0", "explanation": "Multiplicamos por -1, recordando invertir el signo de la desigualdad."},
                {"latex": f"(x - {r1})(x - {r2}) < 0", "explanation": "Factorizamos para encontrar los puntos críticos."},
                {"latex": f"x \\in ({r1}, {r2})", "explanation": "Como la parábola (x^2...) abre hacia arriba, los valores menores a 0 están estrictamente entre las dos raíces."}
            ],
            "hints": ["Plantea G(x) > 0. Multiplica por -1 para hacer x² positivo (¡recuerda voltear el símbolo!). Factoriza y analiza la recta numérica."]
        }
        problems.append(p)

    save_problems(10, problems)


def generate_11th():
    problems = []
    
    # Unit 3: Logaritmos (Interés Compuesto Continuo)
    for _ in range(35):
        # A = P * e^(rt). To double: 2P = P * e^(rt) => 2 = e^(rt) => ln(2) = rt => t = ln(2)/r
        # We will keep it simple using generic log instead of continuous, or just log_base(x)
        # Instead, let's use a bacterial growth: P(t) = P0 * 2^(t/k).
        k = random.randint(2, 6)
        factor = random.choice([4, 8, 16])
        ans_time = k * int(math.log2(factor))
        p = {
            "grade": 11,
            "category": "Funciones Logarítmicas",
            "subcategory": "Aplicaciones",
            "difficulty": 3,
            "title": "Crecimiento Exponencial",
            "question": f"Una colonia de bacterias duplica su población cada {k} horas. Si inicialmente hay 100 bacterias, ¿cuántas horas deben pasar para que la población sea de {100 * factor} bacterias?",
            "latex": f"100 \\times 2^{{\\frac{{t}}{{{k}}}}} = {100 * factor}",
            "answer": str(ans_time),
            "solution": [
                {"latex": f"P(t) = P_0 \\cdot 2^{{t/k}}", "explanation": "La fórmula para el crecimiento poblacional que se duplica cada k horas."},
                {"latex": f"{100 * factor} = 100 \\cdot 2^{{t/{k}}}", "explanation": "Sustituimos los valores conocidos."},
                {"latex": f"{factor} = 2^{{t/{k}}}", "explanation": "Dividimos ambos lados entre la población inicial."},
                {"latex": f"\\log_2({factor}) = \\frac{{t}}{{{k}}}", "explanation": "Aplicamos logaritmos base 2 para despejar el exponente."},
                {"latex": f"{int(math.log2(factor))} = \\frac{{t}}{{{k}}} \\implies t = {ans_time}", "explanation": "Multiplicamos por k para obtener las horas totales."}
            ],
            "hints": ["Plantea la ecuación: Población Final = Inicial * 2^(t/periodo). Luego despeja el tiempo (t) usando logaritmos."]
        }
        problems.append(p)

    # Unit 4: Geometría Analítica (Ecuación de Circunferencia)
    for _ in range(35):
        h, k_val = random.randint(-4, 4), random.randint(-4, 4)
        r = random.randint(2, 7)
        # Expand (x-h)^2 + (y-k)^2 = r^2
        # x^2 - 2hx + h^2 + y^2 - 2ky + k^2 - r^2 = 0
        D = -2*h
        E = -2*k_val
        F = h**2 + k_val**2 - r**2
        
        p = {
            "grade": 11,
            "category": "Geometría Analítica",
            "subcategory": "La circunferencia",
            "difficulty": 4,
            "title": "Radio de la Circunferencia",
            "question": f"Dada la ecuación general de una circunferencia: $x^2 + y^2 {'+' if D>=0 else ''}{D}x {'+' if E>=0 else ''}{E}y {'+' if F>=0 else ''}{F} = 0$, completa cuadrados para encontrar la longitud de su radio.",
            "latex": f"x^2 + y^2 {'+' if D>=0 else ''}{D}x {'+' if E>=0 else ''}{E}y {'+' if F>=0 else ''}{F} = 0",
            "answer": str(r),
            "solution": [
                {"latex": f"(x^2 {'+' if D>=0 else ''}{D}x) + (y^2 {'+' if E>=0 else ''}{E}y) = {-F}", "explanation": "Agrupamos las variables y pasamos el término independiente a la derecha."},
                {"latex": f"(x^2 {'+' if D>=0 else ''}{D}x + {h**2}) + (y^2 {'+' if E>=0 else ''}{E}y + {k_val**2}) = {-F} + {h**2} + {k_val**2}", "explanation": "Completamos cuadrados sumando la mitad del coeficiente al cuadrado a ambos lados."},
                {"latex": f"(x - {h})^2 + (y - {k_val})^2 = {r**2}", "explanation": "Factorizamos los trinomios cuadrados perfectos y simplificamos la derecha."},
                {"latex": f"r^2 = {r**2} \\implies r = {r}", "explanation": "Extraemos la raíz cuadrada para encontrar el radio."}
            ],
            "hints": ["Agrupa los términos con x y los de y. Luego 'completa el cuadrado' sumando (b/2)² a ambos lados para llegar a la forma (x-h)² + (y-k)² = r²."]
        }
        problems.append(p)
        
    # Unit 1: Sucesiones (Sumatoria y Progresión Aritmética)
    for _ in range(30):
        # A theater has row 1 = A seats, row 2 = A+D seats. Total rows = N. How many seats in total?
        A1 = random.randint(15, 30)
        D = random.randint(2, 5)
        N = random.randint(10, 20)
        An = A1 + (N - 1) * D
        Total = (N * (A1 + An)) // 2
        p = {
            "grade": 11,
            "category": "Sucesiones",
            "subcategory": "Notación de sumatoria",
            "difficulty": 3,
            "title": "Sumatoria en Auditorio",
            "question": f"Un auditorio está diseñado de manera que la primera fila tiene {A1} asientos, la segunda fila tiene {A1+D} asientos, la tercera {A1+2*D}, y así sucesivamente en progresión aritmética. Si el auditorio tiene un total de {N} filas, ¿cuál es la capacidad total (cantidad de asientos) del auditorio?",
            "latex": f"S_{{{N}}} = \\frac{{{N}(a_1 + a_{{{N}}})}}{{2}}",
            "answer": str(Total),
            "solution": [
                {"latex": f"a_{{{N}}} = {A1} + ({N}-1)({D}) = {An}", "explanation": "Primero, usamos la fórmula del término general para encontrar cuántos asientos hay en la última fila."},
                {"latex": f"S_{{{N}}} = \\frac{{{N}}}{{2}} ({A1} + {An})", "explanation": "Aplicamos la fórmula de suma (sumatoria) de los primeros N términos de una sucesión aritmética."},
                {"latex": f"S_{{{N}}} = \\frac{{{N}}}{{2}} ({A1 + An}) = {Total}", "explanation": "Realizamos el cálculo final."}
            ],
            "hints": ["Primero calcula cuántos asientos hay en la ÚLTIMA fila usando a_n = a_1 + (n-1)d. Luego usa la fórmula de la suma de Gauss: S = n*(a_1 + a_n)/2"]
        }
        problems.append(p)

    save_problems(11, problems)

if __name__ == "__main__":
    generate_7th()
    generate_8th()
    generate_9th()
    generate_10th()
    generate_11th()
    print("Successfully generated advanced math curriculum problems.")
