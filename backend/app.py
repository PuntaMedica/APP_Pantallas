from flask import Flask, jsonify, g
from flask_cors import CORS
# --- CÓDIGO ANTERIOR COMENTADO (Excel) ---
# import pandas as pd
import pyodbc # --- NUEVO CÓDIGO SQL SERVER ---

app = Flask(__name__)
CORS(app)

# --- NUEVA CONFIGURACIÓN SQL SERVER ---
SQL_CONN_STR = (
    "Driver={ODBC Driver 17 for SQL Server};"
    "Server=DESKTOP-EO74OCH\\SQLEXPRESS;"
    "Database=gestion_imagenes;"
    "Trusted_Connection=yes;"
    "Encrypt=no;"
    "TrustServerCertificate=yes;"
)

def get_db():
    if 'db' not in g:
        g.db = pyodbc.connect(SQL_CONN_STR)
    return g.db

@app.teardown_appcontext
def close_db(exception):
    db = g.pop('db', None)
    if db is not None:
        db.close()

# ===================== INICIALIZACIÓN DE TABLA DIRECTORIO =====================
def init_directorio_table():
    db = get_db()
    cursor = db.cursor()
    # Creamos la tabla basada en las columnas necesarias del Excel
    cursor.execute('''
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='directorio_medico' AND xtype='U')
        CREATE TABLE directorio_medico (
            id INT IDENTITY(1,1) PRIMARY KEY,
            Categorias NVARCHAR(100),
            Especialidad NVARCHAR(150),
            Nombre NVARCHAR(150),
            Apellido_Paterno NVARCHAR(150),
            Apellido_Materno NVARCHAR(150),
            Subespecialidad NVARCHAR(250),
            Extension NVARCHAR(50),
            Piso NVARCHAR(50),
            Consultorio NVARCHAR(50),
            Activo NVARCHAR(10) DEFAULT '✓'
        )
    ''')
    db.commit()

@app.route('/medicos', methods=['GET'])
def get_medicos():
    # --- CÓDIGO ANTERIOR COMENTADO (Excel) ---
    # df = pd.read_excel('DIRECTORIO.xlsx', sheet_name='Super correccion ultima nuevo', engine='openpyxl')
    # df = df[df['Activo'] == '✓']
    # columnas_necesarias = ['Categorias', 'Especialidad', 'Nombre', 'Apellido Paterno', ...]
    # df = df[columnas_necesarias].fillna('')
    # medicos = df.to_dict(orient='records')
    # medicos.sort(key=lambda x: (x['Nombre'].lower(), x['Apellido Paterno'].lower(), x['Apellido Materno'].lower()))

    # --- LÓGICA SQL SERVER ---
    try:
        db = get_db()
        cursor = db.cursor()
        
        # Consultamos los datos filtrando por Activo y ordenando alfabéticamente desde SQL
        query = """
            SELECT 
                Categorias, Especialidad, Nombre, 
                Apellido_Paterno AS [Apellido Paterno], 
                Apellido_Materno AS [Apellido Materno], 
                Subespecialidad, 
                Extension AS [Extensión], 
                Piso, Consultorio
            FROM directorio_medico
            WHERE Activo = '✓'
            ORDER BY Nombre ASC, [Apellido_Paterno] ASC, [Apellido_Materno] ASC
        """
        cursor.execute(query)
        
        columns = [column[0] for column in cursor.description]
        medicos = []
        for row in cursor.fetchall():
            # Reemplazamos None por strings vacíos para mantener compatibilidad con fillna('')
            medicos.append(dict(zip(columns, [x if x is not None else "" for x in row])))
            
        return jsonify(medicos)
        
    except Exception as e:
        print(f"Error en get_medicos: {e}")
        return jsonify({"error": "Error al consultar el directorio"}), 500

if __name__ == '__main__':
    with app.app_context():
        init_directorio_table()
    app.run(debug=True, host='0.0.0.0', port=5900)