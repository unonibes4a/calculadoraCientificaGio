
math.config({
    number: 'number',
    precision: 64
});


math.import({
    ln: function(x) {
        return math.log(x, math.e);
    }
});


document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', function() {

        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
     
        this.classList.add('active');
        

        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
  
        document.getElementById(this.dataset.tab + '-tab').classList.add('active');
    });
});


document.querySelectorAll('.collapsible').forEach(coll => {
    coll.addEventListener('click', function() {
        this.classList.toggle('active-collapsible');
        const content = this.nextElementSibling;
        if (content.style.maxHeight) {
            content.style.maxHeight = null;
        } else {
            content.style.maxHeight = content.scrollHeight + "px";
        }
    });
});


document.querySelectorAll('input[name="operation"]').forEach(radio => {
    radio.addEventListener('change', function() {
        if (this.value === 'numerical-integral') {
            document.getElementById('integration-options').style.display = 'block';
        } else {
            document.getElementById('integration-options').style.display = 'none';
        }
    });
});


function calculateDerivativeWithSteps(node) {
    const steps = [];
    let result;
    
  
    steps.push(`<div class="step">Aplicando reglas de derivación...</div>`);
    
    try {
        result = math.derivative(node, 'x');
        steps.push(`<div class="step">Derivada inicial: ${result.toString()}</div>`);
        

        result = handleLogarithmicDerivatives(result);
        
  
        steps.push(`<div class="step">Simplificando expresión final...</div>`);
        const simplified = math.simplify(result);
        steps.push(`<div class="step">Resultado simplificado: ${simplified.toString()}</div>`);
        
        return {
            result: simplified,
            steps: steps.join('')
        };
    } catch (error) {
        steps.push(`<div class="step">Error en la derivación: ${error.message}</div>`);
        steps.push(`<div class="step">Aplicando reglas específicas para logaritmos...</div>`);
        

        result = calculateDerivativeManually(node);
        steps.push(`<div class="step">Derivada calculada manualmente: ${result.toString()}</div>`);
        
        return {
            result: result,
            steps: steps.join('')
        };
    }
}


function calculateDerivativeManually(node) {

    if (node.isFunctionNode && (node.fn.name === 'ln' || node.fn.name === 'log')) {
        const arg = node.args[0];
        
 
        if (arg.isSymbolNode && arg.name === 'x') {
            return math.parse('1/x');
        }
        
    
        const argDerivative = math.derivative(arg, 'x');
        return new math.OperatorNode('*', 'multiply', [
            argDerivative,
            new math.OperatorNode('/', 'divide', [
                new math.ConstantNode(1),
                arg
            ])
        ]);
    }
    

    return math.derivative(node, 'x');
}


function handleLogarithmicDerivatives(node) {
 
    if (node.isFunctionNode && node.fn.name === 'log') {
        const arg = node.args[0];
        
        if (arg.isSymbolNode && arg.name === 'x') {
      
            return math.parse('1/x');
        }
    }
    

    return node;
}


function calculateIntegralWithSteps(node) {
    const steps = [];
    let result;
    
  
    if (node.isOperatorNode && node.op === '+') {
        steps.push(`<div class="step">Integrando término por término (suma)...</div>`);
        const terms = node.args.map(arg => {
            const integral = integrateWithRules(arg);
            steps.push(`<div class="step">∫(${arg.toString()}) dx = ${integral.toString()}</div>`);
            return integral;
        });
        result = new math.OperatorNode('+', 'add', terms);
    } else {

        steps.push(`<div class="step">Aplicando reglas de integración...</div>`);
        result = integrateWithRules(node);
        steps.push(`<div class="step">∫(${node.toString()}) dx = ${result.toString()}</div>`);
    }
    
  
    steps.push(`<div class="step">Simplificando expresión final...</div>`);
    const simplified = math.simplify(result);
    steps.push(`<div class="step">Resultado simplificado: ${simplified.toString()}</div>`);
    
    return {
        result: simplified,
        steps: steps.join('')
    };
}


