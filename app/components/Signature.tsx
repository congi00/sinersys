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
  M40,100 C35,100 25,90 30,60 C35,30 65,30 70,60 C73,85 65,105 80,100
  M50,75 Q70,72 85,75
  M85,100 Q90,80 95,85 Q100,90 105,100 Q110,80 115,85 Q120,90 125,100
  M125,100 L130,75 M120,85 L140,85
  M145,100 C135,100 135,85 145,85 C155,85 155,100 145,100
  M160,100 Q165,80 170,85 Q175,90 180,100 Q185,80 190,85 Q195,90 200,100
  M205,88 L205,100 M205,78 L205,79
  M215,100 C205,100 205,85 215,85 C225,85 225,100 215,100
  M245,40 L245,100 M245,50 C280,45 280,70 245,75 C285,75 285,105 240,100
  M275,88 L275,100 M275,78 L275,79
  M295,100 C285,100 285,85 295,85 C305,85 305,100 300,105 Q295,115 285,115
  M310,100 C300,100 300,85 315,85 C325,85 325,115 310,125
  M330,88 L330,100 M330,78 L330,79
  M340,100 Q345,80 350,85 Q355,90 360,100 Q365,80 370,85 Q375,90 380,100
  M385,88 L385,100 M385,78 L385,79
  M40,125 Q200,140 380,120
`;

const Signature: React.FC<SignatureProps> = ({ progress }) => {
  // Testo e sottolineatura si "scrivono" insieme, progressivamente
  const pathLength = useTransform(progress, [5.3, 5.9], [0, 1]);
  const opacity    = useTransform(progress, [5.3, 5.4], [0, 1]);

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