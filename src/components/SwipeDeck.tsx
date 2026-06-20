import { AnimatePresence, motion, useMotionValue, useTransform, type Variants } from 'framer-motion';
import { useState } from 'react';
import type { Card } from '../types';
import { PrayCard } from './PrayCard';

// `exit` reads `custom` (the swipe direction) passed via <AnimatePresence custom>.
const cardVariants: Variants = {
  enter: { scale: 0.96, opacity: 0, y: 10 },
  center: { scale: 1, opacity: 1, y: 0 },
  exit: (dir: number) => ({ x: dir * 700, opacity: 0, transition: { duration: 0.28 } }),
};

interface Props {
  cards: Card[]; // remaining queue; cards[0] is on top
  onPray: (card: Card) => void;
  onSkip: (card: Card) => void;
  onArchive: (card: Card) => void;
  onAnswer: (card: Card) => void;
}

const SWIPE_THRESHOLD = 120;
const VELOCITY_THRESHOLD = 600;

/** A draggable card. Right = prayed, left = skip for now; springs back otherwise. */
function DraggableCard({
  card,
  onPray,
  onSkip,
  actions,
}: {
  card: Card;
  onPray: () => void;
  onSkip: () => void;
  actions: { onArchive: () => void; onAnswer: () => void };
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-220, 220], [-14, 14]);
  const prayOpacity = useTransform(x, [30, 130], [0, 1]);
  const skipOpacity = useTransform(x, [-130, -30], [1, 0]);

  return (
    <motion.div
      className="absolute inset-0"
      style={{ x, rotate, touchAction: 'none' }}
      drag="x"
      dragSnapToOrigin
      onDragEnd={(_, info) => {
        if (info.offset.x > SWIPE_THRESHOLD || info.velocity.x > VELOCITY_THRESHOLD) onPray();
        else if (info.offset.x < -SWIPE_THRESHOLD || info.velocity.x < -VELOCITY_THRESHOLD) onSkip();
      }}
      variants={cardVariants}
      initial="enter"
      animate="center"
      exit="exit"
    >
      <PrayCard card={card} actions={actions} />

      {/* Swipe hints */}
      <motion.div
        style={{ opacity: prayOpacity }}
        className="pointer-events-none absolute left-5 top-5 -rotate-12 rounded-lg border-2 border-emerald-400 px-3 py-1 text-lg font-bold uppercase text-emerald-400"
      >
        Prayed
      </motion.div>
      <motion.div
        style={{ opacity: skipOpacity }}
        className="pointer-events-none absolute right-5 top-5 rotate-12 rounded-lg border-2 border-amber-400 px-3 py-1 text-lg font-bold uppercase text-amber-400"
      >
        Later
      </motion.div>
    </motion.div>
  );
}

export function SwipeDeck({ cards, onPray, onSkip, onArchive, onAnswer }: Props) {
  const [dir, setDir] = useState(1);
  const front = cards[0];
  const next = cards[1];

  return (
    <div className="relative h-full w-full">
      {/* Peek of the next card for depth */}
      {next && (
        <div className="absolute inset-0 opacity-60" style={{ transform: 'translateY(10px) scale(0.96)' }}>
          <PrayCard key={next.id} card={next} />
        </div>
      )}

      <AnimatePresence custom={dir}>
        {front && (
          <DraggableCard
            key={front.id}
            card={front}
            onPray={() => {
              setDir(1);
              onPray(front);
            }}
            onSkip={() => {
              setDir(-1);
              onSkip(front);
            }}
            actions={{ onArchive: () => onArchive(front), onAnswer: () => onAnswer(front) }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