function integrateWithRules(node) {

    if (node.isFunctionNode && node.fn.name === 'ln') {
        const arg = node.args[0];
        if (arg.isSymbolNode && arg.name === 'x') {
            return math.parse('x*ln(x) - x');
        }
    }
    

    if (isReciprocal(node)) {
        if (node.isOperatorNode && node.op === '/') {
            const numerator = node.args[0];
            const denominator = node.args[1];
            
            if (denominator.isSymbolNode && denominator.name === 'x') {
                if (numerator.isConstantNode) {
          
                    return new math.OperatorNode('*', 'multiply', [
                        numerator,
                        math.parse('ln(abs(x))')
                    ]);
                }
            }
        }
    }
    

    if (node.isOperatorNode && node.op === '/') {
        const numerator = node.args[0];
        const denominator = node.args[1];
        
        if (numerator.isConstantNode && numerator.value === 1 && 
            denominator.isSymbolNode && denominator.name === 'x') {
            return math.parse('ln(abs(x))');
        }
    }
    

    if (node.isOperatorNode && node.op === '^') {
        const base = node.args[0];
        const exponent = node.args[1];
        
        if (base.isSymbolNode && base.name === 'x' && exponent.isConstantNode) {
            if (exponent.value === -1) {
                return math.parse('ln(abs(x))');
            }
            const newExponent = exponent.value + 1;
            return new math.OperatorNode('/', 'divide', [
                new math.OperatorNode('^', 'pow', [
                    base,
                    new math.ConstantNode(newExponent)
                ]),
                new math.ConstantNode(newExponent)
            ]);
        }
    }
    
    
    if (node.isSymbolNode && node.name === 'x') {
        return math.parse('(1/2)*x^2');
    }
    
   
    if (node.isConstantNode) {
        return new math.OperatorNode('*', 'multiply', [
            node,
            math.parse('x')
        ]);
    }
    

    if (node.isFunctionNode) {
        const fnName = node.fn.name;
        const arg = node.args[0];
        
     
        if (fnName === 'sin') {
            if (arg.isSymbolNode && arg.name === 'x') {
                return math.parse('-cos(x)');
            }
  
            if (arg.isOperatorNode && arg.op === '+' && arg.args.length === 2) {
                const linearTerm = arg.args.find(term => 
                    term.isOperatorNode && term.op === '*' && 
                    term.args.some(a => a.isSymbolNode && a.name === 'x')
                );
                
                if (linearTerm) {
                    const coefficient = linearTerm.args.find(a => a.isConstantNode);
                    if (coefficient) {
                        return new math.OperatorNode('/', 'divide', [
                            math.parse(`-cos(${arg.toString()})`),
                            coefficient
                        ]);
                    }
                }
            }
        }
        
    
        if (fnName === 'cos') {
            if (arg.isSymbolNode && arg.name === 'x') {
                return math.parse('sin(x)');
            }
    
            if (arg.isOperatorNode && arg.op === '+' && arg.args.length === 2) {
                const linearTerm = arg.args.find(term => 
                    term.isOperatorNode && term.op === '*' && 
                    term.args.some(a => a.isSymbolNode && a.name === 'x')
                );
                
                if (linearTerm) {
                    const coefficient = linearTerm.args.find(a => a.isConstantNode);
                    if (coefficient) {
                        return new math.OperatorNode('/', 'divide', [
                            math.parse(`sin(${arg.toString()})`),
                            coefficient
                        ]);
                    }
                }
            }
        }
        
   
        if (fnName === 'exp') {
            if (arg.isSymbolNode && arg.name === 'x') {
                return math.parse('exp(x)');
            }
         
            if (arg.isOperatorNode && arg.op === '+' && arg.args.length === 2) {
                const linearTerm = arg.args.find(term => 
                    term.isOperatorNode && term.op === '*' && 
                    term.args.some(a => a.isSymbolNode && a.name === 'x')
                );
                
                if (linearTerm) {
                    const coefficient = linearTerm.args.find(a => a.isConstantNode);
                    if (coefficient) {
                        return new math.OperatorNode('/', 'divide', [
                            math.parse(`exp(${arg.toString()})`),
                            coefficient
                        ]);
                    }
                }
            }
        }
    }
    
   
    if (node.isOperatorNode && node.op === '^' && 
        node.args[0].isSymbolNode && node.args[0].name === 'e' &&
        node.args[1].isSymbolNode && node.args[1].name === 'x') {
        return math.parse('exp(x)');
    }
    
  
    if (node.isOperatorNode && node.op === '+') {
        return new math.OperatorNode('+', 'add', 
            node.args.map(arg => integrateWithRules(arg))
        );
    }
    

    if (node.isOperatorNode && node.op === '-') {
        if (node.args.length === 2) {
            return new math.OperatorNode('-', 'subtract', [
                integrateWithRules(node.args[0]),
                integrateWithRules(node.args[1])
            ]);
        } else if (node.args.length === 1) {
      
            return new math.OperatorNode('-', 'unaryMinus', [
                integrateWithRules(node.args[0])
            ]);
        }
    }
    

    if (node.isOperatorNode && node.op === '*') {
        const constants = node.args.filter(arg => arg.isConstantNode);
        const variables = node.args.filter(arg => !arg.isConstantNode);
        
        if (constants.length >= 1 && variables.length >= 1) {
     
            let constantValue = 1;
            constants.forEach(c => constantValue *= c.value);
            const constantNode = new math.ConstantNode(constantValue);
            
   
            if (variables.length === 1) {
                const integral = integrateWithRules(variables[0]);
                return new math.OperatorNode('*', 'multiply', [
                    constantNode,
                    integral
                ]);
            } else {
            
                const product = new math.OperatorNode('*', 'multiply', variables);
                const integral = integrateWithRules(product);
                return new math.OperatorNode('*', 'multiply', [
                    constantNode,
                    integral
                ]);
            }
        }
    }
    
  
    throw new Error(`No se encontró regla de integración para: ${node.toString()}`);
}


