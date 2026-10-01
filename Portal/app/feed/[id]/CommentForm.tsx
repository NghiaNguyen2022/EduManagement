"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionary";

type Props = {
  postId: string;
  locale: Locale;
};

export default function CommentForm({ postId, locale }: Props) {
  const router = useRouter();
  const dictionary = getDictionary(locale).commentForm;
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/feed/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, comment, website }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? dictionary.errorGeneric);
        return;
      }

      setName("");
      setComment("");
      router.refresh();
    } catch {
      setError(dictionary.errorNetwork);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="form-error">{error}</div>}

      <div className="form-field">
        <label htmlFor="comment-name">{dictionary.nameLabel}</label>
        <input
          id="comment-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
      </div>

      <div className="form-field">
        <label htmlFor="comment-body">{dictionary.commentLabel}</label>
        <textarea
          id="comment-body"
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          required
        />
      </div>

      <div className="honeypot-field" aria-hidden="true">
        <label htmlFor="comment-website">Website</label>
        <input
          id="comment-website"
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
