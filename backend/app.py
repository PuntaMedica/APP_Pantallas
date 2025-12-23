from flask import Flask, jsonify
from flask_cors import CORS
import pandas as pd

app = Flask(__name__)
CORS(app)

@app.route('/medicos', methods=['GET'])
def get_medicos():
    # Lee la hoja "Real 2025"
    df = pd.read_excel('DIRECTORIO.xlsx', sheet_name='Super correccion ultima nuevo', engine='openpyxl')
    
    # Filtra sólo los activos (✓)
    df = df[df['Activo'] == '✓']
    
    # Columnas que necesitas enviar
    columnas_necesarias = [
        'Categorias',
        'Especialidad',
        'Nombre',
        'Apellido Paterno',
        'Apellido Materno',
        'Subespecialidad',
        'Extensión',
        'Piso',
        'Consultorio'
    ]
    df = df[columnas_necesarias].fillna('')
    
    # Convierte a lista de dicts y ordena alfabéticamente
    medicos = df.to_dict(orient='records')
    medicos.sort(key=lambda x: (
        x['Nombre'].lower(), 
        x['Apellido Paterno'].lower(), 
        x['Apellido Materno'].lower()
    ))
    
    return jsonify(medicos)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5900)