function isReciprocal(node) {
    if (node.isOperatorNode && node.op === '/') {
        const numerator = node.args[0];
        const denominator = node.args[1];
        
  
        if (numerator.isConstantNode && denominator.isSymbolNode && denominator.name === 'x') {
            return true;
        }
        
    
        if (numerator.isConstantNode && denominator.isSymbolNode && denominator.name === 'x') {
            return true;
        }
    }
    
    return false;
}



function generateNumericalIntegration(funcStr, lowerLimit, upperLimit, segments, method) {
const steps = [];
let result = 0;

steps.push(`<div class="step">Calculando la integral numérica de ${funcStr} desde ${lowerLimit} hasta ${upperLimit} usando ${segments} segmentos.</div>`);

try {

const func = math.parse(funcStr);
const evaluatedFunc = x => {
    try {
        return func.evaluate({ x: x });
    } catch (error) {
        throw new Error(`Error al evaluar f(${x}): ${error.message}`);
    }
};


const numPoints = 200;
const xValues = [];
const yValues = [];
const dx = (upperLimit - lowerLimit) / (numPoints - 1);

for (let i = 0; i < numPoints; i++) {
    const x = lowerLimit + i * dx;
    xValues.push(x);
    try {
        yValues.push(evaluatedFunc(x));
    } catch (error) {
        yValues.push(null); 
    }
}


switch (method) {
    case 'trapezoid':
        result = trapezoidRule(evaluatedFunc, lowerLimit, upperLimit, segments);
        steps.push(`<div class="step">Aplicando la regla del trapecio con ${segments} segmentos.</div>`);
        break;
    case 'simpson':
        if (segments % 2 !== 0) {
            segments += 1; 
        }
        result = simpsonRule(evaluatedFunc, lowerLimit, upperLimit, segments);
        steps.push(`<div class="step">Aplicando la regla de Simpson con ${segments} segmentos.</div>`);
        break;
    case 'romberg':
        result = rombergIntegration(evaluatedFunc, lowerLimit, upperLimit, Math.min(6, Math.log2(segments)));
        steps.push(`<div class="step">Aplicando el método de Romberg.</div>`);
        break;
    default:
        throw new Error("Método de integración no reconocido");
}

steps.push(`<div class="step">Resultado de la integración numérica: ${result.toFixed(6)}</div>`);


const areaXValues = [];
const areaYValues = [];
const h = (upperLimit - lowerLimit) / segments;

for (let i = 0; i <= segments; i++) {
    const x = lowerLimit + i * h;
    areaXValues.push(x);
    try {
        areaYValues.push(evaluatedFunc(x));
    } catch (error) {
        areaYValues.push(0); 
    }
}

return {
    result: result,
    steps: steps.join(''),
    plotData: {
        xValues: xValues,
        yValues: yValues,
        areaXValues: areaXValues,
        areaYValues: areaYValues,
        lowerLimit: lowerLimit,
        upperLimit: upperLimit
    }
};
} catch (error) {
return {
    result: null,
    steps: `<div class="step error">Error en la integración numérica: ${error.message}</div>`,
    plotData: null
};
}
}


