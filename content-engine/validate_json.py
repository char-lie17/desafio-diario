import json
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MATH_DIR = os.path.join(BASE_DIR, "..", "src", "content", "math")

def validate():
    grades = [7, 8, 9, 10, 11]
    errors = 0
    
    for grade in grades:
        filepath = os.path.join(MATH_DIR, f"grade-{grade}.json")
        if not os.path.exists(filepath):
            print(f"❌ Error: {filepath} does not exist.")
            errors += 1
            continue
            
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                problems = json.load(f)
        except Exception as e:
            print(f"❌ Error parsing {filepath}: {e}")
            errors += 1
            continue
            
        print(f"Grade {grade}: Loaded {len(problems)} problems.")
        
        if len(problems) < 10:
            print(f"Error: Grade {grade} has less than 10 problems.")
            errors += 1
            
        for idx, p in enumerate(problems):
            # Check required keys
            required_keys = ["id", "grade", "category", "subcategory", "difficulty", "title", "question", "latex", "answer", "solution", "hints"]
            for key in required_keys:
                if key not in p:
                    print(f"Error in Grade {grade} index {idx}: Missing key '{key}'")
                    errors += 1
                elif p[key] is None or p[key] == "":
                    print(f"Error in Grade {grade} index {idx}: Empty or null value for key '{key}'")
                    errors += 1
            
            # Check solution list structure
            sol = p.get("solution", [])
            if not isinstance(sol, list) or len(sol) == 0:
                print(f"Error in Grade {grade} index {idx}: Solution must be a non-empty list.")
                errors += 1
            else:
                for s_idx, step in enumerate(sol):
                    if "latex" not in step or "explanation" not in step:
                        print(f"Error in Grade {grade} index {idx} solution step {s_idx}: Missing 'latex' or 'explanation'.")
                        errors += 1

            # Check that answer is a string and hints is a list
            if not isinstance(p.get("answer"), str):
                print(f"Error in Grade {grade} index {idx}: Answer must be a string.")
                errors += 1
            if not isinstance(p.get("hints"), list) or len(p.get("hints", [])) == 0:
                print(f"Error in Grade {grade} index {idx}: Hints must be a non-empty list.")
                errors += 1

    if errors == 0:
        print("SUCCESS: All curriculum problems are 100% valid and free of structural bugs!")
    else:
        print(f"FAILED: Found {errors} structural errors in JSON files.")
        exit(1)

if __name__ == "__main__":
    validate()
