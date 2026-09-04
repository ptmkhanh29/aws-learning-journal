"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Flag } from "@phosphor-icons/react";
import { demoQuestion } from "@/data/practice";
import { text, type Locale } from "@/lib/i18n";

export function PracticeDemo({ locale }: { locale: Locale }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const isCorrect = selected === demoQuestion.correct;
  return (
    <div className="practice-demo">
      <div className="question-topline"><span>{locale === "en" ? "Question 12 of 20" : "Câu 12 / 20"}</span><button type="button" className="text-button"><Flag size={17} />{locale === "en" ? "Flag for review" : "Đánh dấu xem lại"}</button></div>
      <div className="question-progress" aria-label="60 percent complete"><span style={{ width: "60%" }} /></div>
      <fieldset disabled={checked}><legend>{text(demoQuestion.scenario, locale)}</legend><div className="answer-list">{demoQuestion.options.map((option) => { const state = checked && option.id === demoQuestion.correct ? "correct" : checked && option.id === selected ? "incorrect" : selected === option.id ? "selected" : ""; return <label className={`answer-option ${state}`} key={option.id}><input type="radio" name="answer" value={option.id} checked={selected === option.id} onChange={() => setSelected(option.id)} /><span className="answer-letter">{option.id.toUpperCase()}</span><span>{text(option.text, locale)}</span></label>; })}</div></fieldset>
      {checked ? <div className={`answer-explanation ${isCorrect ? "correct" : "incorrect"}`} role="status"><h2>{isCorrect ? (locale === "en" ? "That is correct" : "Chính xác") : (locale === "en" ? "Not quite" : "Chưa đúng")}</h2><p>{text(demoQuestion.explanation, locale)}</p></div> : null}
      <div className="question-actions"><Link className="button button-secondary" href={`/${locale}/practice`}><ArrowLeft size={18} />{locale === "en" ? "Previous" : "Quay lại"}</Link><button className="button" type="button" disabled={!selected} onClick={() => setChecked(true)}>{checked ? (locale === "en" ? "Next question" : "Câu tiếp theo") : (locale === "en" ? "Check answer" : "Kiểm tra")}<ArrowRight size={18} /></button></div>
    </div>
  );
}
