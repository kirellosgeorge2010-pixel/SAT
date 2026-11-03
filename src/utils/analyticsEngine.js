/**
 * Analytics and Weakness Detection Engine for the SAT Mistake Intelligence System.
 * Calculates statistically grounded metrics, weighted weakness rankings, and study priorities.
 */

/**
 * Computes high-level overview metrics across all recorded questions.
 */
export function computeGlobalMetrics(mistakes) {
  const total = mistakes.length;
  if (total === 0) {
    return {
      total: 0,
      correct: 0,
      incorrect: 0,
      accuracyPct: 0,
      math: { total: 0, correct: 0, accuracyPct: 0 },
      rw: { total: 0, correct: 0, accuracyPct: 0 },
      mod1: { total: 0, correct: 0, accuracyPct: 0 },
      mod2: { total: 0, correct: 0, accuracyPct: 0 },
      modDropWarning: false,
      repeatedMistakesCount: 0,
      fixedCount: 0,
      readyForRetestCount: 0,
      sufficientData: false,
    };
  }

  // Count correct vs incorrect
  // Note: in an error log, items are recorded mistakes or questions. If isCorrect is explicitly true, count as correct.
  const correct = mistakes.filter(m => m.isCorrect || m.reviewStatus === 'Fixed').length;
  const incorrect = total - correct;
  const accuracyPct = Math.round((correct / total) * 100);

  // Section metrics
  const mathItems = mistakes.filter(m => m.section === 'Math');
  const mathCorrect = mathItems.filter(m => m.isCorrect || m.reviewStatus === 'Fixed').length;
  const mathPct = mathItems.length > 0 ? Math.round((mathCorrect / mathItems.length) * 100) : 0;

  const rwItems = mistakes.filter(m => m.section === 'Reading & Writing');
  const rwCorrect = rwItems.filter(m => m.isCorrect || m.reviewStatus === 'Fixed').length;
  const rwPct = rwItems.length > 0 ? Math.round((rwCorrect / rwItems.length) * 100) : 0;

  // Module 1 vs Module 2 metrics
  const mod1Items = mistakes.filter(m => m.module === 'Module 1');
  const mod1Correct = mod1Items.filter(m => m.isCorrect || m.reviewStatus === 'Fixed').length;
  const mod1Pct = mod1Items.length > 0 ? Math.round((mod1Correct / mod1Items.length) * 100) : 0;

  const mod2Items = mistakes.filter(m => m.module === 'Module 2');
  const mod2Correct = mod2Items.filter(m => m.isCorrect || m.reviewStatus === 'Fixed').length;
  const mod2Pct = mod2Items.length > 0 ? Math.round((mod2Correct / mod2Items.length) * 100) : 0;

  // Adaptive SAT diagnostic: Is Module 2 significantly worse than Module 1?
  // If Mod 2 accuracy is >15% lower than Mod 1 (with at least 3 questions in each), flag as module collapse
  const modDropWarning =
    mod1Items.length >= 2 &&
    mod2Items.length >= 2 &&
    mod1Pct - mod2Pct >= 15;

  const repeatedMistakesCount = mistakes.filter(m => m.reviewStatus === 'Repeated Mistake').length;
  const fixedCount = mistakes.filter(m => m.reviewStatus === 'Fixed').length;
  const readyForRetestCount = mistakes.filter(m => m.reviewStatus === 'Ready for Retest').length;

  return {
    total,
    correct,
    incorrect,
    accuracyPct,
    math: { total: mathItems.length, correct: mathCorrect, accuracyPct: mathPct },
    rw: { total: rwItems.length, correct: rwCorrect, accuracyPct: rwPct },
    mod1: { total: mod1Items.length, correct: mod1Correct, accuracyPct: mod1Pct },
    mod2: { total: mod2Items.length, correct: mod2Correct, accuracyPct: mod2Pct },
    modDropWarning,
    modDropDelta: mod1Pct - mod2Pct,
    repeatedMistakesCount,
    fixedCount,
    readyForRetestCount,
    sufficientData: total >= 5,
  };
}

