"use client";

import { motion, useReducedMotion } from "framer-motion";

type Stat = { value: number | string; label: string };

export function CommunityStats({ items }: { items: Stat[] }) {
  const reduceMotion = useReducedMotion();
  return (
    <div className="stat-grid">
      {items.map(({ value, label }, index) => (
        <motion.div
          className="stat-item"
          key={label}
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.45 }}
          transition={{ duration: 0.4, delay: index * 0.07 }}
        >
          <div className="stat-value">{value}</div>
          <div className="stat-label">{label}</div>
        </motion.div>
      ))}
    </div>
  );
}
