"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionary";

type Props = {
  appSlug: string;
  locale: Locale;
};

export default function ReviewForm({ appSlug, locale }: Props) {
  const dictionary = getDictionary(locale).reviewForm;
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/app-portal/${appSlug}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, email, rating, comment, website }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? dictionary.errorGeneric);
        return;
      }

      setSubmitted(true);
      setName("");
      setPhone("");
      setEmail("");
      setRating(5);
      setComment("");
    } catch {
      setError(dictionary.errorNetwork);
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return <div className="form-success">{dictionary.success}</div>;
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="form-error">{error}</div>}

      <div className="star-picker" role="radiogroup" aria-label={dictionary.chooseRatingAriaLabel}>
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            className={value <= rating ? "active" : ""}
            aria-label={`${value} ${dictionary.starAriaLabel}`}
            aria-pressed={value === rating}
            onClick={() => setRating(value)}
          >
            {value <= rating ? "★" : "☆"}
          </button>
        ))}
      </div>

      <div className="form-field">
        <label htmlFor="review-name">{dictionary.nameLabel}</label>
        <input
          id="review-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
      </div>

      <div className="form-field">
        <label htmlFor="review-phone">{dictionary.phoneLabel}</label>
        <input id="review-phone" value={phone} onChange={(event) => setPhone(event.target.value)} />
      </div>

      <div className="form-field">
        <label htmlFor="review-email">{dictionary.emailLabel}</label>
        <input
          id="review-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>

      <div className="form-field">
        <label htmlFor="review-comment">{dictionary.commentLabel}</label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          required
        />
      </div>

      <div className="honeypot-field" aria-hidden="true">
        <label htmlFor="review-website">Website</label>
        <input
          id="review-website"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(event) => setWebsite(event.target.value)}
        />
      </div>

      <button className="button-submit" type="submit" disabled={submitting}>
        {submitting ? dictionary.submitting : dictionary.submit}
      </button>
    </form>
  );
}
