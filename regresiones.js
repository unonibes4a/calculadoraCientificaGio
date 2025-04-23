 
class RegresionPolinomicaGio {
    constructor(parentContainer) {
        
        this.parentContainer = parentContainer;
        
  
        this.coeficientes = [];
        this.datosX = [];
        this.datosY = [];
        this.ecuacion = "";
        this.r2 = 0;
        this.grafico = null;
        
      
        this.crearEstructura();
        
 
        this.inputElement = this.parentContainer.querySelector('#inputDatos');
        this.aplicarEstilos(this.inputElement,     ` background-color:rgb(228, 228, 228);` ),
        this.botonCalcular = this.parentContainer.querySelector('#btnCalcular');
        this.aplicarEstilos(this.botonCalcular,   `border: 0.4px solid #ececec;
background-color: #666666;
border-radius: 13px;` ),
        this.botonComprobar = this.parentContainer.querySelector('#btnComprobar');
        this.botonLimpiar = this.parentContainer.querySelector('#btnLimpiar');
        this.selectorGrado = this.parentContainer.querySelector('#gradoPolinomio');
        this.divResultado = this.parentContainer.querySelector('#resultado');
        this.canvasGrafico = this.parentContainer.querySelector('#grafico');

         this.aplicarEstilos(this.canvasGrafico,   ` background-color:rgb(255, 255, 255);` ),
     
        this.inicializarEstilos();
        this.inicializarEventos();
        
   
        this.inputElement.value = "1,1.2\n2,1.9\n3,3.2\n4,5\n5,6.2\n6,7.5\n7,9.1";
    }
    

  aplicarEstilos=(elemento, estilosStr)=> {
 
   
    const estilosObj = {};
    
 
    const reglas = estilosStr
        .replace(/\s+/g, ' ')  
        .trim()  
        .split(';')  
        .filter(regla => regla.includes(':'));  
    
 
    reglas.forEach(regla => {
        const [propiedad, valor] = regla.split(':').map(item => item.trim());
        if (propiedad && valor) {
         
            const propiedadJS = propiedad.replace(/-([a-z])/g, (match, letra) => letra.toUpperCase());
            estilosObj[propiedadJS] = valor;
        }
    });
    
 
    Object.assign(elemento.style, estilosObj);
}
    crearEstructura() {
 
        this.parentContainer.innerHTML = `
            <div class="regpoly-container">
                <h1>Regresión Lineal Polinómica</h1>
                <p>Ingrese los datos en formato "x,y" (un par por línea):</p>
                <textarea id="inputDatos" placeholder="1,2&#10;2,4&#10;3,6&#10;4,8"></textarea>
                
                <div>
                    <label for="gradoPolinomio">Grado del polinomio:</label>
                    <select id="gradoPolinomio">
                        <option value="1">1 (Lineal simple)</option>
                        <option value="2">2 (Cuadrático)</option>
                        <option value="3">3 (Cúbico)</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                    </select>
                </div>
                
                <div class="regpoly-button-container">
                    <button id="btnCalcular" class="regpoly-button2">Calcular Regresión</button>
                    <button id="btnComprobar" class="regpoly-button2">Comprobar con Valor</button>
                    <button id="btnLimpiar" class="regpoly-button2">Limpiar</button>
                </div>
                
                <div id="resultado" class="regpoly-resultado"></div>
                <div class="regpoly-chart-container">
                    <canvas id="grafico"></canvas>
                </div>
            </div>
        `;
    }
    
    inicializarEstilos() {
       
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            .regpoly-container {
                font-family: Arial, sans-serif;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
                border: 1px solid #ddd;
                border-radius: 8px;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
 display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	justify-content: flex-start;
	align-items: stretch;
	align-content: stretch;


    height: fit-content;

            }
    .regpoly-container *{
     width: 80&;
margin: auto;
padding: auto;
    }
            
            .regpoly-container textarea {
                width: 100%;
                height: 150px;
                margin-bottom: 15px;
                padding: 10px;
                border-radius: 5px;
                border: 1px solid #ccc;
                
            }
            
            .regpoly-button {
                background-color:rgb(43, 43, 43);
                color: white;
                padding: 10px 15px;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                margin-right: 10px;
                margin-bottom: 10px;
            }
            
            .regpoly-button:hover {
                background-color:rgb(43, 43, 43);
            }
            
            .regpoly-resultado {
                margin-top: 20px;
                padding: 15px;
                background-color:rgb(43, 43, 43);
                border-radius: 5px;
                border-left: 4px solidrgba(179, 179, 179, 0.68);
            }
            
            .regpoly-formula {
                font-size: 1.2em;
                margin: 15px 0;
                font-weight: bold;
            }
            
            .regpoly-chart-container {
                margin-top: 20px;
                height: 400px;
            }
            
            .regpoly-table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 15px;
                color.rgb(0, 0, 0);,
            }
            
            .regpoly-table th, .regpoly-table td {
                border: 1px solid #ddd;
                padding: 8px;
                text-align: left;
            }
            
