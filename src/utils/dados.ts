/**
 * Sorteio simples de fórmulas de dados (ex.: "2d8", "2d8+4", "3d6+1d4-2"),
 * usado quando o plugin Dice Roller não está instalado.
 * Retorna null se a fórmula não for válida.
 */
export function rolarFormula(
    formula: string,
    aleatorio: () => number = Math.random
): number | null {
    const texto = formula.replace(/\s+/g, "").toLowerCase();
    if (!/^[+-]?(\d*d\d+|\d+)([+-](\d*d\d+|\d+))*$/.test(texto)) return null;
    let total = 0;
    for (const [, sinal, qtd, faces, fixo] of texto.matchAll(
        /([+-]?)(?:(\d*)d(\d+)|(\d+))/g
    )) {
        let valor = 0;
        if (fixo !== undefined) {
            valor = Number(fixo);
        } else {
            const n = qtd === "" ? 1 : Number(qtd);
            const f = Number(faces);
            if (f < 1) return null;
            for (let i = 0; i < n; i++) valor += Math.floor(aleatorio() * f) + 1;
        }
        total += sinal === "-" ? -valor : valor;
    }
    return total;
}
