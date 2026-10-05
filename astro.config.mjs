// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import starlight from "@astrojs/starlight";
import { unified } from "@astrojs/markdown-remark";

import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

// https://astro.build/config
export default defineConfig({
  markdown: {
    processor: unified({
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex],
    }),
  },
  integrations: [
    starlight({
      customCss: ["./src/styles/custom.css"],
      defaultLocale: "es",
      locales: {
        root: { label: "Español", lang: "es" },
      },
      sidebar: [
        {
          label: "Álgebra abstracta",
          collapsed: true,
          items: [
            { label: "Números reales", slug: "algebra/numeros-reales" },
            { label: "Números naturales", slug: "algebra/numeros-naturales" },
            { label: "Números enteros", slug: "algebra/numeros-enteros" },
            { label: "Números racionales", slug: "algebra/numeros-racionales" },
            { label: "Grupos", slug: "algebra/grupos" },
            { label: "Anillos", slug: "algebra/anillos" },
            { label: "Módulos", slug: "algebra/modulos" },
            { label: "Cuerpos", slug: "algebra/cuerpos" },
          ],
        },
        {
          label: "Álgebra lineal",
          collapsed: true,
          items: [
            { label: "Matrices", slug: "linear-algebra/matrices" },
            {
              label: "Transformaciones lineales",
              slug: "linear-algebra/transformaciones-lineales",
            },
            {
              label: "Espacios vectoriales",
              slug: "linear-algebra/espacios-vectoriales",
            },
            {
              label: "Valores y vectores propios",
              slug: "linear-algebra/valores-vectores-propios",
            },
            {
              label: "Sistemas de ecuaciones lineales",
              slug: "linear-algebra/sistemas-lineales",
            },
            { label: "Determinantes", slug: "linear-algebra/determinantes" },
            {
              label: "Producto interno y ortogonalidad",
              slug: "linear-algebra/producto-interno",
            },
          ],
        },
        {
          label: "Análisis matemático",
          collapsed: true,
          items: [
            { label: "Números reales", slug: "analysis/numeros-reales" },
            { label: "Sucesiones", slug: "analysis/sucesiones" },
            {
              label: "Límites y continuidad",
              slug: "analysis/limites-continuidad",
            },
            { label: "Derivación", slug: "analysis/derivacion" },
            { label: "Integración", slug: "analysis/integracion" },
            { label: "Series", slug: "analysis/series" },
          ],
        },
        {
          label: "Cálculo",
          collapsed: true,
          items: [
            { label: "Funciones", slug: "calculus/funciones" },
            { label: "Límites", slug: "calculus/limites" },
            { label: "Derivada", slug: "calculus/derivada" },
            { label: "Integrales", slug: "calculus/integrales" },
            {
              label: "Sucesiones y series",
              slug: "calculus/sucesiones-series",
            },
            { label: "Teorema de Taylor", slug: "calculus/teorema-taylor" },
            {
              label: "Integrales impropias",
              slug: "calculus/integrales-impropias",
            },
          ],
        },
        {
          label: "Cálculo multivariable",
          collapsed: true,
          items: [
            {
              label: "Coordenadas en el espacio",
              slug: "multivariable-calculus/coordenadas",
            },
            {
              label: "Límites y continuidad",
              slug: "multivariable-calculus/limites-continuidad",
            },
            {
              label: "Derivadas parciales y gradiente",
              slug: "multivariable-calculus/derivadas-parciales",
            },
            {
              label: "Integrales múltiples",
              slug: "multivariable-calculus/integrales-multiples",
            },
            {
              label: "Campos vectoriales",
              slug: "multivariable-calculus/campos-vectoriales",
            },
            {
              label: "Integrales de línea y de superficie",
              slug: "multivariable-calculus/integrales-linea",
            },
            {
              label: "Teoremas integrales",
              slug: "multivariable-calculus/teoremas-integrales",
            },
          ],
        },
        {
          label: "Ecuaciones diferenciales",
          collapsed: true,
          items: [
            {
              label: "Introducción",
              slug: "differential-equations/introduccion",
            },
            {
              label: "Ecuaciones de primer orden",
              slug: "differential-equations/primer-orden",
            },
            {
              label: "Ecuaciones lineales de orden superior",
              slug: "differential-equations/orden-superior",
            },
            {
              label: "Transformada de Laplace",
              slug: "differential-equations/laplace",
            },
            {
              label: "Sistemas de ecuaciones diferenciales",
              slug: "differential-equations/sistemas",
            },
            {
              label: "Soluciones por series de potencias",
              slug: "differential-equations/series",
            },
          ],
        },
        {
          label: "Estadística",
          collapsed: true,
          items: [
            { label: "Estadística", slug: "statistics/estadistica" },
            {
              label: "Estadística descriptiva",
              slug: "statistics/descriptiva",
            },
            {
              label: "Inferencia estadística",
              slug: "statistics/inferencia",
            },
            {
              label: "Contrastes de hipótesis",
              slug: "statistics/contrastes-hipotesis",
            },
            {
              label: "Regresión y correlación",
              slug: "statistics/regresion",
            },
          ],
        },
        {
          label: "Geometría",
          collapsed: true,
          items: [
            { label: "Fundamentos", slug: "geometry/fundamentos" },
            { label: "Triángulos", slug: "geometry/triangulos" },
            {
              label: "Polígonos y circunferencia",
              slug: "geometry/poligonos",
            },
            {
              label: "Geometría analítica",
              slug: "geometry/geometria-analitica",
            },
            {
              label: "Geometría del espacio",
              slug: "geometry/solidos",
            },
          ],
        },
        {
          label: "Lógica",
          collapsed: true,
          items: [
            {
              label: "Lógica proposicional",
              slug: "logic/logica-proposicional",
            },
            { label: "Tablas de verdad", slug: "logic/tablas-de-verdad" },
            {
              label: "Lógica de predicados",
              slug: "logic/logica-de-predicados",
            },
            { label: "Cuantificadores", slug: "logic/cuantificadores" },
            {
              label: "Reglas de inferencia",
              slug: "logic/reglas-de-inferencia",
            },
            {
              label: "Métodos de demostración",
              slug: "logic/metodos-de-demostracion",
            },
            { label: "Conjuntos", slug: "logic/conjuntos" },
            { label: "Relaciones", slug: "logic/relaciones" },
          ],
        },
        {
          label: "Matemática discreta",
          collapsed: true,
          items: [
            {
              label: "Combinatoria",
              slug: "discrete-math/combinatoria",
            },
            {
              label: "Relaciones de recurrencia",
              slug: "discrete-math/recurrencias",
            },
            {
              label: "Teoría de grafos",
              slug: "discrete-math/grafos",
            },
            {
              label: "Álgebra de Boole",
              slug: "discrete-math/boole",
            },
          ],
        },
        {
          label: "Probabilidad",
          collapsed: true,
          items: [
            { label: "Probabilidades", slug: "probability/probabilidades" },
            {
              label: "Probabilidad condicional",
              slug: "probability/probabilidad-condicional",
            },
            {
              label: "Variables aleatorias",
              slug: "probability/variables-aleatorias",
            },
            {
              label: "Distribuciones discretas",
              slug: "probability/distribuciones-discretas",
            },
            {
              label: "Distribuciones continuas",
              slug: "probability/distribuciones-continuas",
            },
            {
              label: "Teoremas límite",
              slug: "probability/teoremas-limite",
            },
          ],
        },
        {
          label: "Teoría de números",
          collapsed: true,
          items: [
            { label: "Divisibilidad", slug: "number-theory/divisibilidad" },
            { label: "Números primos", slug: "number-theory/numeros-primos" },
            { label: "Congruencias", slug: "number-theory/congruencias" },
            {
              label: "Función de Euler",
              slug: "number-theory/funcion-de-euler",
            },
            {
              label: "Números de Mersenne gaussianos",
              slug: "number-theory/numeros-mersenne-gaussianos",
            },
            {
              label: "Ecuaciones diofantinas",
              slug: "number-theory/ecuaciones-diofantinas",
            },
            {
              label: "Residuos cuadráticos",
              slug: "number-theory/residuos-cuadraticos",
            },
          ],
        },
        {
          label: "Topología",
          collapsed: true,
          items: [
            {
              label: "Espacios topológicos",
              slug: "topology/espacios-topologicos",
            },
            {
              label: "Interior, clausura y frontera",
              slug: "topology/interior-clausura",
            },
            {
              label: "Continuidad y homeomorfismos",
              slug: "topology/continuidad",
            },
            {
              label: "Compacidad",
              slug: "topology/compacidad",
            },
            {
              label: "Conexión",
              slug: "topology/conexion",
            },
          ],
        },
        {
          label: "Glosario",
          collapsed: true,
          items: [
            { label: "Símbolos y notación", slug: "glossary/simbolos" },
            {
              label: "Conceptos básicos",
              slug: "glossary/conceptos-basicos",
            },
            { label: "Álgebra elemental", slug: "glossary/algebra" },
            { label: "Análisis", slug: "glossary/analisis" },
            {
              label: "Probabilidad y estadística",
              slug: "glossary/probabilidad-estadistica",
            },
          ],
        },
      ],
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/ricardobadillo",
        },
      ],
      title: "domathandcode",
    }),
    mdx(),
  ],
});