/**
 * Computes frequency and percentage of each Error Category.
 */
export function computeErrorCategoryDistribution(mistakes) {
  const counts = {};
  const total = mistakes.length;
  if (total === 0) return [];

  for (const m of mistakes) {
    const cat = m.errorCategory || 'Application Error';
    counts[cat] = (counts[cat] || 0) + 1;
  }

  return Object.entries(counts)
    .map(([category, count]) => ({
      category,
      count,
      pct: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Computes accuracy and mistake count grouped by SAT Domain and Topic.
 */
export function computeTopicBreakdown(mistakes) {
  const groups = {};

  for (const m of mistakes) {
    const key = `${m.section}:::${m.domain}:::${m.topic || 'General'}`;
    if (!groups[key]) {
      groups[key] = {
        section: m.section,
        domain: m.domain,
        topic: m.topic || 'General',
        total: 0,
        fixed: 0,
        unresolved: 0,
        repeated: 0,
        hardCount: 0,
        knowsRuleStrugglesCount: 0,
        rushingCount: 0,
        questions: [],
      };
    }

    const g = groups[key];
    g.total += 1;
    if (m.reviewStatus === 'Fixed') g.fixed += 1;
    else g.unresolved += 1;

    if (m.reviewStatus === 'Repeated Mistake') g.repeated += 1;
    if (m.difficulty === 'Hard') g.hardCount += 1;
    if (m.knowsRuleStrugglesApplication) g.knowsRuleStrugglesCount += 1;
    if (['Misreading', 'Time Management', 'Careless Execution'].includes(m.errorCategory)) {
      g.rushingCount += 1;
    }
    g.questions.push(m);
  }

  return Object.values(groups);
}

/**
 * Evaluates and ranks the student's biggest weaknesses using a weighted severity formula.
 *
 * Weight Formula per topic:
 * Score = (Unresolved Errors * 2.0)
 *       + (Repeated Mistakes * 3.5)
 *       + (Hard Questions Missed * 1.5)
 *       + (Knows Rule Struggles Application * 2.0)
 *       + (Rushing / Misreading Errors * 1.5)
 *
 * Prevents ranking a topic with only 1 isolated mistake as a "top weakness".
 */
export function rankWeaknesses(mistakes) {
  const topics = computeTopicBreakdown(mistakes);

  const scored = topics.map(item => {
    // Isolated mistake filter: If only 1 question and not repeated, lower priority
    const isolationFactor = item.total === 1 && item.repeated === 0 ? 0.4 : 1.0;

    const rawScore =
      item.unresolved * 2.0 +
      item.repeated * 3.5 +
      item.hardCount * 1.5 +
      item.knowsRuleStrugglesCount * 2.0 +
      item.rushingCount * 1.5;

    const weightedScore = Math.round(rawScore * isolationFactor * 10) / 10;

    let severity = 'Moderate';
    if (weightedScore >= 8) severity = 'Critical';
    else if (weightedScore >= 5) severity = 'High';

    // Primary underlying cognitive challenge
    let primaryCognitivePattern = 'Knowledge consolidation needed';
    if (item.knowsRuleStrugglesCount >= 1) {
      primaryCognitivePattern = 'Understands rule in theory, but struggles with scenario application';
    } else if (item.rushingCount >= 1 && item.rushingCount >= item.unresolved / 2) {
      primaryCognitivePattern = 'Execution slips under time pressure or prompt misreading';
    } else if (item.repeated >= 1) {
      primaryCognitivePattern = 'Persistent misconception that recurs across practice tests';
    }

    return {
      ...item,
      score: weightedScore,
      severity,
      primaryCognitivePattern,
    };
  });

  return scored.sort((a, b) => b.score - a.score);
}

/**
 * Generates the top 3 personalized study recommendations linked to actual mistake records.
 */
export function generateStudyRecommendations(mistakes) {
  if (!mistakes || mistakes.length === 0) {
    return {
      topPriorities: [],
      nextSessionFocus: 'Start by uploading screenshots or entering your recent SAT practice test mistakes.',
      questionsToReviewAgain: [],
      skillsToRevise: [],
    };
  }

  const ranked = rankWeaknesses(mistakes);
  const top3 = ranked.slice(0, 3);

  const topPriorities = top3.map((w, index) => {
    // Collect specific representative questions
    const sampleQuestions = w.questions
      .filter(q => q.reviewStatus !== 'Fixed')
      .slice(0, 2)
      .map(q => ({
        id: q.id,
        testName: q.testName || 'Practice Test',
        questionNumber: q.questionNumber,
        summary: q.questionText?.slice(0, 80) + '...',
        takeaway: q.takeaway || q.rootCause,
      }));

    // Formulate targeted action prescription
    let recommendedPractice = '';
    if (w.section === 'Math') {
      if (w.primaryCognitivePattern.includes('application')) {
        recommendedPractice = `Practice 10 non-standard word problems for ${w.topic}. Focus on translating english constraints into algebraic form without rushing.`;
      } else if (w.primaryCognitivePattern.includes('time pressure')) {
        recommendedPractice = `Untimed drill: Re-solve missed questions with pencil and paper, explicitly circling what the question asks for (e.g. x vs 2x+1).`;
      } else {
        recommendedPractice = `Review foundational formula sheets and complete 8 targeted drill problems in ${w.topic}.`;
      }
    } else {
      if (w.topic.includes('Vocabulary') || w.topic.includes('Words in Context')) {
        recommendedPractice = `Cover answer choices with your hand. Determine your own positive/negative tone and definition from context clues before revealing choices.`;
      } else if (w.topic.includes('Boundaries') || w.topic.includes('Standard English')) {
        recommendedPractice = `Review punctuation rules (independent clause + semicolon + independent clause; colon rules). Do 12 grammar boundary drills.`;
      } else {
        recommendedPractice = `Eliminate extreme answer words (all, never, primarily, invariably). Favor cautious, measured inferences.`;
      }
    }

    return {
      rank: index + 1,
      section: w.section,
      domain: w.domain,
      topic: w.topic,
      severity: w.severity,
      unresolvedCount: w.unresolved,
      repeatedCount: w.repeated,
      cognitivePattern: w.primaryCognitivePattern,
      recommendedPractice,
      sampleQuestions,
    };
  });

  // Questions that should be reviewed again (Ready for Retest or Repeated Mistake)
  const questionsToReviewAgain = mistakes
    .filter(m => m.reviewStatus === 'Repeated Mistake' || m.reviewStatus === 'Ready for Retest')
    .slice(0, 6);

  // Suggested next session focus
  let nextSessionFocus = 'Review your unresolved mistakes in the Retest Studio.';
  if (top3.length > 0) {
    const p1 = top3[0];
    nextSessionFocus = `Dedicate your next 45-minute block to ${p1.section} (${p1.topic}). Start by re-testing the ${p1.unresolved} unresolved question(s) in your log.`;
  }

  // Specific skills to revise
  const skillsToRevise = top3.map(t => `${t.section}: ${t.topic}`);

  return {
    topPriorities,
    nextSessionFocus,
    questionsToReviewAgain,
    skillsToRevise,
  };
}

/**
 * Computes performance improvement timeline over dates.
 */
export function computeImprovementTimeline(mistakes) {
  const byDate = {};

  for (const m of mistakes) {
    const date = m.date || 'Undated';
    if (!byDate[date]) {
      byDate[date] = { date, total: 0, fixed: 0, repeated: 0, unresolved: 0 };
    }
    byDate[date].total += 1;
    if (m.reviewStatus === 'Fixed') byDate[date].fixed += 1;
    else if (m.reviewStatus === 'Repeated Mistake') byDate[date].repeated += 1;
    else byDate[date].unresolved += 1;
  }

  return Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date));
}
