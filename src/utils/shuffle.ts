export function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export interface ShuffledQuestion {
  id: string;
  question: string;
  answers: string[];
  correctIndex: number;
  explanation: string;
  image?: string;
  answerImages?: (string | undefined)[];
}

export function shuffleQuestion(q: {
  id: string;
  question: string;
  answers: string[];
  correctAnswer: number;
  explanation: string;
  image?: string;
  answerImages?: (string | undefined)[];
}): ShuffledQuestion {
  // Картинка едет вместе со своим вариантом, чтобы не отвязаться при тасовании
  const indexed = q.answers.map((text, i) => ({
    text,
    image: q.answerImages?.[i],
    isCorrect: i === q.correctAnswer,
  }));
  const shuffled = shuffleArray(indexed);
  return {
    id: q.id,
    question: q.question,
    answers: shuffled.map((x) => x.text),
    correctIndex: shuffled.findIndex((x) => x.isCorrect),
    explanation: q.explanation,
    image: q.image,
    answerImages: shuffled.map((x) => x.image),
  };
}