function trapezoidRule(func, a, b, n) {
const h = (b - a) / n;
let sum = 0.5 * (func(a) + func(b));

for (let i = 1; i < n; i++) {
const x = a + i * h;
sum += func(x);
}

return h * sum;
}


function simpsonRule(func, a, b, n) {
const h = (b - a) / n;
let sum = func(a) + func(b);

for (let i = 1; i < n; i++) {
const x = a + i * h;
sum += func(x) * (i % 2 === 0 ? 2 : 4);
}

return (h / 3) * sum;
}


function rombergIntegration(func, a, b, levels) {
const R = new Array(levels + 1);
for (let i = 0; i <= levels; i++) {
R[i] = new Array(levels + 1);
}


R[0][0] = 0.5 * (b - a) * (func(a) + func(b));


for (let i = 1; i <= levels; i++) {
const h = (b - a) / Math.pow(2, i);
let sum = 0;

for (let k = 1; k <= Math.pow(2, i) - 1; k += 2) {
    sum += func(a + k * h);
}

R[i][0] = 0.5 * R[i-1][0] + h * sum;
}


for (let j = 1; j <= levels; j++) {
for (let i = j; i <= levels; i++) {
    R[i][j] = R[i][j-1] + (R[i][j-1] - R[i-1][j-1]) / (Math.pow(4, j) - 1);
}
}

return R[levels][levels];
}


function plotNumericalIntegration(plotData) {
if (!plotData) return;

const chartContainer = document.getElementById('chart-container');
chartContainer.style.display = 'block';


const curveData = {
x: plotData.xValues,
y: plotData.yValues,
type: 'scatter',
mode: 'lines',
name: 'f(x)',
line: {
    color: 'rgb(52, 152, 219)',
    width: 2
}
};


const areaData = {
x: plotData.areaXValues,
y: plotData.areaYValues,
type: 'scatter',
mode: 'lines',
name: 'Área',
fill: 'tozeroy',
fillcolor: 'rgba(52, 152, 219, 0.3)',
line: {
    color: 'rgba(52, 152, 219, 0.5)',
    width: 0
}
};


const layout = {
title: 'Visualización de Integración Numérica',
xaxis: {
    title: 'x',
    zeroline: true,
    range: [plotData.lowerLimit, plotData.upperLimit]
},
yaxis: {
    title: 'f(x)',
    zeroline: true
},
showlegend: true,
legend: {
    x: 1,
    xanchor: 'right',
    y: 1
},
margin: {
    l: 50,
    r: 50,
    b: 50,
    t: 50,
    pad: 4
}
};

Plotly.newPlot('chart-container', [curveData, areaData], layout);
}