            .regpoly-table th {
                background-color:rgb(43, 43, 43);
            }
            
            .regpoly-table tr:nth-child(even) {
                background-color:rgb(43, 43, 43);
            }
            
            .regpoly-error {
                color: red;
                margin-top: 10px;
            }
            
            .regpoly-button-container {
                margin-top: 15px;
            }
        `;
        
       
        document.head.appendChild(styleElement);
    }
    
    inicializarEventos() {
        this.botonCalcular.addEventListener('click', () => this.calcularRegresion());
        this.botonComprobar.addEventListener('click', () => this.comprobarValor());
        this.botonLimpiar.addEventListener('click', () => this.limpiar());
    }
    
    parsearDatos() {
        const lineas = this.inputElement.value.trim().split('\n');
        const datosX = [];
        const datosY = [];
        
        for (const linea of lineas) {
            if (linea.trim() === '') continue;
            
            const partes = linea.split(',');
            if (partes.length !== 2) {
                throw new Error(`Formato inválido en la línea: ${linea}. Use formato "x,y"`);
            }
            
            const x = parseFloat(partes[0].trim());
            const y = parseFloat(partes[1].trim());
            
            if (isNaN(x) || isNaN(y)) {
                throw new Error(`Valores numéricos inválidos en la línea: ${linea}`);
            }
            
            datosX.push(x);
            datosY.push(y);
        }
        
        if (datosX.length < 2) {
            throw new Error('Se necesitan al menos 2 puntos para calcular la regresión');
        }
        
        return { datosX, datosY };
    }
    
    calcularRegresion() {
        try {
            
            this.divResultado.innerHTML = '';
            if (this.grafico) {
                this.grafico.destroy();
            }
            
    
            const { datosX, datosY } = this.parsearDatos();
            this.datosX = datosX;
            this.datosY = datosY;
            
          
            const grado = parseInt(this.selectorGrado.value);
            
       
            this.coeficientes = this.calcularCoeficientesPolinomicos(datosX, datosY, grado);
            
         
            this.ecuacion = this.generarEcuacion(this.coeficientes);
            
          
            this.r2 = this.calcularRCuadrado(datosX, datosY, this.coeficientes);
            
      
            this.mostrarResultados();
            
       
            this.dibujarGrafico();
            
        } catch (error) {
            const errorDiv = document.createElement('div');
            errorDiv.classList.add('regpoly-error');
            errorDiv.textContent = `Error: ${error.message}`;
            this.divResultado.appendChild(errorDiv);
        }
    }
    
    calcularCoeficientesPolinomicos(x, y, grado) {
        if (grado >= x.length) {
            throw new Error(`El grado del polinomio (${grado}) debe ser menor que el número de puntos (${x.length})`);
        }
        
         
        const X = [];
        for (let i = 0; i < x.length; i++) {
            const fila = [];
            for (let j = 0; j <= grado; j++) {
                fila.push(Math.pow(x[i], j));
            }
            X.push(fila);
        }
        
   
        const matrizX = math.matrix(X);
        const matrizY = math.matrix(y);
        
  
        const XT = math.transpose(matrizX);
        const XTX = math.multiply(XT, matrizX);
        const XTX_inv = math.inv(XTX);
        const XTX_inv_XT = math.multiply(XTX_inv, XT);
        const coeficientes = math.multiply(XTX_inv_XT, matrizY);
        
     
        return Array.from(math.flatten(coeficientes)._data);
    }
    
    evaluarPolinomio(x, coeficientes) {
        let resultado = 0;
        for (let i = 0; i < coeficientes.length; i++) {
            resultado += coeficientes[i] * Math.pow(x, i);
        }
        return resultado;
    }
    
    calcularRCuadrado(x, y, coeficientes) {
        
        const yPromedio = y.reduce((a, b) => a + b, 0) / y.length;
        
     
        let sst = 0;
        for (let i = 0; i < y.length; i++) {
            sst += Math.pow(y[i] - yPromedio, 2);
        }
        
      
        let ssr = 0;
        for (let i = 0; i < x.length; i++) {
            const yPred = this.evaluarPolinomio(x[i], coeficientes);
            ssr += Math.pow(y[i] - yPred, 2);
        }
        
  
        return 1 - (ssr / sst);
    }
    
    generarEcuacion(coeficientes) {
        let ecuacion = 'y = ';
        
        for (let i = 0; i < coeficientes.length; i++) {
            const coef = coeficientes[i];
            
       
            const coefFormateado = Math.abs(coef) < 0.001 ? 
                                  coef.toExponential(4) : 
                                  coef.toFixed(4).replace(/\.?0+$/, '');
            
            if (i === 0) {
          
                ecuacion += coefFormateado;
            } else {
          
                if (coef >= 0 && i > 0) {
                    ecuacion += ' + ';
                } else if (coef < 0) {
                    ecuacion += ' - ';
                }
                
             
                if (i === 1) {
                    ecuacion += `${Math.abs(coefFormateado)}x`;
                } else {
                    ecuacion += `${Math.abs(coefFormateado)}x^${i}`;
                }
            }
        }
        
        return ecuacion;
    }
    
    mostrarResultados() {
       
        const container = document.createElement('div');
        
 
        const titulo = document.createElement('h2');
        titulo.textContent = 'Resultados de la Regresión';
        container.appendChild(titulo);
        
     
        const formula = document.createElement('div');
        formula.classList.add('regpoly-formula');
        formula.textContent = this.ecuacion;
        container.appendChild(formula);
        
      
        const r2Text = document.createElement('p');
        r2Text.textContent = `Coeficiente de determinación (R²): ${this.r2.toFixed(4)}`;
        container.appendChild(r2Text);
        
        
        container.appendChild(document.createElement('h3')).textContent = 'Coeficientes:';
        
        const tablaCoef = document.createElement('table');
        tablaCoef.classList.add('regpoly-table');
        
       
        const trHead = document.createElement('tr');
        const thTerm = document.createElement('th');
        thTerm.textContent = 'Término';
        const thCoef = document.createElement('th');
        thCoef.textContent = 'Coeficiente';
        trHead.appendChild(thTerm);
        trHead.appendChild(thCoef);
        tablaCoef.appendChild(trHead);
        
     
        for (let i = 0; i < this.coeficientes.length; i++) {
            const tr = document.createElement('tr');
            
            const tdTerm = document.createElement('td');
            tdTerm.textContent = i === 0 ? 'Constante' : (i === 1 ? 'x' : `x^${i}`);
            
            const tdCoef = document.createElement('td');
            tdCoef.textContent = this.coeficientes[i].toFixed(6);
            
            tr.appendChild(tdTerm);
            tr.appendChild(tdCoef);
            tablaCoef.appendChild(tr);
        }
        
        container.appendChild(tablaCoef);
        
   
        container.appendChild(document.createElement('h3')).textContent = 'Valores Observados vs. Predichos:';
        
        const tablaValues = document.createElement('table');
        tablaValues.classList.add('regpoly-table');
        
    
        const trHeadValues = document.createElement('tr');
        ['X', 'Y (Observado)', 'Y (Predicho)', 'Residuo'].forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            trHeadValues.appendChild(th);
        });
        tablaValues.appendChild(trHeadValues);
        
      
        for (let i = 0; i < this.datosX.length; i++) {
            const tr = document.createElement('tr');
            
            const predicho = this.evaluarPolinomio(this.datosX[i], this.coeficientes);
            const residuo = this.datosY[i] - predicho;
            
           
            [
                this.datosX[i],
                this.datosY[i],
                predicho.toFixed(4),
                residuo.toFixed(4)
            ].forEach(value => {
                const td = document.createElement('td');
                td.textContent = value;
                tr.appendChild(td);
            });
            
            tablaValues.appendChild(tr);
        }
        
        container.appendChild(tablaValues);
        
       
        this.divResultado.appendChild(container);
    }
    
    dibujarGrafico() {
        const ctx = this.canvasGrafico.getContext('2d');
        
        
        const minX = Math.min(...this.datosX);
        const maxX = Math.max(...this.datosX);
        
        
        const paso = (maxX - minX) / 100;
        const puntosRegresionX = [];
        const puntosRegresionY = [];
        
        for (let x = minX - paso * 10; x <= maxX + paso * 10; x += paso) {
            puntosRegresionX.push(x);
            puntosRegresionY.push(this.evaluarPolinomio(x, this.coeficientes));
        }
        
 
        this.grafico = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [
                    {
                        label: 'Datos Originales',
                        data: this.datosX.map((x, i) => ({ x, y: this.datosY[i] })),
                        backgroundColor: 'rgba(54, 162, 235, 0.7)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        pointRadius: 6,
                        pointHoverRadius: 8
                    },
                    {
                        label: 'Curva de Regresión',
                        data: puntosRegresionX.map((x, i) => ({ x, y: puntosRegresionY[i] })),
                        backgroundColor: 'rgba(255, 99, 132, 0)',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 2,
                        pointRadius: 0,
                        showLine: true,
                        tension: 0.1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'X'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Y'
                        }
                    }
                }
            }
        });
    }
    
    comprobarValor() {
        if (!this.coeficientes || this.coeficientes.length === 0) {
            alert('Primero debes calcular la regresión');
            return;
        }
        
        const valorX = prompt('Ingrese el valor de X para evaluar en la ecuación:');
        if (valorX === null) return; 
        
        const x = parseFloat(valorX);
        if (isNaN(x)) {
            alert('Por favor ingrese un número válido');
            return;
        }
        
        const resultado = this.evaluarPolinomio(x, this.coeficientes);
        
        alert(`Para x = ${x}, y = ${resultado.toFixed(6)}`);
    }
    
    limpiar() {
        this.inputElement.value = '';
        this.divResultado.innerHTML = '';
        this.coeficientes = [];
        this.datosX = [];
        this.datosY = [];
        this.ecuacion = '';
        this.r2 = 0;
        
        if (this.grafico) {
            this.grafico.destroy();
            this.grafico = null;
        }
    }
}
