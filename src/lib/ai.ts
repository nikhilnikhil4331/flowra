import { CycleInfo, fmt } from './cycle';
import { DayLog } from '../store';
import { PERIOD_TIPS, MEDICAL_DISCLAIMER } from '../data/content';

/** Warm, context-aware rule-based companion (works fully offline). */
export function aiReply(question: string, cycle: CycleInfo, todayLog?: DayLog, userName?: string): string {
  const q = question.toLowerCase();
  const name = userName ? ` ${userName.split(' ')[0]}` : '';
  const tips = PERIOD_TIPS[cycle.phase] ?? PERIOD_TIPS.Luteal;
  const tipList = tips.map((t) => `• ${t}`).join('\n');

  const has = (...words: string[]) => words.some((w) => q.includes(w));

  if (has('hello', 'hi', 'hey', 'namaste')) {
    return `Hello${name}! 🌸 You're on Day ${cycle.cycleDay} of your cycle (${cycle.phaseLabel.toLowerCase()}). Your next period is expected around ${fmt(cycle.nextPeriod)}. How are you feeling today?`;
  }
  if (has('cramp', 'pain', 'hurts', 'ache')) {
    const painNote = todayLog && todayLog.pain > 0 ? ` I see you logged pain at ${todayLog.pain}/10 today — I'm sorry, that sounds tough.` : '';
    return `Cramps are very common during the ${cycle.phaseLabel.toLowerCase()}.${painNote} Here are some gentle suggestions:\n• Use a warm compress on your lower abdomen\n• Stay hydrated\n• Try light movement or stretching\n• Ensure adequate sleep\n• A warm drink like ginger tea can soothe\n\n${MEDICAL_DISCLAIMER}`;
  }
  if (has('late', 'delay', 'missed', 'delay')) {
    return `Your next period is expected around ${fmt(cycle.nextPeriod)}${cycle.daysUntilNext > 0 ? ` (in ${cycle.daysUntilNext} days)` : ''}. A delay of a few days is common and can be linked to stress, travel, sleep or exercise changes. Your recent cycles average ${cycle.avgCycle} days. If you're more than a week late and there's any chance of pregnancy, consider taking a test, and check in with a doctor if delays keep happening. 💗`;
  }
  if (has('next period', 'when', 'due', 'coming')) {
    return `Based on your history (average ${cycle.avgCycle}-day cycles), your next period should arrive around ${fmt(cycle.nextPeriod)}${cycle.daysUntilNext >= 0 ? ` — that's in ${cycle.daysUntilNext} day${cycle.daysUntilNext === 1 ? '' : 's'}` : ''}. You're currently on Day ${cycle.cycleDay}, in your ${cycle.phaseLabel.toLowerCase()}. I'll keep refining this prediction as you log more. 🌷`;
  }
  if (has('ovulat', 'fertile', 'pregnan', 'conceive')) {
    return `Your fertile window is estimated from ${fmt(cycle.fertileStart)} to ${fmt(cycle.fertileEnd)}, with ovulation around ${fmt(cycle.ovulation)}. Right now you're in your ${cycle.phaseLabel.toLowerCase()}, so the chance of pregnancy is ${cycle.pregnancyChance.toLowerCase()} today. Remember, calendar estimates aren't a contraception method — for family-planning decisions, please talk to a doctor. 🌼`;
  }
  if (has('eat', 'food', 'nutrition', 'diet', 'iron', 'hungry')) {
    return `During your ${cycle.phaseLabel.toLowerCase()}, iron-rich and magnesium-rich foods are your friends:\n• Leafy greens (spinach), lentils & chickpeas\n• Eggs, fish or chicken for protein\n• Dark chocolate & bananas for magnesium\n• Citrus & bell peppers (vitamin C helps iron absorb)\nYou can scan meals in the Food Scanner and I'll add up your day in Daily Nutrition. 🥗`;
  }
  if (has('mood', 'sad', 'anxious', 'stress', 'cry', 'emotional', 'irritat')) {
    return `I'm really glad you told me${name}. 💗 Mood dips around your ${cycle.phaseLabel.toLowerCase()} are linked to hormone shifts and are very normal. Small things that help:\n• A short walk in daylight\n• Slow breathing — in for 4, out for 6\n• Magnesium-rich snacks & steady meals\n• An early, screen-light night\nLogging your mood daily helps us spot your pattern together.`;
  }
  if (has('sleep', 'tired', 'fatigue', 'energy', 'insomnia')) {
    return `Low energy is common in your ${cycle.phaseLabel.toLowerCase()}. Try:\n• A regular bedtime (your Sleep Reminder can help!)\n• No heavy meals 2 hours before bed\n• Gentle stretching instead of intense workouts on tired days\n• Iron-rich meals to prevent fatigue\nRest is productive too — be kind to yourself today. 🌙`;
  }
  if (has('bloat')) {
    return `Bloating usually peaks just before and at the start of your period. Gentle relief:\n• Sip warm water or fennel/ginger tea\n• Smaller, slower meals\n• Light walking after eating\n• Epsom-salt warm bath if you enjoy baths\nIt typically eases a few days into your period. 🌿`;
  }
  if (has('headache', 'migraine')) {
    return `Headaches around your period are often hormonal (estrogen dips). What may help:\n• Hydrate steadily through the day\n• Rest your eyes and dim bright screens\n• A cool compress on your forehead\n• Regular meals to keep blood sugar stable\nIf headaches are severe or new for you, please check with a doctor. 🌸`;
  }
  if (has('skin', 'acne', 'pimple', 'breakout')) {
    return `Cycle-related breakouts often appear in the luteal phase, when oil production rises. Be gentle:\n• Keep cleansing simple, avoid harsh scrubs\n• Change pillowcases often\n• Zinc-rich foods (nuts, seeds, lentils)\n• Resist picking — your skin calms after your period starts ✨`;
  }
  if (has('exercise', 'workout', 'yoga', 'gym')) {
    return `Move in sync with your cycle:\n• Period days: walks, gentle yoga, stretching\n• Follicular: energy rises — great for strength/cardio\n• Ovulation: peak energy for intense sessions\n• Luteal: moderate, steady movement\nYou're in your ${cycle.phaseLabel.toLowerCase()} now — listen to your body first. 🧘‍♀️`;
  }
  if (has('color', 'colour', 'brown', 'dark', 'orange', 'pink blood', 'discharge')) {
    return `Blood colour tells a story: bright red is fresh blood (most common early on), dark red or brown is usually older blood, and pink can be light flow mixed with cervical fluid. I've added a full colour guide — tap **Flow Guide** from Log Period or ask me about a specific colour. If you ever notice grey/green discharge, strong odour, or itching, please see a doctor. 💧`;
  }
  if (has('thank', 'great', 'awesome', 'nice', 'love')) {
    return `You're so welcome${name}! 💖 I'm here whenever you need a little guidance. Keep logging — the more we track together, the smarter your insights get.`;
  }
  if (has('regular', 'normal', 'cycle length', 'irregular')) {
    const range = cycle.cyclesHistory.filter((c) => c.length).map((c) => c.length as number);
    const lo = range.length ? Math.min(...range) : cycle.avgCycle;
    const hi = range.length ? Math.max(...range) : cycle.avgCycle;
    return `Your cycles usually run ${lo}–${hi} days (average ${cycle.avgCycle}), and your period typically lasts about ${cycle.avgPeriodLen} days. Cycles between 21–35 days are generally considered normal. Yours look ${hi - lo <= 7 ? 'pleasantly regular' : 'a little variable — keep logging so we can watch the trend'}! 🌷`;
  }

  return `I'm here with you${name}. 🌸 You're on Day ${cycle.cycleDay} (${cycle.phaseLabel.toLowerCase()}), and your next period is expected around ${fmt(cycle.nextPeriod)}. For today:\n${tipList}\n\nAsk me about cramps, food, mood, sleep, flow colours or your cycle timing — I love helping you understand your body.`;
}

export const AI_SUGGESTIONS = [
  'I have cramps, what can I do?',
  'When is my next period?',
  'What should I eat today?',
  'Am I in my fertile window?',
  'I feel low and tired',
  'Is brown blood normal?',
];