function integrationByParts(funcStr, uStr, dvStr) {
const steps = [];

steps.push(`<div class="step">Aplicando integración por partes a la expresión: ${funcStr}</div>`);
steps.push(`<div class="step">Usando u = ${uStr} y dv = ${dvStr}</div>`);

try {

const uFunc = math.parse(uStr);
const dvFunc = math.parse(dvStr);


const du = math.derivative(uFunc, 'x');
steps.push(`<div class="step">Calculando du/dx = ${du.toString()}</div>`);


const vIntegral = integrateWithRules(dvFunc);
steps.push(`<div class="step">Calculando v = ∫(${dvFunc.toString()}) dx = ${vIntegral.toString()}</div>`);


steps.push(`<div class="step">Aplicando la fórmula ∫u·dv = u·v - ∫v·du</div>`);


const uv = new math.OperatorNode('*', 'multiply', [uFunc, vIntegral]);
steps.push(`<div class="step">Primer término u·v = ${uFunc.toString()} · ${vIntegral.toString()} = ${uv.toString()}</div>`);


const vdu = new math.OperatorNode('*', 'multiply', [vIntegral, du]);
steps.push(`<div class="step">Integrando el segundo término ∫v·du = ∫(${vIntegral.toString()} · ${du.toString()}) dx</div>`);

let vduIntegral;
try {
    vduIntegral = integrateWithRules(vdu);
    steps.push(`<div class="step">∫v·du = ${vduIntegral.toString()}</div>`);
} catch (error) {
    steps.push(`<div class="step error">No se pudo integrar v·du directamente. Podría requerir métodos adicionales.</div>`);
    vduIntegral = math.parse(`∫(${vdu.toString()}) dx`);
}


const result = new math.OperatorNode('-', 'subtract', [uv, vduIntegral]);
steps.push(`<div class="step">Resultado final: ${uv.toString()} - ${vduIntegral.toString()} = ${result.toString()}</div>`);


try {
    const simplified = math.simplify(result);
    steps.push(`<div class="step">Expresión simplificada: ${simplified.toString()}</div>`);
    return {
        result: simplified,
        steps: steps.join('')
    };
} catch (error) {
    return {
        result: result,
        steps: steps.join('')
    };
}
} catch (error) {
return {
    result: null,
    steps: `<div class="step error">Error en la integración por partes: ${error.message}</div>`
};
}
}


function integrationBySubstitution(funcStr, uSubStr) {
const steps = [];

steps.push(`<div class="step">Aplicando integración por sustitución a la expresión: ${funcStr}</div>`);
steps.push(`<div class="step">Usando la sustitución u = ${uSubStr}</div>`);

try {

const func = math.parse(funcStr);
const uSub = math.parse(uSubStr);


const du = math.derivative(uSub, 'x');
steps.push(`<div class="step">Calculando du/dx = ${du.toString()}</div>`);
steps.push(`<div class="step">Esto significa que dx = du/(${du.toString()})</div>`);


steps.push(`<div class="step">Reescribiendo la integral en términos de u</div>`);
steps.push(`<div class="step">Esto puede requerir manipulación algebraica para expresar ${funcStr} en términos de u = ${uSubStr}</div>`);


if (funcStr.includes(uSubStr)) {
    steps.push(`<div class="step">La función contiene la sustitución u = ${uSubStr}</div>`);
    

    if (funcStr.includes('sin') || funcStr.includes('cos')) {
        const newFuncStr = funcStr.replace(new RegExp(uSubStr.replace(/([+\-*^()])/g, '\\$1'), 'g'), 'u');
        steps.push(`<div class="step">Sustituyendo ${uSubStr} por u: ${newFuncStr}</div>`);
        
        if (newFuncStr.includes('*')) {
            steps.push(`<div class="step">Simplificando la expresión...</div>`);
            
         
            if (newFuncStr.includes('cos(u)*')) {
                steps.push(`<div class="step">Reconociendo que esto tiene la forma de una sustitución donde dx = du/(${du.toString()})</div>`);
                steps.push(`<div class="step">La integral se reduce a ∫cos(u) du = sin(u) + C</div>`);
                steps.push(`<div class="step">Sustituyendo de vuelta u = ${uSubStr}, obtenemos sin(${uSubStr}) + C</div>`);
                
                return {
                    result: math.parse(`sin(${uSubStr})`),
                    steps: steps.join('')
                };
            }
            
            if (newFuncStr.includes('sin(u)*')) {
                steps.push(`<div class="step">Reconociendo que esto tiene la forma de una sustitución donde dx = du/(${du.toString()})</div>`);
                steps.push(`<div class="step">La integral se reduce a ∫sin(u) du = -cos(u) + C</div>`);
                steps.push(`<div class="step">Sustituyendo de vuelta u = ${uSubStr}, obtenemos -cos(${uSubStr}) + C</div>`);
                
                return {
                    result: math.parse(`-cos(${uSubStr})`),
                    steps: steps.join('')
                };
            }
        }
    }
}


steps.push(`<div class="step">Para completar esta sustitución manualmente:</div>`);
steps.push(`<div class="step">1. Reemplaza cada aparición de ${uSubStr} por u</div>`);
steps.push(`<div class="step">2. Reemplaza dx por du/(${du.toString()})</div>`);
steps.push(`<div class="step">3. Integra la nueva expresión en términos de u</div>`);
steps.push(`<div class="step">4. Sustituye u = ${uSubStr} en la integral resultante</div>`);

return {
    result: math.parse(`∫(${funcStr}) dx [con u = ${uSubStr}]`),
    steps: steps.join('')
};
} catch (error) {
return {
    result: null,
    steps: `<div class="step error">Error en la integración por sustitución: ${error.message}</div>`
};
}
}


