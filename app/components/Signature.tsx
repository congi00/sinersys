import React from "react";
import { motion, useTransform, MotionValue } from "framer-motion";

interface SignatureProps {
  progress: MotionValue<number>;
}

// "Antonio Biagini" come path SVG calligrafico.
// Tutti i tratti della firma + sottolineatura sono un unico path continuo
// animato con pathLength 0→1, dando l'effetto di scrittura progressiva.
//
// Il path è disegnato in uno spazio 520×130.
// Struttura: A-n-t-o-n-i-o  B-i-a-g-i-n-i + sottolineatura ondulata.

const SIGNATURE_PATH = `
  M 18,72
  C 22,52 30,44 36,48
  C 40,50 40,60 36,68
  C 32,76 28,80 30,72
  C 32,64 40,56 50,58
  C 60,60 62,70 60,76

  M 60,76
  C 64,60 70,52 76,54
  C 82,56 82,66 80,74

  M 80,70
  C 84,56 90,50 96,52
  C 102,54 102,64 100,72
  C 98,80 94,84 96,76
  C 98,68 106,60 114,62
  C 120,64 120,72 118,78

  M 118,72
  C 122,54 130,46 138,50
  C 144,54 142,66 138,74
  C 134,82 130,84 132,76
  C 134,66 142,58 150,60
  C 156,62 156,70 154,76

  M 154,72
  L 152,90

  M 148,66
  L 158,66

  M 158,58
  C 162,44 170,38 178,40
  C 188,44 186,60 182,70
  C 178,80 172,86 170,78
  C 168,70 176,62 184,64
  C 190,66 190,72 190,76

  M 200,46
  C 208,36 220,32 224,40
  C 228,48 224,64 218,72
  C 212,80 206,82 208,76
  C 210,68 218,58 228,58
  C 238,58 244,64 242,72
  C 240,80 236,88 232,96
  C 228,104 222,110 218,106

  M 242,68
  C 248,56 256,50 262,54
  C 268,58 268,68 266,74

  M 266,68
  C 270,54 278,46 286,50
  C 292,54 292,66 290,74
  C 288,82 284,84 286,76
  C 288,68 296,60 304,62
  C 310,64 310,72 308,78
  C 306,86 300,92 296,106
  C 293,116 293,124 296,124

  M 308,74
  C 312,60 320,52 326,54
  C 332,56 332,66 330,74

  M 330,70
  C 332,54 340,44 348,46
  C 356,48 356,60 354,70
  C 352,80 348,84 350,76
  C 352,66 360,58 368,60
  C 376,62 376,72 374,78

  M 36,106
  Q 120,130 210,112
  Q 300,94 380,108
  Q 420,116 460,104
`;

const Signature: React.FC<SignatureProps> = ({ progress }) => {
  // Testo e sottolineatura si "scrivono" insieme, progressivamente
  const pathLength = useTransform(progress, [4.3, 4.9], [0, 1]);
  const opacity    = useTransform(progress, [4.0, 4.3], [0, 1]);

  return (
    <motion.div
      className="mt-10 sm:flex sm:justify-center"
      style={{ opacity }}
    >
      <motion.svg
        width="100%"
        viewBox="0 0 500 140"
        xmlns="http://www.w3.org/2000/svg"
        style={{ maxWidth: "460px", overflow: "visible" }}
      >
        {/* Ombra morbida sotto la firma per darle profondità */}
        <motion.path
          d={SIGNATURE_PATH}
          fill="none"
          stroke="rgba(12,24,70,0.35)"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            pathLength,
            translateY: 3,
            translateX: 2,
          }}
        />

        {/* Tratto principale della firma — bianco luminoso */}
        <motion.path
          d={SIGNATURE_PATH}
          fill="none"
          stroke="rgba(244,247,250,0.95)"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ pathLength }}
        />

        {/* Secondo tratto leggermente più sottile e blu per dare corpo */}
        <motion.path
          d={SIGNATURE_PATH}
          fill="none"
          stroke="rgba(180,210,255,0.30)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ pathLength }}
        />
      </motion.svg>
    </motion.div>
  );
};

export default Signature;