import { useId, useState } from "react";
import { IconMinus, IconPlus } from "./Icons.jsx";
import Reveal from "./Reveal.jsx";

/**
 * Accessible single-open FAQ accordion.
 *
 * Each question is a real button, so Enter/Space and screen-reader activation
 * work natively. The answer is removed from layout with `hidden` when closed
 * and flows to its natural height when open, so long answers are never clipped.
 */
export default function FaqAccordion({ items = [], defaultOpen = 0, className = "" }) {
  const [openIndex, setOpenIndex] = useState(defaultOpen);
  const baseId = useId();

  if (!items.length) return null;

  return (
    <div className={`faq ${className}`.trim()}>
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        const questionId = `${baseId}-question-${index}`;
        const answerId = `${baseId}-answer-${index}`;

        return (
          <Reveal key={`${item.q}-${index}`} className={`faq__item${isOpen ? " is-open" : ""}`}>
            <h3 className="faq__heading">
              <button
                type="button"
                id={questionId}
                className="faq__q"
                aria-expanded={isOpen}
                aria-controls={answerId}
                onClick={() => setOpenIndex(isOpen ? -1 : index)}
              >
                <span>{item.q}</span>
                <span className="faq__ic" aria-hidden="true">
                  {isOpen ? <IconMinus width={15} height={15} /> : <IconPlus width={15} height={15} />}
                </span>
              </button>
            </h3>
            <div
              id={answerId}
              className="faq__a"
              role="region"
              aria-labelledby={questionId}
              hidden={!isOpen}
            >
              <div className="faq__a-inner">{item.a}</div>
            </div>
          </Reveal>
        );
      })}
    </div>
  );
}