function partialFractions(funcStr) {
const steps = [];

steps.push(`<div class="step">Analizando la función racional: ${funcStr}</div>`);

try {

let numerator, denominator;

if (funcStr.includes('/')) {
    const parts = funcStr.split('/');
    if (parts.length >= 2) {
        numerator = parts[0].trim();
        denominator = parts[1].trim();
        
      
        if (numerator.startsWith('(') && numerator.endsWith(')')) {
            numerator = numerator.substring(1, numerator.length - 1);
        }
        if (denominator.startsWith('(') && denominator.endsWith(')')) {
            denominator = denominator.substring(1, denominator.length - 1);
        }
    }
}

if (!numerator || !denominator) {
    throw new Error("No se pudo identificar correctamente numerador y denominador");
}

steps.push(`<div class="step">Numerador P(x) = ${numerator}</div>`);
steps.push(`<div class="step">Denominador Q(x) = ${denominator}</div>`);


if (denominator === 'x^2-1') {
    steps.push(`<div class="step">Factorizando el denominador: ${denominator} = (x-1)(x+1)</div>`);
    steps.push(`<div class="step">Para fracciones parciales, escribimos: ${numerator}/(${denominator}) = A/(x-1) + B/(x+1)</div>`);
    steps.push(`<div class="step">Multiplicando ambos lados por (x-1)(x+1): ${numerator} = A(x+1) + B(x-1)</div>`);
    
    if (numerator === '1') {
        steps.push(`<div class="step">Sustituyendo x = 1: 1 = A(1+1) + B(0) ⟹ A = 1/2</div>`);
        steps.push(`<div class="step">Sustituyendo x = -1: 1 = A(0) + B(-1-1) ⟹ B = -1/2</div>`);
        steps.push(`<div class="step">Por lo tanto: 1/(x^2-1) = 1/2·1/(x-1) - 1/2·1/(x+1)</div>`);
        
        return {
            result: math.parse('(1/2)/(x-1) - (1/2)/(x+1)'),
            steps: steps.join('')
        };
    }
}

if (denominator === '(x-a)(x-b)' || denominator.includes('*')) {
    steps.push(`<div class="step">Para fracciones parciales de denominador con factores lineales, escribimos:</div>`);
    steps.push(`<div class="step">${numerator}/(${denominator}) = A/(x-a) + B/(x-b)</div>`);
    steps.push(`<div class="step">Donde A y B son constantes por determinar.</div>`);
}

if (denominator.includes('^2')) {
    steps.push(`<div class="step">Para fracciones parciales con factores cuadráticos irreducibles:</div>`);
    if (denominator === 'x^2+1') {
        steps.push(`<div class="step">${numerator}/(${denominator}) = (Ax+B)/(x^2+1)</div>`);
        steps.push(`<div class="step">Esta fracción no se puede descomponer más porque x^2+1 es irreducible.</div>`);
    } else {
        steps.push(`<div class="step">Si hay factores cuadráticos (x^2+px+q), usamos términos de la forma (Ax+B)/(x^2+px+q)</div>`);
    }
}

// Procedimiento general
steps.push(`<div class="step">Pasos generales para descomponer en fracciones parciales:</div>`);
steps.push(`<div class="step">1. Factorizar el denominador Q(x)</div>`);
steps.push(`<div class="step">2. Para cada factor lineal (x-a) de multiplicidad m, incluir términos A₁/(x-a) + A₂/(x-a)² + ... + Aₘ/(x-a)ᵐ</div>`);
steps.push(`<div class="step">3. Para cada factor cuadrático irreducible (x²+px+q) de multiplicidad n, incluir términos (B₁x+C₁)/(x²+px+q) + ... + (Bₙx+Cₙ)/(x²+px+q)ⁿ</div>`);
steps.push(`<div class="step">4. Formar un sistema de ecuaciones igualando coeficientes y resolver para las constantes</div>`);

return {
    result: math.parse(`PartialFractions(${funcStr})`),
    steps: steps.join('')
};
} catch (error) {
return {
    result: null,
    steps: `<div class="step error">Error en la descomposición en fracciones parciales: ${error.message}</div>`
};
}
}


