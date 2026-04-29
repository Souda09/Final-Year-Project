import React from 'react';
import { motion } from 'framer-motion';

const WeightFilter = ({ categories, selectedCategory, onSelect }) => {
  return (
    <div className="flex flex-wrap gap-3 justify-center">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onSelect(category)}
          className="relative px-6 py-2 rounded-lg font-display font-semibold transition-colors"
        >
          {selectedCategory === category && (
            <motion.div
              layoutId="activeCategory"
              className="absolute inset-0 bg-primary rounded-lg"
              transition={{ type: "spring", duration: 0.5 }}
            />
          )}
          <span className={`relative z-10 ${selectedCategory === category ? 'text-primary-foreground' : 'text-foreground'}`}>
            {category}
          </span>
        </button>
      ))}
    </div>
  );
};

export default WeightFilter;