document.getElementById('calculate').addEventListener('click', function(e) {
 
const funcStr = document.getElementById('function').value;
const operation = document.querySelector('input[name="operation"]:checked').value;
const resultContainer = document.getElementById('resultDerivadaIntegral');
const resultContent = document.getElementById('result-content');

resultContainer.style.display = 'block';
document.getElementById('chart-container').style.display = 'none';
console.log(funcStr,' funcStr  ',operation,'  operation',resultContainer,' resultContainer',resultContent,'  resultContent');
try {
const node = math.parse(funcStr);
let result;

if (operation === 'derivative') {
    result = calculateDerivativeWithSteps(node);
    resultContent.innerHTML = `
        <div class="math-display">f(x) = ${funcStr}</div>
        <div class="math-display">f'(x) = ${result.result.toString()}</div>
        <div class="steps">${result.steps}</div>
    `;

    console.log(result,'result');
} else if (operation === 'integral') {
    try {
        result = calculateIntegralWithSteps(node);
        resultContent.innerHTML = `
            <div class="math-display">f(x) = ${funcStr}</div>
            <div class="math-display">∫f(x) dx = ${result.result.toString()} + C</div>
            <div class="steps">${result.steps}</div>
        `;
    } catch (error) {
        resultContent.innerHTML = `
            <div class="math-display">f(x) = ${funcStr}</div>
            <div class="error">No se pudo calcular la integral simbólica: ${error.message}</div>
            <div>Puedes intentar con integración numérica o métodos específicos en la pestaña Avanzado.</div>
        `;
    }
} else if (operation === 'numerical-integral') {
    const lowerLimit = parseFloat(document.getElementById('lower-limit').value);
    const upperLimit = parseFloat(document.getElementById('upper-limit').value);
    const segments = parseInt(document.getElementById('segments').value);
    const method = document.querySelector('input[name="numeric-method"]:checked').value;
    
    result = generateNumericalIntegration(funcStr, lowerLimit, upperLimit, segments, method);
    
    resultContent.innerHTML = `
        <div class="math-display">f(x) = ${funcStr}</div>
        <div class="math-display">∫<sub>${lowerLimit}</sub><sup>${upperLimit}</sup> f(x) dx ≈ ${result.result !== null ? result.result.toFixed(6) : 'Error'}</div>
        <div class="steps">${result.steps}</div>
    `;
    
    if (result.plotData) {
        plotNumericalIntegration(result.plotData);
    }
}
} catch (error) {
resultContent.innerHTML = `<div class="error">Error: ${error.message}</div>`;
}
});


document.getElementById('calculate-parts').addEventListener('click', function() {
const funcStr = document.getElementById('parts-function').value;
const uStr = document.getElementById('u-function').value;
const dvStr = document.getElementById('dv-function').value;

const resultContainer = document.getElementById('result');
const resultContent = document.getElementById('result-content');

resultContainer.style.display = 'block';
document.getElementById('chart-container').style.display = 'none';

try {
const result = integrationByParts(funcStr, uStr, dvStr);

resultContent.innerHTML = `
    <div class="math-display">∫${funcStr} dx</div>
    <div class="math-display">Usando u = ${uStr}, dv = ${dvStr}</div>
    <div class="math-display">Resultado: ${result.result ? result.result.toString() + ' + C' : 'No se pudo determinar'}</div>
    <div class="steps">${result.steps}</div>
`;
} catch (error) {
resultContent.innerHTML = `<div class="error">Error: ${error.message}</div>`;
}
});

document.getElementById('calculate-sub').addEventListener('click', function() {
const funcStr = document.getElementById('sub-function').value;
const uSubStr = document.getElementById('u-sub').value;

const resultContainer = document.getElementById('result');
const resultContent = document.getElementById('result-content');

resultContainer.style.display = 'block';
document.getElementById('chart-container').style.display = 'none';

try {
const result = integrationBySubstitution(funcStr, uSubStr);

resultContent.innerHTML = `
    <div class="math-display">∫${funcStr} dx</div>
    <div class="math-display">Usando la sustitución u = ${uSubStr}</div>
    <div class="math-display">Resultado: ${result.result ? result.result.toString() + ' + C' : 'No se pudo determinar'}</div>
    <div class="steps">${result.steps}</div>
`;
} catch (error) {
resultContent.innerHTML = `<div class="error">Error: ${error.message}</div>`;
}
});

document.getElementById('calculate-partial').addEventListener('click', function() {
const funcStr = document.getElementById('partial-function').value;

const resultContainer = document.getElementById('result');
const resultContent = document.getElementById('result-content');

resultContainer.style.display = 'block';
document.getElementById('chart-container').style.display = 'none';

try {
const result = partialFractions(funcStr);

resultContent.innerHTML = `
    <div class="math-display">${funcStr}</div>
    <div class="math-display">Descomposición en fracciones parciales: ${result.result ? result.result.toString() : 'No se pudo determinar'}</div>
    <div class="steps">${result.steps}</div>
`;
} catch (error) {
resultContent.innerHTML = `<div class="error">Error: ${error.message}</div>`;
}
});


document.addEventListener('DOMContentLoaded', function() {

const operation = document.querySelector('input[name="operation"]:checked').value;
if (operation === 'numerical-integral') {
document.getElementById('integration-options').style.display = 'block';
} else {
document.getElementById('integration-options').style.display = 'none';
}
});



 
function botonesMathInput(this__) {
    let inputFunconesDerivadasInt=document.getElementById("function");
    let st=inputFunconesDerivadasInt.value;
    if(this__.id=="idraiz2"){
        st=st+" " +"(x^(1/2))";

    }
    if(this__.id=="idraiz3"){
        st=st+" " +"(x^(1/3))";

    }
    if(this__.id=="idraizn"){
        st=st+" " +"(x^(1/n))";
    }

    if(this__.id=="idlogN"){
        st=st+" " +"(log(x))";
    }

    if(this__.id=="idshm"){
        st=st+" " +"(sinh(x))";
    }
    if(this__.id=="idchm"){
        st=st+" " +"(cosh(x))";
    }
    if(this__.id=="idthm"){
        st=st+" " +"(tanh(x))";
    }




/* Compuestas: sin(2x+1), cos(x^2), ln(3x)
Logaritmos: ln(x), log(x, 10), log(x, 2)
Trigonométricas: sin(x), cos(x), tan(x)
Hiperbólicas: sinh(x), cosh(x), tanh(x)
Exponenciales: e^x, 2^x, exp(3x)
Polinomios: x^3 + 2x^2 - 5x + 1
División: 1/x, 2/(x+1) */




 inputFunconesDerivadasInt.value=st;
}